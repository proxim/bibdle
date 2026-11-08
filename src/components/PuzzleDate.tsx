"use client";

import { useSyncExternalStore } from "react";
import styles from "./PuzzleDate.module.css";

function subscribe() {
  return () => {};
}

function getLabel() {
  return new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default function PuzzleDate() {
  const label = useSyncExternalStore(subscribe, getLabel, () => null);

  // Avoid SSR/first-paint mismatch — date is locale/timezone dependent.
  if (!label) return null;

  return <p className={styles.date}>{label}</p>;
}
