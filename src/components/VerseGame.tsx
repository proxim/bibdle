"use client";

import { useMemo, useState } from "react";
import { BOOKS, bookByName } from "@/data/books";
import type { Book } from "@/data/types";
import { dailyVerse } from "@/lib/daily";
import { useDailyState } from "@/lib/useDailyState";
import { recordWin } from "@/lib/stats";
import { getText } from "@/data/translations";
import { POPULATED_VERSIONS, useBibleVersion } from "@/lib/version";
import BookSearch from "./BookSearch";
import ShareModal from "./ShareModal";
import styles from "./GuessGame.module.css";
import verseStyles from "./VerseGame.module.css";

type Result = "correct" | "section" | "testament" | "wrong";

interface State {
  guessedNames: string[];
  won: boolean;
}

const RESULT_EMOJI: Record<Result, string> = {
  correct: "🟩",
  section: "🟨",
  testament: "🟧",
  wrong: "⬛",
};

function evaluate(book: Book, answer: Book): { result: Result; direction: "earlier" | "later" | null } {
  const result: Result =
    book.name === answer.name
      ? "correct"
      : book.section === answer.section
        ? "section"
        : book.testament === answer.testament
          ? "testament"
          : "wrong";
  const direction =
    book.name === answer.name ? null : answer.order < book.order ? "earlier" : "later";
  return { result, direction };
}

export default function VerseGame() {
  const verse = useMemo(() => dailyVerse(), []);
  const answerBook = bookByName.get(verse.book)!;
  const [state, setState, hydrated] = useDailyState<State>("verse", {
    guessedNames: [],
    won: false,
  });
  const [showShare, setShowShare] = useState(false);
  const { version, mounted: versionMounted } = useBibleVersion();

  const verseText = getText(verse.reference, verse.text, version);
  const showVersionNote =
    versionMounted && !POPULATED_VERSIONS.includes(version);

  const guesses = state.guessedNames
    .map((name) => bookByName.get(name))
    .filter((b): b is Book => Boolean(b))
    .map((b) => ({ book: b, ...evaluate(b, answerBook) }));

  const wrongCount = guesses.filter((g) => g.result !== "correct").length;
  const hints = [
    `📜 Testament: ${answerBook.testament}`,
    `📚 Section: ${answerBook.section}`,
    `🔢 The book has ${answerBook.chapters} chapters`,
  ].slice(0, wrongCount);

  const guessedSet = new Set(state.guessedNames);
  const remaining = BOOKS.filter((b) => !guessedSet.has(b.name));

  function handleGuess(book: Book) {
    if (state.won) return;
    const isWin = book.name === answerBook.name;
    setState((prev) => ({
      guessedNames: [book.name, ...prev.guessedNames],
      won: prev.won || isWin,
    }));
    if (isWin) {
      recordWin("verse", state.guessedNames.length + 1);
      setTimeout(() => setShowShare(true), 700);
    }
  }

  const shareGrid = guesses
    .slice()
    .reverse()
    .map((g) => RESULT_EMOJI[g.result]);

  if (!hydrated) return <div className={styles.game} />;

  return (
    <div className={styles.game}>
      <blockquote className={styles.prompt}>“{verseText}”</blockquote>

      {showVersionNote && (
        <p className={styles.versionNote}>{version} coming soon — showing KJV</p>
      )}

      {hints.length > 0 && !state.won && (
        <div className={styles.hints}>
          {hints.map((h) => (
            <span key={h} className={styles.hint}>
              {h}
            </span>
          ))}
        </div>
      )}

      {state.won ? (
        <div className={styles.winBanner}>
          <span className={styles.winName}>🎉 {verse.reference}</span>
          <button className={styles.shareLink} onClick={() => setShowShare(true)}>
            Share your result →
          </button>
        </div>
      ) : (
        <BookSearch options={remaining} onSelect={handleGuess} />
      )}

      {guesses.length > 0 && (
        <ul className={verseStyles.guessList} aria-label="Guesses">
          {guesses.map((g) => (
            <li
              key={g.book.name}
              className={`${verseStyles.guessRow} ${verseStyles[g.result]}`}
            >
              <span className={verseStyles.guessName}>{g.book.name}</span>
              <span className={verseStyles.guessDetail}>
                {g.result === "correct" && "✅ Correct!"}
                {g.result === "section" && `🟡 Right section (${g.book.section})`}
                {g.result === "testament" && "🟠 Right testament"}
                {g.result === "wrong" && "❌ Wrong testament"}
              </span>
              {g.direction && (
                <span className={verseStyles.guessArrow}>
                  {g.direction === "earlier" ? "⬆️ Earlier" : "⬇️ Later"}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      {showShare && (
        <ShareModal
          mode="verse"
          guessCount={guesses.length}
          grid={shareGrid}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}
