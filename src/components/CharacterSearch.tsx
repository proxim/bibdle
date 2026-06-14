"use client";

import { useEffect, useRef, useState } from "react";
import type { Character } from "@/data/types";
import styles from "./CharacterSearch.module.css";

interface Props {
  options: Character[];
  onSelect: (character: Character) => void;
  /** Emoji mode hides the leading emoji so the dropdown doesn't give the answer away. */
  showEmoji?: boolean;
}

export default function CharacterSearch({
  options,
  onSelect,
  showEmoji = true,
}: Props) {
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const [shake, setShake] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);

  const q = query.trim().toLowerCase();
  const matches = q
    ? options.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.aliases.some((a) => a.toLowerCase().includes(q))
      )
    : [];

  useEffect(() => setHighlighted(0), [query]);

  function choose(character: Character) {
    onSelect(character);
    setQuery("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, matches.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (matches[highlighted]) {
        choose(matches[highlighted]);
      } else if (q) {
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    }
  }

  return (
    <div className={styles.wrap}>
      <input
        className={`${styles.input} ${shake ? styles.shake : ""}`}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a character name…"
        aria-label="Guess a character"
        autoFocus
        autoComplete="off"
        spellCheck={false}
      />
      {matches.length > 0 && (
        <ul className={styles.list} ref={listRef} role="listbox">
          {matches.slice(0, 8).map((c, i) => (
            <li key={c.id} role="option" aria-selected={i === highlighted}>
              <button
                type="button"
                className={`${styles.option} ${i === highlighted ? styles.optionActive : ""}`}
                onMouseEnter={() => setHighlighted(i)}
                onClick={() => choose(c)}
              >
                {showEmoji && (
                  <span className={styles.optionEmoji}>{c.emojis[0]}</span>
                )}
                <span>{c.name}</span>
                {c.aliases.length > 0 && (
                  <span className={styles.optionAlias}>({c.aliases[0]})</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
