"use client";

import { useCallback, useEffect, useState } from "react";
import { dateKey, type ModeId } from "./daily";

const KEY_PREFIX = "bibdle:state";

function storageKey(mode: ModeId, key: string) {
  return `${KEY_PREFIX}:${mode}:${key}`;
}

/**
 * Persists a mode's daily progress to localStorage, scoped to today's date.
 * Returns [state, setState, hydrated]. `hydrated` is false during SSR / first
 * paint so the UI can avoid flashing default state before storage is read.
 */
export function useDailyState<T>(
  mode: ModeId,
  initial: T,
  key: string = dateKey()
): [T, (next: T | ((prev: T) => T)) => void, boolean] {
  const [state, setRawState] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey(mode, key));
      if (stored !== null) setRawState(JSON.parse(stored) as T);
    } catch {
      // ignore corrupt / unavailable storage
    }
    setHydrated(true);
  }, [mode, key]);

  const setState = useCallback(
    (next: T | ((prev: T) => T)) => {
      setRawState((prev) => {
        const value =
          typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        try {
          localStorage.setItem(storageKey(mode, key), JSON.stringify(value));
        } catch {
          // ignore
        }
        return value;
      });
    },
    [mode, key]
  );

  return [state, setState, hydrated];
}

/** True if the given mode has been won today (read-only, for menus/share popup). */
export function isModeWonToday(mode: ModeId, key: string = dateKey()): boolean {
  try {
    const stored = localStorage.getItem(storageKey(mode, key));
    if (!stored) return false;
    const parsed = JSON.parse(stored) as { won?: boolean };
    return parsed?.won === true;
  } catch {
    return false;
  }
}
