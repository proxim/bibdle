"use client";

import { useEffect, useState } from "react";
import { MODES } from "@/lib/modes";
import { readStats } from "@/lib/stats";
import styles from "./StreakBadges.module.css";

interface Streak {
  id: string;
  icon: string;
  title: string;
  streak: number;
}

export default function StreakBadges() {
  const [mounted, setMounted] = useState(false);
  const [streaks, setStreaks] = useState<Streak[]>([]);

  useEffect(() => {
    setStreaks(
      MODES.map((m) => ({
        id: m.id,
        icon: m.icon,
        title: m.title,
        streak: readStats(m.id).currentStreak,
      }))
    );
    setMounted(true);
  }, []);

  // Render nothing during SSR / first paint to avoid hydration mismatch.
  if (!mounted) return null;

  const active = streaks.filter((s) => s.streak > 0);

  if (active.length === 0) {
    return <p className={styles.hint}>Start a streak today</p>;
  }

  return (
    <div className={styles.row} aria-label="Current streaks">
      {active.map((s) => (
        <span
          key={s.id}
          className={styles.badge}
          title={`${s.title}: ${s.streak}-day streak`}
        >
          <span aria-hidden="true">{s.icon}</span>
          <span className={styles.flame} aria-hidden="true">
            🔥
          </span>
          <span className={styles.count}>{s.streak}</span>
        </span>
      ))}
    </div>
  );
}
