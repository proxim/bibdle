"use client";

import {
  useCallback,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { dateKey, type ModeId } from "./daily";
import { useHydrated } from "./useHydrated";

const KEY_PREFIX = "bibdle:state";

function storageKey(mode: ModeId, key: string) {
  return `${KEY_PREFIX}:${mode}:${key}`;
}

// Session-only fallback so progress still works when storage is unavailable.
const memory = new Map<string, string>();
const listeners = new Set<() => void>();

function readRaw(storageKeyName: string): string | null {
  try {
    return localStorage.getItem(storageKeyName);
  } catch {
    return memory.get(storageKeyName) ?? null;
  }
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
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
  const [initialState] = useState(initial);
  const hydrated = useHydrated();
  const name = storageKey(mode, key);

  const raw = useSyncExternalStore(
    subscribe,
    () => readRaw(name),
    () => null
  );

  const state = useMemo(() => {
    if (raw === null) return initialState;
    try {
      return JSON.parse(raw) as T;
    } catch {
      // ignore corrupt storage
      return initialState;
    }
  }, [raw, initialState]);

  const setState = useCallback(
    (next: T | ((prev: T) => T)) => {
      let prev = initialState;
      const current = readRaw(name);
      if (current !== null) {
        try {
          prev = JSON.parse(current) as T;
        } catch {
          // ignore corrupt storage
        }
      }
      const value =
        typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      const serialized = JSON.stringify(value);
      memory.set(name, serialized);
      try {
        localStorage.setItem(name, serialized);
      } catch {
        // ignore
      }
      listeners.forEach((l) => l());
    },
    [name, initialState]
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
