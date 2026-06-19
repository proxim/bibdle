"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { ModeId } from "@/lib/daily";
import { BARD_ROUNDS } from "@/lib/daily";
import { MODES } from "@/lib/modes";
import styles from "./HowToPlay.module.css";

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
          <span className={styles.sq}>🟩</span> correct
        </li>
        <li>
          <span className={styles.sq}>🟨</span> partial match (same book section /
          overlapping roles)
        </li>
        <li>
          <span className={styles.sq}>⬛</span> wrong
        </li>
      </ul>
      <p>
        The Era tile shows <strong>⬆️ / ⬇️</strong> when the answer is earlier or
        later. Unlimited guesses.
      </p>
    </>
  ),
  quote: (
    <>
      <p>A quote is shown — guess who said it.</p>
      <p>
        Each wrong guess reveals a new hint:{" "}
        <strong>book → chapter → first letter</strong>.
      </p>
    </>
  ),
  emoji: (
    <>
      <p>A character is shown as emojis.</p>
      <p>
        One emoji is revealed at first; each wrong guess reveals another. For
        example <span className={styles.example}>🐳 ❓ ❓</span> →{" "}
        <span className={styles.example}>🐳 ⛵ ❓</span>.
      </p>
    </>
  ),
  verse: (
    <>
      <p>A verse is shown — guess which book of the Bible it is from.</p>
      <ul className={styles.legend}>
        <li>
          <span className={styles.sq}>🟩</span> correct book
        </li>
        <li>
          <span className={styles.sq}>🟨</span> right section
        </li>
        <li>
          <span className={styles.sq}>🟧</span> right testament
        </li>
        <li>
          <span className={styles.sq}>⬛</span> wrong testament
        </li>
      </ul>
      <p>
        A <strong>⬆️ / ⬇️</strong> arrow points toward the book&apos;s canonical
        position.
      </p>
    </>
  ),
  shakespeare: (
    <>
      <p>
        {BARD_ROUNDS} passages, one at a time. Each is either a verse from the
        Bible (KJV) or a line from Shakespeare — call which.
      </p>
      <p>
        The catch: both speak in old, lofty English, so it&apos;s trickier than
        it sounds. You answer all of them; your score is{" "}
        <strong>how many you call right</strong>.
      </p>
      <ul className={styles.legend}>
        <li>
          <span className={styles.sq}>🟩</span> called it right
        </li>
        <li>
          <span className={styles.sq}>🟥</span> fooled you
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
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Focused mode first, then the rest.
  const ordered: RuleSection[] = MODES.map((m) => ({ id: m.id, body: RULES[m.id] }));
  if (focusMode) {
    ordered.sort((a, b) =>
      a.id === focusMode ? -1 : b.id === focusMode ? 1 : 0
    );
  }

  // Render in a portal at <body> so the fixed overlay escapes any ancestor
  // stacking context (e.g. the ModePage header) and always sits on top.
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="How to play"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose} aria-label="Close">
          ×
        </button>

        <h2 className={styles.title}>How to play</h2>
        <p className={styles.subtitle}>
          One puzzle per mode each day — the same for everyone.
        </p>

        <div className={styles.scroll}>
          {ordered.map(({ id, body }) => {
            const meta = MODES.find((m) => m.id === id)!;
            const focused = id === focusMode;
            return (
              <section
                key={id}
                className={`${styles.section} ${focused ? styles.focused : ""}`}
              >
                <h3 className={styles.modeHeading}>
                  <span className={styles.modeIcon}>{meta.icon}</span>
                  {meta.title}
                  {focused && <span className={styles.badge}>this mode</span>}
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
      </div>
    </div>,
    document.body
  );
}

interface TriggerProps {
  focusMode?: ModeId;
  className?: string;
  /** Render as a plain text link (home footer) instead of an icon button. */
  variant?: "icon" | "link";
}

/** Self-contained "?" trigger + modal. Safe to drop into server components. */
export function HelpButton({ focusMode, className, variant = "icon" }: TriggerProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className={`${variant === "icon" ? styles.trigger : styles.triggerLink} ${
          className ?? ""
        }`}
        onClick={() => setOpen(true)}
        aria-label="How to play"
      >
        {variant === "icon" ? "?" : "How to play"}
      </button>
      {open && <HowToPlay focusMode={focusMode} onClose={() => setOpen(false)} />}
    </>
  );
}
