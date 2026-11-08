"use client";

import { useId, useMemo, useSyncExternalStore } from "react";
import { useHydrated } from "@/lib/useHydrated";
import { MODES } from "@/lib/modes";
import { readStats } from "@/lib/stats";
import styles from "./StreakBadges.module.css";

interface Streak {
  id: string;
  title: string;
  streak: number;
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

// Serialized so the snapshot is a stable primitive between renders.
function getSnapshot(): string {
  return JSON.stringify(
    MODES.map((m) => ({
      id: m.id,
      title: m.title,
      streak: readStats(m.id).currentStreak,
    }))
  );
}

export default function StreakBadges() {
  const labelId = useId();
  const mounted = useHydrated();
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => "[]");
  const streaks = useMemo(() => JSON.parse(snapshot) as Streak[], [snapshot]);

  // Render nothing during SSR / first paint to avoid hydration mismatch.
  if (!mounted) return null;

  const active = streaks.filter((s) => s.streak > 0);

  if (active.length === 0) {
    return <p className={styles.hint}>Solve any puzzle to start a streak.</p>;
  }

  return (
    <div className={styles.streaks}>
      <p className={styles.label} id={labelId}>
        Streak
      </p>
      <ul className={styles.row} aria-labelledby={labelId}>
        {active.map((s) => (
          <li key={s.id} title={`${s.title}: ${s.streak}-day streak`}>
            {s.title}
            <span className={styles.count}>{s.streak}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
