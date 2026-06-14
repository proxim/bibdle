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

export default function GuessRow({ feedback }: { feedback: GuessFeedback }) {
  const { guess } = feedback;
  const eraArrow =
    feedback.era.hint === "earlier" ? " ⬆️" : feedback.era.hint === "later" ? " ⬇️" : "";

  const tiles: { label: string; value: string; result: TileResult }[] = [
    { label: "Testament", value: guess.testament, result: feedback.testament },
    { label: "Book", value: guess.book, result: feedback.book },
    { label: "Role", value: guess.roles.join(", "), result: feedback.roles },
    { label: "Tribe/Nation", value: guess.tribeNation, result: feedback.tribeNation },
    { label: "Era", value: guess.era + eraArrow, result: feedback.era.result },
    { label: "Gender", value: guess.gender, result: feedback.gender },
  ];

  return (
    <div className={styles.row} role="row">
      <div className={`${styles.tile} ${styles.nameTile}`} role="cell">
        <span className={styles.nameEmoji}>{guess.emojis[0]}</span>
        <span>{guess.name}</span>
      </div>
      {tiles.map((tile, i) => (
        <div
          key={tile.label}
          role="cell"
          className={`${styles.tile} ${styles.flip} ${RESULT_CLASS[tile.result]}`}
          style={{ animationDelay: `calc(${i} * var(--flip-stagger))` }}
          aria-label={`${tile.label}: ${tile.value} — ${tile.result}`}
        >
          {tile.value}
        </div>
      ))}
    </div>
  );
}
