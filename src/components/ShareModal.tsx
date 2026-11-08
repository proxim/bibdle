"use client";

import { useId, useState } from "react";
import Link from "next/link";
import type { ModeId } from "@/lib/daily";
import { MODES } from "@/lib/modes";
import { buildShareText } from "@/lib/share";
import { isModeWonToday } from "@/lib/useDailyState";
import { readStats } from "@/lib/stats";
import Confetti from "./Confetti";
import Dialog from "./Dialog";
import buttons from "./buttons.module.css";
import dialogStyles from "./Dialog.module.css";
import styles from "./ShareModal.module.css";

interface Props {
  mode: ModeId;
  guessCount: number;
  grid: string[];
  onClose: () => void;
  /** Override the modal heading (score modes pass a verdict instead of "Solved"). */
  title?: string;
  /** Override the subtitle line (defaults to "{guessCount} guesses"). */
  subtitle?: string;
  /** Name of the character to chat with; enables the "Talk to X" button. */
  chatName?: string;
  /** Opens the character chat (provided alongside chatName by character modes). */
  onChat?: () => void;
}

export default function ShareModal({
  mode,
  guessCount,
  grid,
  onClose,
  title,
  subtitle,
  chatName,
  onChat,
}: Props) {
  const [copied, setCopied] = useState(false);
  const titleId = useId();
  const shareText = buildShareText(mode, guessCount, grid);
  const stats = readStats(mode);
  const winRate = stats.played ? Math.round((stats.wins / stats.played) * 100) : 0;

  // Use the native share sheet only on real phones/tablets — where the PRIMARY
  // pointer is touch and there's no hover. Plain `maxTouchPoints > 0` is wrong:
  // touchscreen laptops/desktops report it too, and there we want a clipboard
  // copy, not the share sheet.
  const isMobile =
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: coarse)").matches &&
    window.matchMedia("(hover: none)").matches;

  async function handleShare() {
    if (isMobile && typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ text: shareText });
        return;
      } catch {
        // user cancelled or unsupported — fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard blocked; nothing else to do
    }
  }

  // Other modes the player hasn't solved yet today, surfaced for quick switching.
  const otherModes = MODES.filter((m) => m.id !== mode);

  return (
    <Dialog labelledBy={titleId} onClose={onClose}>
      <Confetti />

      <h2 id={titleId} className={dialogStyles.title}>
        {title ?? "Solved"}
      </h2>
      <p className={styles.subtitle}>
        {subtitle ?? `${guessCount} ${guessCount === 1 ? "guess" : "guesses"}`}
      </p>

      <pre className={styles.grid}>{grid.join("\n")}</pre>

      <dl className={styles.stats}>
        <div className={styles.stat}>
          <dt>Played</dt>
          <dd>{stats.played}</dd>
        </div>
        <div className={styles.stat}>
          <dt>Win rate</dt>
          <dd>{winRate}%</dd>
        </div>
        <div className={styles.stat}>
          <dt>Streak</dt>
          <dd>{stats.currentStreak}</dd>
        </div>
        <div className={styles.stat}>
          <dt>Best streak</dt>
          <dd>{stats.maxStreak}</dd>
        </div>
      </dl>

      <div className={styles.actions}>
        <button
          className={buttons.primary}
          onClick={handleShare}
          aria-live="polite"
          data-autofocus
        >
          {copied ? "Copied" : "Copy result"}
        </button>
        {chatName && onChat && (
          <button className={buttons.secondary} onClick={onChat}>
            Talk to {chatName}
          </button>
        )}
      </div>

      <div className={styles.switch}>
        <h3 className={styles.switchLabel}>Play next</h3>
        <ul className={styles.modeList}>
          {otherModes.map((m) => {
            const played = isModeWonToday(m.id);
            return (
              <li key={m.id} className={played ? styles.modePlayed : ""}>
                <Link href={`/${m.id}`} className={styles.modeLink}>
                  <span>{m.title}</span>
                  <span className={styles.modeStatus}>{played ? "Done" : "Play"}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </Dialog>
  );
}
