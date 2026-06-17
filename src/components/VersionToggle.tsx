"use client";

import {
  POPULATED_VERSIONS,
  VERSIONS,
  useBibleVersion,
  type BibleVersion,
} from "@/lib/version";
import styles from "./VersionToggle.module.css";

function isPopulated(v: BibleVersion) {
  return POPULATED_VERSIONS.includes(v);
}

/**
 * Small segmented Bible-version switcher, styled with the same CSS variables
 * as ThemeToggle so it works in both light and dark themes. Translations that
 * aren't populated yet (NIV) are marked "coming soon": still selectable, but
 * the UI shows KJV text and a note (see VerseGame/QuoteGame).
 */
export default function VersionToggle() {
  const { version, setVersion, mounted } = useBibleVersion();

  // No-flash: keep the footprint but defer the active state until hydrated.
  return (
    <div
      className={styles.wrapper}
      role="group"
      aria-label="Bible version"
      data-mounted={mounted}
    >
      {VERSIONS.map((v) => {
        const active = mounted && v === version;
        const populated = isPopulated(v);
        return (
          <button
            key={v}
            type="button"
            className={`${styles.option} ${active ? styles.active : ""}`}
            aria-pressed={active}
            title={
              populated
                ? `Show scripture in ${v}`
                : `${v} coming soon — shows KJV text for now`
            }
            onClick={() => setVersion(v)}
          >
            {v}
            {!populated && <span className={styles.soon}>soon</span>}
          </button>
        );
      })}
    </div>
  );
}
