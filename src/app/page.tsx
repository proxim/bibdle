import Link from "next/link";
import { MODES } from "@/lib/modes";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <header className={styles.hero}>
        <h1 className={styles.title}>Bibdle</h1>
        <p className={styles.tagline}>The daily Bible guessing game</p>
      </header>
      <nav className={styles.grid} aria-label="Game modes">
        {MODES.map((mode, i) => (
          <Link
            key={mode.id}
            href={`/${mode.id}`}
            className={styles.card}
            style={{ animationDelay: `${i * 90}ms` }}
          >
            <span className={styles.cardIcon}>{mode.icon}</span>
            <span className={styles.cardTitle}>{mode.title}</span>
            <span className={styles.cardBlurb}>{mode.blurb}</span>
          </Link>
        ))}
      </nav>
    </main>
  );
}
