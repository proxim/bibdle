"use client";

import { useCallback, useSyncExternalStore } from "react";
import { useHydrated } from "./useHydrated";

/**
 * Supported Bible translations.
 *
 * KJV is the inline baseline already stored in `characters.ts` / `verses.ts`.
 * NIV is wired through the whole stack but NOT yet populated — see
 * `src/data/translations.ts` for where to add NIV text.
 */
export type BibleVersion = "KJV" | "NIV";

export const VERSIONS: BibleVersion[] = ["KJV", "NIV"];

/** Translations that actually have text today. Used to mark the rest "coming soon". */
export const POPULATED_VERSIONS: BibleVersion[] = ["KJV"];

export const DEFAULT_VERSION: BibleVersion = "KJV";

const STORAGE_KEY = "bibdle:version";

function isVersion(value: unknown): value is BibleVersion {
  return value === "KJV" || value === "NIV";
}

// Session-only fallback so the toggle still works when storage is unavailable.
let memoryVersion: BibleVersion = DEFAULT_VERSION;

function readStored(): BibleVersion {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isVersion(stored)) return stored;
  } catch {
    // storage unavailable (private mode) — fall through to the in-memory value
    return memoryVersion;
  }
  return DEFAULT_VERSION;
}

const VERSION_CHANGE_EVENT = "bibdle:version-change";

// Keep multiple toggles / tabs in sync.
function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(VERSION_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(VERSION_CHANGE_EVENT, onChange);
  };
}

/**
 * Client hook for the selected Bible version, persisted to localStorage.
 * Follows the no-flash / `mounted` pattern used by ThemeToggle &
 * useDailyState: `mounted` is false during SSR / first paint so callers can
 * avoid rendering a mismatched state before storage is read.
 */
export function useBibleVersion(): {
  version: BibleVersion;
  setVersion: (next: BibleVersion) => void;
  mounted: boolean;
} {
  const version = useSyncExternalStore(
    subscribe,
    readStored,
    () => DEFAULT_VERSION
  );
  const mounted = useHydrated();

  const setVersion = useCallback((next: BibleVersion) => {
    memoryVersion = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
    // Notify every hook instance in this same tab (storage event only fires
    // cross-tab), so the version toggle and the game text stay in sync.
    window.dispatchEvent(new Event(VERSION_CHANGE_EVENT));
  }, []);

  return { version, setVersion, mounted };
}
