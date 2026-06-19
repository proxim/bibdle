"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ModeId } from "@/lib/daily";
import { MODES } from "@/lib/modes";
import { buildShareText } from "@/lib/share";
import { isModeWonToday } from "@/lib/useDailyState";
import { readStats } from "@/lib/stats";
import Confetti from "./Confetti";
import styles from "./ShareModal.module.css";

interface Props {
  mode: ModeId;
  guessCount: number;
  grid: string[];
  onClose: () => void;
  /** Override the modal heading (e.g. score modes use "Nice!" / "8/8 — Perfect!"). */
  title?: string;
  /** Override the subtitle line (defaults to "{guessCount} guesses"). */
  subtitle?: string;
}

export default function ShareModal({
  mode,
  guessCount,
  grid,
  onClose,
  title,
  subtitle,
}: Props) {
  const [toast, setToast] = useState(false);
  const shareText = buildShareText(mode, guessCount, grid);
  const stats = readStats(mode);
  const winRate = stats.played ? Math.round((stats.wins / stats.played) * 100) : 0;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

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
      setToast(true);
      setTimeout(() => setToast(false), 1800);
    } catch {
      // clipboard blocked; nothing else to do
    }
  }

  // Other modes the player hasn't solved yet today, surfaced for quick switching.
  const otherModes = MODES.filter((m) => m.id !== mode);

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <Confetti />
        <button className={styles.close} onClick={onClose} aria-label="Close">
          ×
        </button>

        <h2 className={styles.title}>{title ?? "Solved!"}</h2>
        <p className={styles.subtitle}>
          {subtitle ?? `${guessCount} ${guessCount === 1 ? "guess" : "guesses"}`}
        </p>

        <pre className={styles.grid}>{grid.join("\n")}</pre>

        <dl className={styles.stats}>
          <div className={styles.stat}>
            <dt>{stats.played}</dt>
            <dd>Played</dd>
          </div>
          <div className={styles.stat}>
            <dt>{winRate}%</dt>
            <dd>Win rate</dd>
          </div>
          <div className={styles.stat}>
            <dt>{stats.currentStreak}</dt>
            <dd>Streak</dd>
          </div>
          <div className={styles.stat}>
            <dt>{stats.maxStreak}</dt>
            <dd>Max</dd>
          </div>
        </dl>

        <button className={styles.shareBtn} onClick={handleShare}>
          📋 Copy result
        </button>

        <div className={styles.switch}>
          <span className={styles.switchLabel}>Keep playing</span>
          <div className={styles.modeList}>
            {otherModes.map((m) => {
              const played = isModeWonToday(m.id);
              return (
                <Link
                  key={m.id}
                  href={`/${m.id}`}
                  className={`${styles.modeChip} ${played ? styles.modePlayed : ""}`}
                >
                  <span className={styles.modeIcon}>{m.icon}</span>
                  <span>{m.title}</span>
                  <span className={styles.modeStatus}>
                    {played ? "✓ done" : "play →"}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {toast && <div className={styles.toast}>Copied to clipboard!</div>}
      </div>
    </div>
  );
}
