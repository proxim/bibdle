import { CHARACTERS } from "@/data/characters";
import { VERSES } from "@/data/verses";
import { BARD_PASSAGES } from "@/data/bardPassages";
import type { BardPassage, Character, Verse } from "@/data/types";

export type ModeId = "classic" | "quote" | "emoji" | "verse" | "shakespeare";

/** Passages shown in one daily "Scripture or Shakespeare" run. */
export const BARD_ROUNDS = 3;

/** Local date key, e.g. "2026-06-12". Daily answers roll over at local midnight. */
export function dateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** FNV-1a 32-bit hash — deterministic across clients, no backend needed. */
function fnv1a(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function dailyIndex(mode: ModeId, poolSize: number, key: string): number {
  return fnv1a(`bibdle:${mode}:${key}`) % poolSize;
}

export function dailyCharacter(
  mode: Extract<ModeId, "classic" | "quote" | "emoji">,
  key: string = dateKey()
): Character {
  return CHARACTERS[dailyIndex(mode, CHARACTERS.length, key)];
}

export function dailyVerse(key: string = dateKey()): Verse {
  return VERSES[dailyIndex("verse", VERSES.length, key)];
}

/** Quote shown in Quote mode — stable pick among characters that have quotes. */
export function dailyQuote(key: string = dateKey()) {
  const pool = CHARACTERS.filter((c) => c.quotes.length > 0);
  const character = pool[dailyIndex("quote", pool.length, key)];
  const quote =
    character.quotes[fnv1a(`bibdle:quote-pick:${key}`) % character.quotes.length];
  return { character, quote };
}

/** Deterministically take `n` items from a pool, seeded by `seed`. */
function seededPick<T extends { id: string }>(pool: T[], n: number, seed: string): T[] {
  return [...pool]
    .sort((a, b) => fnv1a(`${seed}:${a.id}`) - fnv1a(`${seed}:${b.id}`))
    .slice(0, n);
}

/**
 * The day's "Scripture or Shakespeare" round: BARD_ROUNDS passages, mixed from
 * both corpora. The split is intentionally not fixed at 50/50 (so players can't
 * game the count) but is clamped to ≥2 of each source, then shuffled so the two
 * sources aren't grouped together.
 */
export function dailyBardRound(key: string = dateKey()): BardPassage[] {
  const scripturePool = BARD_PASSAGES.filter((p) => p.source === "scripture");
  const shakespearePool = BARD_PASSAGES.filter((p) => p.source === "shakespeare");

  // Keep at least `minPer` of each source (2 when there's room, else 1), and
  // vary the split so players can't game a fixed ratio. shakespeareCount is
  // whatever's left, and is guaranteed ≥ minPer by the same bounds.
  const minPer = Math.min(2, Math.floor(BARD_ROUNDS / 2));
  const span = BARD_ROUNDS - 2 * minPer + 1; // inclusive range width
  const scriptureCount = minPer + (fnv1a(`bibdle:bard-split:${key}`) % span);
  const shakespeareCount = BARD_ROUNDS - scriptureCount;

  const picks = [
    ...seededPick(scripturePool, scriptureCount, `bibdle:bard-s:${key}`),
    ...seededPick(shakespearePool, shakespeareCount, `bibdle:bard-w:${key}`),
  ];

  return picks.sort(
    (a, b) => fnv1a(`bibdle:bard-order:${key}:${a.id}`) - fnv1a(`bibdle:bard-order:${key}:${b.id}`)
  );
}
