"use client";

import { useSyncExternalStore } from "react";
import { useHydrated } from "@/lib/useHydrated";
import styles from "./ThemeToggle.module.css";

type Theme = "light" | "dark";

const STORAGE_KEY = "bibdle:theme";

// The theme lives on <html data-theme> (set by the inline script in layout),
// so subscribe to that attribute rather than mirroring it into React state.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

function getTheme(): Theme {
  return (document.documentElement.dataset.theme as Theme) || "dark";
}

export default function ThemeToggle() {
  const mounted = useHydrated();
  const theme = useSyncExternalStore<Theme>(subscribe, getTheme, () => "dark");

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // storage may be unavailable (private mode); ignore
    }
  }

  // Avoid rendering a mismatched icon during SSR / before hydration.
  if (!mounted) {
    return (
      <div className={styles.wrapper}>
        <span className={styles.placeholder} aria-hidden="true" />
      </div>
    );
  }

  const isDark = theme === "dark";

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.button}
        onClick={toggle}
        aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
        title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      >
        <span className={styles.icon} key={theme} aria-hidden="true">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {isDark ? (
              <path d="M16.5 11.6A6.6 6.6 0 0 1 8.4 3.5a6.6 6.6 0 1 0 8.1 8.1Z" />
            ) : (
              <>
                <circle cx="10" cy="10" r="3.4" />
                <path d="M10 2.2v1.6M10 16.2v1.6M2.2 10h1.6M16.2 10h1.6M4.5 4.5l1.1 1.1M14.4 14.4l1.1 1.1M4.5 15.5l1.1-1.1M14.4 5.6l1.1-1.1" />
              </>
            )}
          </svg>
        </span>
      </button>
    </div>
  );
}
