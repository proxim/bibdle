"use client";

import { useEffect, useRef, useState } from "react";
import type { Character } from "@/data/types";
import { dateKey } from "@/lib/daily";
import type { ChatMessage } from "@/lib/llm";
import styles from "./CharacterChat.module.css";

interface Props {
  character: Character;
  onClose: () => void;
}

/** Max user messages a player may send per character per day. */
const DAILY_LIMIT = 10;

function countKey(characterId: string) {
  return `bibdle:chat:${characterId}:${dateKey()}`;
}

function readCount(characterId: string): number {
  try {
    const raw = localStorage.getItem(countKey(characterId));
    const n = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

function writeCount(characterId: string, n: number) {
  try {
    localStorage.setItem(countKey(characterId), String(n));
  } catch {
    // ignore unavailable storage
  }
}

export default function CharacterChat({ character, onClose }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: `Peace be with you. I am ${character.name}. Ask me what you will.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentCount, setSentCount] = useState(0);

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Hydrate today's used-message count from storage.
  useEffect(() => {
    setSentCount(readCount(character.id));
  }, [character.id]);

  // Escape to close.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Auto-scroll to the newest message / typing indicator.
  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, sending]);

  const remaining = Math.max(0, DAILY_LIMIT - sentCount);
  const capReached = remaining <= 0;
  const trimmed = input.trim();
  const canSend = !sending && !capReached && trimmed.length > 0;

  async function send() {
    if (!canSend) return;
    setError(null);

    const userMsg: ChatMessage = { role: "user", content: trimmed.slice(0, 1000) };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");

    const nextCount = sentCount + 1;
    setSentCount(nextCount);
    writeCount(character.id, nextCount);

    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterId: character.id,
          // Only send chat turns the model needs; cap to a recent window.
          messages: history
            .filter((m) => m.role === "user" || m.role === "assistant")
            .slice(-20),
        }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok || !data.reply) {
        throw new Error(data.error || "Something went wrong.");
      }
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply! }]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "The character couldn't respond."
      );
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    send();
  }

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Chat with ${character.name}`}
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose} aria-label="Close">
          ×
        </button>

        <header className={styles.header}>
          <span className={styles.avatar} aria-hidden="true">
            {character.emojis[character.emojis.length - 1] ?? "💬"}
          </span>
          <div className={styles.headerText}>
            <h2 className={styles.title}>Talk to {character.name}</h2>
            <p className={styles.subtitle}>{character.description}</p>
          </div>
        </header>

        <div className={styles.messages} ref={listRef} aria-live="polite">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`${styles.bubble} ${
                m.role === "user" ? styles.user : styles.character
              }`}
            >
              {m.content}
            </div>
          ))}

          {sending && (
            <div
              className={`${styles.bubble} ${styles.character} ${styles.typing}`}
              aria-label={`${character.name} is typing`}
            >
              <span className={styles.dot} />
              <span className={styles.dot} />
              <span className={styles.dot} />
            </div>
          )}
        </div>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        {capReached ? (
          <p className={styles.cap}>
            You&rsquo;ve reached today&rsquo;s message limit with {character.name}.
            Come back tomorrow to talk again. 🌙
          </p>
        ) : (
          <form className={styles.inputRow} onSubmit={onSubmit}>
            <input
              ref={inputRef}
              className={styles.input}
              type="text"
              value={input}
              maxLength={1000}
              placeholder={`Ask ${character.name} something…`}
              onChange={(e) => setInput(e.target.value)}
              disabled={sending}
              aria-label="Your message"
            />
            <button
              type="submit"
              className={styles.send}
              disabled={!canSend}
              aria-label="Send message"
            >
              ➤
            </button>
          </form>
        )}

        {!capReached && (
          <p className={styles.remaining}>
            {remaining} {remaining === 1 ? "message" : "messages"} left today
          </p>
        )}
      </div>
    </div>
  );
}
