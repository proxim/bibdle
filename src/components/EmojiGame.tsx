"use client";

import { useMemo, useState } from "react";
import { CHARACTERS, characterById } from "@/data/characters";
import type { Character } from "@/data/types";
import { dailyCharacter } from "@/lib/daily";
import { useDailyState } from "@/lib/useDailyState";
import { recordWin } from "@/lib/stats";
import CharacterSearch from "./CharacterSearch";
import ShareModal from "./ShareModal";
import styles from "./GuessGame.module.css";

interface State {
  wrongIds: string[];
  won: boolean;
}

export default function EmojiGame() {
  const answer = useMemo(() => dailyCharacter("emoji"), []);
  const [state, setState, hydrated] = useDailyState<State>("emoji", {
    wrongIds: [],
    won: false,
  });
  const [showShare, setShowShare] = useState(false);

  const wrong = state.wrongIds
    .map((id) => characterById.get(id))
    .filter((c): c is Character => Boolean(c));

  const revealed = state.won
    ? answer.emojis.length
    : Math.min(wrong.length + 1, answer.emojis.length);

  const guessedIds = new Set(state.wrongIds);
  const remaining = CHARACTERS.filter((c) => !guessedIds.has(c.id));

  function handleGuess(character: Character) {
    if (state.won) return;
    if (character.id === answer.id) {
      setState((prev) => ({ ...prev, won: true }));
      recordWin("emoji", wrong.length + 1);
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
      <div className={styles.emojiRow} aria-label="Emoji clues">
        {answer.emojis.map((emoji, i) =>
          i < revealed ? (
            <span
              key={i}
              className={styles.emojiTile}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {emoji}
            </span>
          ) : (
            <span key={i} className={`${styles.emojiTile} ${styles.emojiHidden}`}>
              ?
            </span>
          )
        )}
      </div>

      {state.won ? (
        <div className={styles.winBanner}>
          <span className={styles.winName}>🎉 {answer.name}!</span>
          <button className={styles.shareLink} onClick={() => setShowShare(true)}>
            Share your result →
          </button>
        </div>
      ) : (
        <>
          <p className={styles.count}>Each wrong guess reveals another emoji</p>
          <CharacterSearch
            options={remaining}
            onSelect={handleGuess}
            showEmoji={false}
          />
        </>
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

      {showShare && (
        <ShareModal
          mode="emoji"
          guessCount={guessCount}
          grid={shareGrid}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}
