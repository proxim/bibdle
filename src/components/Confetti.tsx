"use client";

import { useState } from "react";
import styles from "./Confetti.module.css";

const COLORS = ["#dcac52", "#e8bd6c", "#2e7a4b", "#f0e9dc", "#85560a", "#e07a62"];

/** Pure-CSS confetti burst: generates N particles with randomized motion. */
export default function Confetti({ count = 80 }: { count?: number }) {
  // Lazy initial state: randomized once on mount, never during a re-render.
  const [particles] = useState(() =>
    Array.from({ length: count }, () => ({
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2.2 + Math.random() * 1.6,
      drift: (Math.random() - 0.5) * 240,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 6 + Math.random() * 6,
      round: Math.random() > 0.5,
      spin: 360 + Math.random() * 720,
    }))
  );

  return (
    <div className={styles.layer} aria-hidden="true">
      {particles.map((p, i) => (
        <span
          key={i}
          className={styles.piece}
          style={
            {
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: p.color,
              borderRadius: p.round ? "50%" : "2px",
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              "--drift": `${p.drift}px`,
              "--spin": `${p.spin}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
