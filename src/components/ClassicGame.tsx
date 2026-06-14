"use client";

import { useMemo, useState } from "react";
import { CHARACTERS, characterById } from "@/data/characters";
import type { Character } from "@/data/types";
import { dailyCharacter } from "@/lib/daily";
import { compareGuess } from "@/lib/compare";
import { TILE_EMOJI } from "@/lib/share";
import { useDailyState } from "@/lib/useDailyState";
import { recordWin } from "@/lib/stats";
import CharacterSearch from "./CharacterSearch";
import GuessRow, { HEADER_LABELS } from "./GuessRow";
import ShareModal from "./ShareModal";
import styles from "./ClassicGame.module.css";

interface State {
  guessedIds: string[];
  won: boolean;
}

export default function ClassicGame() {
  const answer = useMemo(() => dailyCharacter("classic"), []);
  const [state, setState, hydrated] = useDailyState<State>("classic", {
    guessedIds: [],
    won: false,
  });
  const [showShare, setShowShare] = useState(false);

  const feedbacks = state.guessedIds
    .map((id) => characterById.get(id))
    .filter((c): c is Character => Boolean(c))
    .map((c) => compareGuess(c, answer));

  const guessedSet = new Set(state.guessedIds);
  const remaining = CHARACTERS.filter((c) => !guessedSet.has(c.id));

  function handleGuess(character: Character) {
    if (state.won) return;
    const isWin = character.id === answer.id;
    setState((prev) => ({
      guessedIds: [character.id, ...prev.guessedIds],
      won: prev.won || isWin,
    }));
    if (isWin) {
      recordWin("classic", state.guessedIds.length + 1);
      setTimeout(() => setShowShare(true), 900);
    }
  }

  const shareGrid = feedbacks
    .slice()
    .reverse()
    .map((f) =>
      [f.testament, f.book, f.roles, f.tribeNation, f.era.result, f.gender]
        .map((r) => TILE_EMOJI[r])
        .join("")
    );

  if (!hydrated) return <div className={styles.game} />;

  return (
    <div className={styles.game}>
      {!state.won && <CharacterSearch options={remaining} onSelect={handleGuess} />}

      {state.won && (
        <div className={styles.winBanner}>
          <span className={styles.winName}>
            🎉 {answer.name} in {feedbacks.length}{" "}
            {feedbacks.length === 1 ? "guess" : "guesses"}!
          </span>
          <button className={styles.shareLink} onClick={() => setShowShare(true)}>
            Share your result →
          </button>
        </div>
      )}

      {feedbacks.length > 0 && (
        <div className={styles.board} role="table" aria-label="Guesses">
          <div className={styles.headerRow} role="row">
            {HEADER_LABELS.map((label) => (
              <span key={label} role="columnheader" className={styles.headerCell}>
                {label}
              </span>
            ))}
          </div>
          {feedbacks.map((g) => (
            <GuessRow key={g.guess.id} feedback={g} />
          ))}
        </div>
      )}

      <p className={styles.count}>
        {feedbacks.length === 0
          ? `${CHARACTERS.length} possible characters`
          : `${feedbacks.length} ${feedbacks.length === 1 ? "guess" : "guesses"} so far`}
      </p>

      {showShare && (
        <ShareModal
          mode="classic"
          guessCount={feedbacks.length}
          grid={shareGrid}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}
