"use client";

import { useMemo, useState } from "react";
import { dailyBardRound, BARD_ROUNDS } from "@/lib/daily";
import type { BardSource } from "@/data/types";
import { useDailyState } from "@/lib/useDailyState";
import { recordWin } from "@/lib/stats";
import ShareModal from "./ShareModal";
import styles from "./ShakespeareGame.module.css";

interface State {
  picks: (BardSource | null)[];
  won: boolean; // "won" == completed the run (used by streak + menu helpers)
}

const SOURCE_LABEL: Record<BardSource, string> = {
  scripture: "📖 Scripture",
  shakespeare: "🎭 Shakespeare",
};

function scoreTitle(score: number): string {
  if (score === BARD_ROUNDS) return "Perfect! 🏆";
  if (score >= BARD_ROUNDS / 2) return "Nice!";
  if (score > 0) return "Not bad!";
  return "Tough one!";
}

export default function ShakespeareGame() {
  const round = useMemo(() => dailyBardRound(), []);
  const [state, setState, hydrated] = useDailyState<State>("shakespeare", {
    picks: Array(BARD_ROUNDS).fill(null),
    won: false,
  });
  const [revealing, setRevealing] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const answered = state.picks.filter((p) => p !== null).length;
  const score = state.picks.reduce(
    (acc, pick, i) => acc + (pick !== null && pick === round[i].source ? 1 : 0),
    0
  );
  const done = answered >= BARD_ROUNDS;

  // While revealing we show the most recent answer; otherwise the next question.
  const activeIndex = revealing ? answered - 1 : answered;
  const passage = round[activeIndex];

  function handleChoose(choice: BardSource) {
    if (revealing || done) return;
    const idx = answered;
    setState((prev) => {
      const picks = [...prev.picks];
      picks[idx] = choice;
      return { ...prev, picks };
    });
    setRevealing(true);
    if (idx === BARD_ROUNDS - 1) {
      const finalScore =
        score + (choice === round[idx].source ? 1 : 0);
      recordWin("shakespeare", finalScore);
    }
  }

  function handleNext() {
    if (answered >= BARD_ROUNDS) {
      setState((prev) => ({ ...prev, won: true }));
      setRevealing(false);
      setTimeout(() => setShowShare(true), 400);
    } else {
      setRevealing(false);
    }
  }

  const shareGrid = [
    state.picks
      .map((p, i) => (p !== null && p === round[i].source ? "🟩" : "🟥"))
      .join(""),
  ];

  if (!hydrated) return <div className={styles.game} />;

  // Result screen — run complete and the reveal of the last answer dismissed.
  if (done && !revealing) {
    return (
      <div className={styles.game}>
        <div className={styles.result}>
          <span className={styles.resultScore}>
            {score}
            <span className={styles.resultTotal}>/{BARD_ROUNDS}</span>
          </span>
          <span className={styles.resultGrid}>{shareGrid[0]}</span>
          <span className={styles.resultLabel}>{scoreTitle(score)}</span>
          <button className={styles.shareLink} onClick={() => setShowShare(true)}>
            Share your result →
          </button>
        </div>

        {showShare && (
          <ShareModal
            mode="shakespeare"
            guessCount={score}
            grid={shareGrid}
            title={scoreTitle(score)}
            subtitle={`${score} / ${BARD_ROUNDS} correct`}
            onClose={() => setShowShare(false)}
          />
        )}
      </div>
    );
  }

  const correct = revealing && state.picks[activeIndex] === passage.source;

  return (
    <div className={styles.game}>
      <div className={styles.scorebar}>
        <span className={styles.round}>
          Round {Math.min(activeIndex + 1, BARD_ROUNDS)} / {BARD_ROUNDS}
        </span>
        <div className={styles.dots} aria-hidden="true">
          {round.map((p, i) => {
            const pick = state.picks[i];
            const cls =
              pick !== null
                ? pick === p.source
                  ? styles.dotCorrect
                  : styles.dotWrong
                : i === activeIndex && !revealing
                  ? styles.dotActive
                  : styles.dot;
            return <span key={p.id} className={`${styles.dotBase} ${cls}`} />;
          })}
        </div>
        <span className={styles.tally}>
          {score} correct
        </span>
      </div>

      <div
        className={`${styles.card} ${revealing ? styles.cardRevealed : ""}`}
        key={passage.id}
      >
        <blockquote className={styles.passage}>“{passage.text}”</blockquote>

        {revealing ? (
          <div className={styles.reveal}>
            <span
              className={`${styles.verdict} ${correct ? styles.verdictGood : styles.verdictBad}`}
            >
              {correct ? "✓ Correct" : "✗ Nope"}
            </span>
            <span className={styles.attribution}>
              {SOURCE_LABEL[passage.source]} — {passage.attribution}
            </span>
            <button className={styles.next} onClick={handleNext} autoFocus>
              {answered >= BARD_ROUNDS ? "See results →" : "Next →"}
            </button>
          </div>
        ) : (
          <div className={styles.choices}>
            <button
              className={`${styles.choice} ${styles.choiceScripture}`}
              onClick={() => handleChoose("scripture")}
            >
              📖 Scripture
            </button>
            <button
              className={`${styles.choice} ${styles.choiceShakespeare}`}
              onClick={() => handleChoose("shakespeare")}
            >
              🎭 Shakespeare
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
