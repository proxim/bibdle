import { CHARACTERS } from "@/data/characters";
import { VERSES } from "@/data/verses";
import type { Character, Verse } from "@/data/types";

export type ModeId = "classic" | "quote" | "emoji" | "verse";

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
