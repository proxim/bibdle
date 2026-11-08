"use client";

import { useId, useMemo, useState } from "react";
import { dailyBardRound, BARD_ROUNDS } from "@/lib/daily";
import type { BardSource } from "@/data/types";
import { useDailyState } from "@/lib/useDailyState";
import { recordWin } from "@/lib/stats";
import ResultPanel from "./ResultPanel";
import ShareModal from "./ShareModal";
import buttons from "./buttons.module.css";
import styles from "./ShakespeareGame.module.css";

interface State {
  picks: (BardSource | null)[];
  won: boolean; // "won" == completed the run (used by streak + menu helpers)
}

const SOURCE_LABEL: Record<BardSource, string> = {
  scripture: "Scripture",
  shakespeare: "Shakespeare",
};

function scoreTitle(score: number): string {
  if (score === BARD_ROUNDS) return "Perfect score";
  if (score >= BARD_ROUNDS / 2) return "Solid run";
  if (score > 0) return "A few right";
  return "Tough set";
}

export default function ShakespeareGame() {
  const round = useMemo(() => dailyBardRound(), []);
  const [state, setState, hydrated] = useDailyState<State>("shakespeare", {
    picks: Array(BARD_ROUNDS).fill(null),
    won: false,
  });
  const [revealing, setRevealing] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const revealId = useId();

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

  // Result screen: run complete and the reveal of the last answer dismissed.
  if (done && !revealing) {
    return (
      <div className={styles.game}>
        <ResultPanel
          eyebrow={scoreTitle(score)}
          title={`${score} of ${BARD_ROUNDS} correct`}
        >
          <button className={buttons.primary} onClick={() => setShowShare(true)}>
            Share result
          </button>
        </ResultPanel>

        {showShare && (
          <ShareModal
            mode="shakespeare"
            guessCount={score}
            grid={shareGrid}
            title={scoreTitle(score)}
            subtitle={`${score} of ${BARD_ROUNDS} correct`}
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
          Round {Math.min(activeIndex + 1, BARD_ROUNDS)} of {BARD_ROUNDS}
        </span>
        <div className={styles.pips} aria-hidden="true">
          {round.map((p, i) => {
            const pick = state.picks[i];
            const tone =
              pick !== null
                ? pick === p.source
                  ? styles.pipCorrect
                  : styles.pipWrong
                : i === activeIndex && !revealing
                  ? styles.pipActive
                  : "";
            return <span key={p.id} className={`${styles.pip} ${tone}`} />;
          })}
        </div>
        <span className={styles.tally}>{score} correct</span>
      </div>

      <div className={styles.roundCard} key={passage.id}>
        <blockquote className={styles.passage}>“{passage.text}”</blockquote>

        {revealing ? (
          <div className={styles.reveal}>
            <span
              id={`${revealId}-verdict`}
              className={`${styles.verdict} ${correct ? styles.verdictGood : styles.verdictBad}`}
            >
              {correct ? "Correct" : "Not quite"}
            </span>
            <span id={`${revealId}-source`} className={styles.source}>
              {SOURCE_LABEL[passage.source]}
            </span>
            <span className={styles.attribution}>{passage.attribution}</span>
            <button
              className={`${buttons.primary} ${styles.next}`}
              onClick={handleNext}
              aria-describedby={`${revealId}-verdict ${revealId}-source`}
              autoFocus
            >
              {answered >= BARD_ROUNDS ? "See result" : "Next passage"}
            </button>
          </div>
        ) : (
          <div className={styles.choices}>
            <button className={styles.choice} onClick={() => handleChoose("scripture")}>
              Scripture
            </button>
            <button className={styles.choice} onClick={() => handleChoose("shakespeare")}>
              Shakespeare
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
