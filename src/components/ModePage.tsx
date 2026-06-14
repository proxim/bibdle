import Link from "next/link";
import styles from "./ModePage.module.css";

interface Props {
  icon: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export default function ModePage({ icon, title, subtitle, children }: Props) {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          ← Bibdle
        </Link>
        <h1 className={styles.heading}>
          {icon} {title}
        </h1>
        <p className={styles.sub}>{subtitle}</p>
      </header>
      {children}
    </main>
  );
}
