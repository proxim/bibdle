"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import type { Character } from "@/data/types";
import type { ModeId } from "@/lib/daily";
import { dateKey } from "@/lib/daily";
import { getCharacterQuestions } from "@/data/characterQuestions";
import type { ChatMessage } from "@/lib/llm";
import styles from "./CharacterChat.module.css";

interface Props {
  character: Character;
  onClose: () => void;
  /** Mode the chat was opened from — recorded in analytics. */
  mode?: ModeId;
}

/** Max user messages a player may send per character per day. */
const DAILY_LIMIT = 10;

function greeting(character: Character): ChatMessage {
  return {
    role: "assistant",
    content: `Peace be with you. I am ${character.name}. Ask me what you will.`,
  };
}

/** Per-character, per-day key for the saved transcript. */
function logKey(characterId: string) {
  return `bibdle:chat:${characterId}:${dateKey()}`;
}

function readLog(character: Character): ChatMessage[] {
  try {
    const raw = localStorage.getItem(logKey(character.id));
    if (!raw) return [greeting(character)];
    const parsed = JSON.parse(raw);
    if (
      Array.isArray(parsed) &&
      parsed.length > 0 &&
      parsed.every(
        (m) =>
          m &&
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string"
      )
    ) {
      return parsed as ChatMessage[];
    }
  } catch {
    // corrupt or unavailable storage — fall back to a fresh greeting
  }
  return [greeting(character)];
}

function writeLog(characterId: string, messages: ChatMessage[]) {
  try {
    localStorage.setItem(logKey(characterId), JSON.stringify(messages));
  } catch {
    // ignore unavailable storage
  }
}

export default function CharacterChat({ character, onClose, mode }: Props) {
  // Restore today's conversation with this character, if any.
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    readLog(character)
  );
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Used-message count is derived from the restored transcript.
  const sentCount = messages.filter((m) => m.role === "user").length;

  const questions = useMemo(
    () => getCharacterQuestions(character.id),
    [character.id]
  );
  // A curated question makes a more inviting placeholder than "Ask … something".
  // Picked once per mount (lazy init is the sanctioned place for randomness).
  const [placeholder] = useState(
    () => questions[Math.floor(Math.random() * questions.length)]
  );
  // Surface tappable starters until the player has asked their first question.
  const showSuggestions = sentCount === 0;

  // Persist the transcript whenever it changes.
  useEffect(() => {
    writeLog(character.id, messages);
  }, [character.id, messages]);

  // Record that the chat was opened (once per mount).
  useEffect(() => {
    track("chat_opened", { character: character.id, mode: mode ?? "unknown" });
  }, [character.id, mode]);

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

  function pickSuggestion(question: string) {
    setInput(question);
    inputRef.current?.focus();
  }

  async function send() {
    if (!canSend) return;
    setError(null);

    const userMsg: ChatMessage = { role: "user", content: trimmed.slice(0, 1000) };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");

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

        {showSuggestions && !capReached && (
          <div className={styles.suggestions} aria-label="Suggested questions">
            {questions.map((q) => (
              <button
                key={q}
                type="button"
                className={styles.suggestion}
                onClick={() => pickSuggestion(q)}
                disabled={sending}
              >
                {q}
              </button>
            ))}
          </div>
        )}

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
              placeholder={placeholder}
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

        <p className={styles.disclaimer}>
          ✨ Replies are AI-generated in character and may be inaccurate — they
          aren&rsquo;t Scripture.
        </p>
      </div>
    </div>
  );
}
