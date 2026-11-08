import Link from "next/link";
import { MODES } from "@/lib/modes";
import PuzzleDate from "@/components/PuzzleDate";
import StreakBadges from "@/components/StreakBadges";
import { HelpButton } from "@/components/HowToPlay";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main} data-col="home">
      <div className={styles.layout}>
        <header className={styles.intro}>
          <h1 className={styles.title}>Bibdle</h1>
          <p className={styles.tagline}>
            A new set of Bible puzzles every day, the same for everyone.
          </p>
          <PuzzleDate />
          <StreakBadges />
        </header>

        <nav className={styles.modes} aria-label="Game modes">
          <ul className={styles.list}>
            {MODES.map((mode, i) => (
              <li
                key={mode.id}
                className={styles.item}
                style={{ "--i": i } as React.CSSProperties}
              >
                <Link href={`/${mode.id}`} className={styles.mode}>
                  <span className={styles.modeText}>
                    <span className={styles.modeTitle}>{mode.title}</span>
                    <span className={styles.modeBlurb}>{mode.blurb}</span>
                  </span>
                  <svg
                    className={styles.arrow}
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M4 10h11M11 5.5 15.5 10 11 14.5" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <footer className={styles.footer}>
        <a
          href="https://github.com/proxim/bibdle"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        <HelpButton />
      </footer>
    </main>
  );
}
