"use client";

import { useCallback, useEffect, useState } from "react";

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

function readStored(): BibleVersion {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isVersion(stored)) return stored;
  } catch {
    // storage unavailable (private mode) — fall through to default
  }
  return DEFAULT_VERSION;
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
  const [version, setVersionState] = useState<BibleVersion>(DEFAULT_VERSION);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setVersionState(readStored());
    setMounted(true);

    // Keep multiple toggles / tabs in sync.
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY && isVersion(e.newValue)) {
        setVersionState(e.newValue);
      }
    }
    function onLocal() {
      setVersionState(readStored());
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener("bibdle:version-change", onLocal);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("bibdle:version-change", onLocal);
    };
  }, []);

  const setVersion = useCallback((next: BibleVersion) => {
    setVersionState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
    // Notify other hook instances in this same tab (storage event only fires
    // cross-tab), so the version toggle and the game text stay in sync.
    window.dispatchEvent(new Event("bibdle:version-change"));
  }, []);

  return { version, setVersion, mounted };
}
