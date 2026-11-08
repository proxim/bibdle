import buttons from "./buttons.module.css";
import styles from "./ResultPanel.module.css";

interface Props {
  eyebrow: string;
  title: string;
  detail?: string;
  /** Buttons for what to do next; the first should be the primary action. */
  children: React.ReactNode;
}

/** The "you solved it" block shown in place of the guess input. */
export default function ResultPanel({ eyebrow, title, detail, children }: Props) {
  return (
    <section className={styles.panel} aria-label="Result">
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h2 className={styles.title}>{title}</h2>
      {detail && <p className={styles.detail}>{detail}</p>}
      <div className={`${styles.actions} ${buttons.row}`}>{children}</div>
    </section>
  );
}
