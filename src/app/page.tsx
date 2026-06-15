import Link from "next/link";
import { MODES } from "@/lib/modes";
import PuzzleDate from "@/components/PuzzleDate";
import StreakBadges from "@/components/StreakBadges";
import { HelpButton } from "@/components/HowToPlay";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.ambient} aria-hidden="true">
        <span className={styles.mote} />
        <span className={styles.mote} />
        <span className={styles.mote} />
      </div>

      <header className={styles.hero}>
        <h1 className={styles.title}>Bibdle</h1>
        <p className={styles.tagline}>The daily Bible guessing game</p>
        <PuzzleDate />
        <StreakBadges />
      </header>

      <nav className={styles.grid} aria-label="Game modes">
        {MODES.map((mode, i) => (
          <Link
            key={mode.id}
            href={`/${mode.id}`}
            className={`${styles.card} ${styles[`tint-${mode.id}`] ?? ""}`}
            style={{ "--i": i } as React.CSSProperties}
          >
            <span className={styles.cardIcon}>{mode.icon}</span>
            <span className={styles.cardTitle}>{mode.title}</span>
            <span className={styles.cardBlurb}>{mode.blurb}</span>
          </Link>
        ))}
      </nav>

      <footer className={styles.footer}>
        <a
          href="https://github.com/proxim/bibdle"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        <span className={styles.dot} aria-hidden="true">
          ·
        </span>
        <HelpButton variant="link" />
        <span className={styles.dot} aria-hidden="true">
          ·
        </span>
        <span>The daily Bible guessing game</span>
      </footer>
    </main>
  );
}
