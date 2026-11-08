"use client";

import type { GuessFeedback, TileResult } from "@/lib/compare";
import styles from "./GuessRow.module.css";

export const HEADER_LABELS = [
  "Character",
  "Testament",
  "Book",
  "Role",
  "Tribe/Nation",
  "Era",
  "Gender",
] as const;

const RESULT_CLASS: Record<TileResult, string> = {
  correct: styles.correct,
  partial: styles.partial,
  wrong: styles.wrong,
};

interface Props {
  feedback: GuessFeedback;
  /** Flip the tiles in. Only the guess just submitted should; stored rows are already settled. */
  animate?: boolean;
}

export default function GuessRow({ feedback, animate = false }: Props) {
  const { guess } = feedback;
  const eraHint =
    feedback.era.hint === "earlier"
      ? { arrow: "↑", text: "answer is earlier" }
      : feedback.era.hint === "later"
        ? { arrow: "↓", text: "answer is later" }
        : null;

  const tiles: { label: string; value: string; result: TileResult }[] = [
    { label: "Testament", value: guess.testament, result: feedback.testament },
    { label: "Book", value: guess.book, result: feedback.book },
    { label: "Role", value: guess.roles.join(", "), result: feedback.roles },
    { label: "Tribe/Nation", value: guess.tribeNation, result: feedback.tribeNation },
    { label: "Era", value: guess.era, result: feedback.era.result },
    { label: "Gender", value: guess.gender, result: feedback.gender },
  ];

  return (
    <div className={styles.row} role="row">
      <div className={`${styles.tile} ${styles.nameTile}`} role="cell">
        <span className={styles.nameEmoji} aria-hidden="true">
          {guess.emojis[0]}
        </span>
        <span>{guess.name}</span>
      </div>
      {tiles.map((tile, i) => {
        const hint = tile.label === "Era" ? eraHint : null;
        return (
          <div
            key={tile.label}
            role="cell"
            className={`${styles.tile} ${animate ? styles.flip : ""} ${RESULT_CLASS[tile.result]}`}
            style={animate ? { animationDelay: `calc(${i} * var(--flip-stagger))` } : undefined}
            aria-label={`${tile.label}: ${tile.value}${hint ? `, ${hint.text}` : ""}, ${tile.result}`}
          >
            <span className={styles.label} aria-hidden="true">
              {tile.label}
            </span>
            <span>
              {tile.value}
              {hint && (
                <span className={styles.arrow} aria-hidden="true">
                  {hint.arrow}
                </span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}
