"use client";

import { useEffect, useState } from "react";
import styles from "./ThemeToggle.module.css";

type Theme = "light" | "dark";

const STORAGE_KEY = "bibdle:theme";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const current = (document.documentElement.dataset.theme as Theme) || "dark";
    setTheme(current);
    setMounted(true);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
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
        <span className={styles.icon} key={theme}>
          {isDark ? "🌙" : "☀️"}
        </span>
      </button>
    </div>
  );
}
