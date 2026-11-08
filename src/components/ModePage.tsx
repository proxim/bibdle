import Link from "next/link";
import type { ModeId } from "@/lib/daily";
import { HelpButton } from "./HowToPlay";
import VersionToggle from "./VersionToggle";
import styles from "./ModePage.module.css";

interface Props {
  title: string;
  subtitle: string;
  modeId?: ModeId;
  /** Show the Bible-version switcher (scripture-text modes: quote & verse). */
  showVersionToggle?: boolean;
  /** Use the wider column (the Classic trait board). */
  wide?: boolean;
  children: React.ReactNode;
}

export default function ModePage({
  title,
  subtitle,
  modeId,
  showVersionToggle = false,
  wide = false,
  children,
}: Props) {
  return (
    <main className={`${styles.page} ${wide ? styles.wide : ""}`}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M16 10H5M9 5.5 4.5 10 9 14.5" />
          </svg>
          Bibdle
        </Link>
        <div className={styles.titleRow}>
          <h1 className={styles.heading}>{title}</h1>
          <HelpButton focusMode={modeId} className={styles.help} />
        </div>
        <p className={styles.sub}>{subtitle}</p>
        {showVersionToggle && (
          <div className={styles.versionRow}>
            <VersionToggle />
          </div>
        )}
      </header>
      {children}
    </main>
  );
}
