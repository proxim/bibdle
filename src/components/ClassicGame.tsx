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
import CharacterChat from "./CharacterChat";
import GuessRow, { HEADER_LABELS } from "./GuessRow";
import ResultPanel from "./ResultPanel";
import ShareModal from "./ShareModal";
import buttons from "./buttons.module.css";
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
  const [showChat, setShowChat] = useState(false);
  // The guess submitted this session; only its row plays the flip animation.
  const [freshId, setFreshId] = useState<string | null>(null);

  const feedbacks = state.guessedIds
    .map((id) => characterById.get(id))
    .filter((c): c is Character => Boolean(c))
    .map((c) => compareGuess(c, answer));

  const guessedSet = new Set(state.guessedIds);
  const remaining = CHARACTERS.filter((c) => !guessedSet.has(c.id));

  function handleGuess(character: Character) {
    if (state.won) return;
    const isWin = character.id === answer.id;
    setFreshId(character.id);
    setState((prev) => ({
      guessedIds: [character.id, ...prev.guessedIds],
      won: prev.won || isWin,
    }));
    if (isWin) {
      recordWin("classic", state.guessedIds.length + 1);
      setTimeout(() => setShowShare(true), 1400);
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
        <ResultPanel
          eyebrow={`Solved in ${feedbacks.length} ${feedbacks.length === 1 ? "guess" : "guesses"}`}
          title={answer.name}
        >
          <button className={buttons.primary} onClick={() => setShowShare(true)}>
            Share result
          </button>
          <button className={buttons.secondary} onClick={() => setShowChat(true)}>
            Talk to {answer.name}
          </button>
        </ResultPanel>
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
            <GuessRow key={g.guess.id} feedback={g} animate={g.guess.id === freshId} />
          ))}
        </div>
      )}

      <p className={styles.count}>
        {feedbacks.length === 0
          ? `${CHARACTERS.length} possible characters`
          : `${feedbacks.length} ${feedbacks.length === 1 ? "guess" : "guesses"}`}
      </p>

      {showChat && (
        <CharacterChat
          character={answer}
          mode="classic"
          onClose={() => setShowChat(false)}
        />
      )}

      {showShare && (
        <ShareModal
          mode="classic"
          guessCount={feedbacks.length}
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
