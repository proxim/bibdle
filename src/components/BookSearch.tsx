"use client";

import { useEffect, useId, useState } from "react";
import type { Book } from "@/data/types";
import styles from "./CharacterSearch.module.css";

interface Props {
  options: Book[];
  onSelect: (book: Book) => void;
}

export default function BookSearch({ options, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const [shake, setShake] = useState(false);
  const listId = useId();

  const q = query.trim().toLowerCase();
  const matches = q ? options.filter((b) => b.name.toLowerCase().includes(q)) : [];

  useEffect(() => setHighlighted(0), [query]);

  function choose(book: Book) {
    onSelect(book);
    setQuery("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, Math.min(matches.length, 8) - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Escape") {
      setQuery("");
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

  const open = matches.length > 0;

  return (
    <div className={styles.wrap}>
      <input
        className={`${styles.input} ${shake ? styles.shake : ""}`}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a book of the Bible…"
        aria-label="Guess a book"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open ? `${listId}-${highlighted}` : undefined}
        autoFocus
        autoComplete="off"
        spellCheck={false}
      />
      {open && (
        <ul className={styles.list} id={listId} role="listbox" aria-label="Books">
          {matches.slice(0, 8).map((b, i) => (
            <li
              key={b.name}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === highlighted}
              className={`${styles.option} ${i === highlighted ? styles.optionActive : ""}`}
              onMouseEnter={() => setHighlighted(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(b)}
            >
              <span>{b.name}</span>
              <span className={styles.optionAlias}>({b.section})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
