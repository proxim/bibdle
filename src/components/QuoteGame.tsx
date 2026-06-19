"use client";

import { useMemo, useState } from "react";
import { CHARACTERS, characterById } from "@/data/characters";
import type { Character } from "@/data/types";
import { dailyQuote } from "@/lib/daily";
import { useDailyState } from "@/lib/useDailyState";
import { recordWin } from "@/lib/stats";
import { getText } from "@/data/translations";
import { POPULATED_VERSIONS, useBibleVersion } from "@/lib/version";
import CharacterSearch from "./CharacterSearch";
import CharacterChat from "./CharacterChat";
import ShareModal from "./ShareModal";
import styles from "./GuessGame.module.css";

interface State {
  wrongIds: string[];
  won: boolean;
}

export default function QuoteGame() {
  const { character: answer, quote } = useMemo(() => dailyQuote(), []);
  const [state, setState, hydrated] = useDailyState<State>("quote", {
    wrongIds: [],
    won: false,
  });
  const [showShare, setShowShare] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const { version, mounted: versionMounted } = useBibleVersion();

  const quoteText = getText(quote.reference, quote.text, version);
  const showVersionNote =
    versionMounted && !POPULATED_VERSIONS.includes(version);

  const wrong = state.wrongIds
    .map((id) => characterById.get(id))
    .filter((c): c is Character => Boolean(c));

  const [book, chapter] = quote.reference.match(/^(.+?) (\d+)/)?.slice(1) ?? [
    quote.reference,
    "?",
  ];
  const hints = [
    `📚 Book: ${book}`,
    `🔖 Chapter: ${chapter}`,
    `🔤 Starts with “${answer.name[0]}”`,
  ].slice(0, wrong.length);

  const guessedIds = new Set(state.wrongIds);
  const remaining = CHARACTERS.filter((c) => !guessedIds.has(c.id));

  function handleGuess(character: Character) {
    if (state.won) return;
    if (character.id === answer.id) {
      setState((prev) => ({ ...prev, won: true }));
      recordWin("quote", wrong.length + 1);
      setTimeout(() => setShowShare(true), 700);
    } else {
      setState((prev) => ({ ...prev, wrongIds: [character.id, ...prev.wrongIds] }));
    }
  }

  const guessCount = wrong.length + 1;
  const shareGrid = ["⬛".repeat(wrong.length) + "🟩"];

  if (!hydrated) return <div className={styles.game} />;

  return (
    <div className={styles.game}>
      <blockquote className={styles.prompt}>“{quoteText}”</blockquote>

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
          <span className={styles.winName}>
            🎉 {answer.name} — {quote.reference}
          </span>
          <div className={styles.winActions}>
            <button className={styles.chatLink} onClick={() => setShowChat(true)}>
              💬 Talk to {answer.name} →
            </button>
            <button className={styles.shareLink} onClick={() => setShowShare(true)}>
              Share your result →
            </button>
          </div>
        </div>
      ) : (
        <CharacterSearch options={remaining} onSelect={handleGuess} />
      )}

      {wrong.length > 0 && (
        <div className={styles.wrongList} aria-label="Wrong guesses">
          {wrong.map((c) => (
            <span key={c.id} className={styles.wrongChip}>
              {c.name}
            </span>
          ))}
        </div>
      )}

      {showChat && (
        <CharacterChat
          character={answer}
          mode="quote"
          onClose={() => setShowChat(false)}
        />
      )}

      {showShare && (
        <ShareModal
          mode="quote"
          guessCount={guessCount}
          grid={shareGrid}
          chatName={answer.name}
          onChat={() => {
            setShowShare(false);
            setShowChat(true);
          }}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}
