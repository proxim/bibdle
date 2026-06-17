import Link from "next/link";
import type { ModeId } from "@/lib/daily";
import { HelpButton } from "./HowToPlay";
import VersionToggle from "./VersionToggle";
import styles from "./ModePage.module.css";

interface Props {
  icon: string;
  title: string;
  subtitle: string;
  modeId?: ModeId;
  /** Show the Bible-version switcher (scripture-text modes: quote & verse). */
  showVersionToggle?: boolean;
  children: React.ReactNode;
}

export default function ModePage({
  icon,
  title,
  subtitle,
  modeId,
  showVersionToggle = false,
  children,
}: Props) {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          ← Bibdle
        </Link>
        <h1 className={styles.heading}>
          {icon} {title}
          <HelpButton focusMode={modeId} className={styles.help} />
        </h1>
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
