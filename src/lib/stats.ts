"use client";

import { dateKey, type ModeId } from "./daily";

export interface ModeStats {
  played: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
  lastWonDate: string | null; // date key of the most recent win
  guessDistribution: Record<number, number>; // guessCount -> times
}

const STATS_PREFIX = "bibdle:stats";

function statsKey(mode: ModeId) {
  return `${STATS_PREFIX}:${mode}`;
}

function emptyStats(): ModeStats {
  return {
    played: 0,
    wins: 0,
    currentStreak: 0,
    maxStreak: 0,
    lastWonDate: null,
    guessDistribution: {},
  };
}

export function readStats(mode: ModeId): ModeStats {
  try {
    const raw = localStorage.getItem(statsKey(mode));
    if (!raw) return emptyStats();
    return { ...emptyStats(), ...(JSON.parse(raw) as Partial<ModeStats>) };
  } catch {
    return emptyStats();
  }
}

function yesterdayKey(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() - 1);
  return dateKey(date);
}

/**
 * Records a win exactly once per mode per day. Idempotent: calling it again for
 * the same day (e.g. reopening the share popup) does not double-count.
 */
export function recordWin(
  mode: ModeId,
  guessCount: number,
  key: string = dateKey()
): ModeStats {
  const stats = readStats(mode);
  if (stats.lastWonDate === key) return stats; // already recorded today

  const continued = stats.lastWonDate === yesterdayKey(key);
  const currentStreak = continued ? stats.currentStreak + 1 : 1;

  const next: ModeStats = {
    played: stats.played + 1,
    wins: stats.wins + 1,
    currentStreak,
    maxStreak: Math.max(stats.maxStreak, currentStreak),
    lastWonDate: key,
    guessDistribution: {
      ...stats.guessDistribution,
      [guessCount]: (stats.guessDistribution[guessCount] ?? 0) + 1,
    },
  };

  try {
    localStorage.setItem(statsKey(mode), JSON.stringify(next));
  } catch {
    // ignore
  }
  return next;
}
