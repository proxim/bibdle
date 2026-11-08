"use client";

import { useEffect, useState } from "react";
import { MODES } from "@/lib/modes";
import { readStats } from "@/lib/stats";
import styles from "./StreakBadges.module.css";

interface Streak {
  id: string;
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
    return <p className={styles.hint}>Solve any puzzle to start a streak.</p>;
  }

  return (
    <ul className={styles.row} aria-label="Current streaks">
      {active.map((s) => (
        <li key={s.id} title={`${s.title}: ${s.streak}-day streak`}>
          {s.title}
          <span className={styles.count}>{s.streak}</span>
        </li>
      ))}
    </ul>
  );
}
