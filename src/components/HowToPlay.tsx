"use client";

import { useState } from "react";
import type { ModeId } from "@/lib/daily";
import { BARD_ROUNDS } from "@/lib/daily";
import { MODES } from "@/lib/modes";
import Dialog from "./Dialog";
import dialogStyles from "./Dialog.module.css";
import styles from "./HowToPlay.module.css";

type Tone = "correct" | "partial" | "hollow" | "wrong" | "miss";

function Swatch({ tone }: { tone: Tone }) {
  return <span className={styles.swatch} data-tone={tone} aria-hidden="true" />;
}

interface RuleSection {
  id: ModeId;
  body: React.ReactNode;
}

const RULES: Record<ModeId, React.ReactNode> = {
  classic: (
    <>
      <p>Guess the Bible character. Each guess reveals trait tiles:</p>
      <p className={styles.traits}>
        Testament · Book · Role · Tribe/Nation · Era · Gender
      </p>
      <ul className={styles.legend}>
        <li>
          <Swatch tone="correct" /> correct
        </li>
        <li>
          <Swatch tone="partial" /> partial match (same book section /
          overlapping roles)
        </li>
        <li>
          <Swatch tone="wrong" /> wrong
        </li>
      </ul>
      <p>
        The Era tile shows <strong>↑ / ↓</strong> when the answer is earlier or
        later. Unlimited guesses.
      </p>
    </>
  ),
  quote: (
    <>
      <p>A quote is shown. Guess who said it.</p>
      <p>
        Each wrong guess reveals a new hint:{" "}
        <strong>book, then chapter, then first letter</strong>.
      </p>
    </>
  ),
  emoji: (
    <>
      <p>A character is shown as emojis.</p>
      <p>
        One emoji is revealed at first; each wrong guess reveals another. For
        example <span className={styles.example}>🐳 ? ?</span> →{" "}
        <span className={styles.example}>🐳 ⛵ ?</span>.
      </p>
    </>
  ),
  verse: (
    <>
      <p>A verse is shown. Guess which book of the Bible it is from.</p>
      <ul className={styles.legend}>
        <li>
          <Swatch tone="correct" /> correct book
        </li>
        <li>
          <Swatch tone="partial" /> right section
        </li>
        <li>
          <Swatch tone="hollow" /> right testament
        </li>
        <li>
          <Swatch tone="wrong" /> wrong testament
        </li>
      </ul>
      <p>
        The arrow (<strong>↑</strong> or <strong>↓</strong>) points toward the
        book&apos;s canonical position.
      </p>
    </>
  ),
  shakespeare: (
    <>
      <p>
        {BARD_ROUNDS} passages, one at a time. Each is either a verse from the
        Bible (KJV) or a line from Shakespeare. Call which.
      </p>
      <p>
        The catch: both speak in old, lofty English, so it&apos;s trickier than
        it sounds. You answer all of them, and your score is{" "}
        <strong>how many you call right</strong>.
      </p>
      <ul className={styles.legend}>
        <li>
          <Swatch tone="correct" /> called it right
        </li>
        <li>
          <Swatch tone="miss" /> fooled you
        </li>
      </ul>
    </>
  ),
};

interface Props {
  /** When set, this mode's rules are emphasized and shown first. */
  focusMode?: ModeId;
  onClose: () => void;
}

export default function HowToPlay({ focusMode, onClose }: Props) {
  // Focused mode first, then the rest.
  const ordered: RuleSection[] = MODES.map((m) => ({ id: m.id, body: RULES[m.id] }));
  if (focusMode) {
    ordered.sort((a, b) =>
      a.id === focusMode ? -1 : b.id === focusMode ? 1 : 0
    );
  }

  return (
    <Dialog
      labelledBy="how-to-play-title"
      onClose={onClose}
      className={styles.modal}
    >
      <h2 id="how-to-play-title" className={dialogStyles.title}>
        How to play
      </h2>
      <p className={styles.subtitle}>
        One puzzle per mode each day, the same for everyone.
      </p>

      <div className={styles.scroll}>
        {ordered.map(({ id, body }) => {
          const meta = MODES.find((m) => m.id === id)!;
          const focused = id === focusMode;
          return (
            <section key={id} className={styles.section}>
              <h3 className={styles.modeHeading}>
                {meta.title}
                {focused && <span className={styles.badge}>This mode</span>}
              </h3>
              <div className={styles.body}>{body}</div>
            </section>
          );
        })}

        <p className={styles.general}>
          Progress, streaks, and stats are saved locally on this device. Solve
          a puzzle to see your shareable result.
        </p>
      </div>
    </Dialog>
  );
}

interface TriggerProps {
  focusMode?: ModeId;
  className?: string;
}

/** Self-contained "How to play" trigger + modal. Safe to drop into server components. */
export function HelpButton({ focusMode, className }: TriggerProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className={`${styles.trigger} ${className ?? ""}`}
        onClick={() => setOpen(true)}
      >
        How to play
      </button>
      {open && <HowToPlay focusMode={focusMode} onClose={() => setOpen(false)} />}
    </>
  );
}
