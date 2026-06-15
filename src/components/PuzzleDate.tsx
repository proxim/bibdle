"use client";

import { useEffect, useState } from "react";
import styles from "./PuzzleDate.module.css";

export default function PuzzleDate() {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    setLabel(
      new Date().toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );
  }, []);

  // Avoid SSR/first-paint mismatch — date is locale/timezone dependent.
  if (!label) return null;

  return <p className={styles.date}>{label}</p>;
}
