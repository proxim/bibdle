import type { ModeId } from "./daily";
import type { TileResult } from "./compare";
import { modeMeta } from "./modes";
import { dateKey } from "./daily";

export const TILE_EMOJI: Record<TileResult, string> = {
  correct: "🟩",
  partial: "🟨",
  wrong: "⬛",
};

/** Builds the full shareable text block (title + emoji grid + result line). */
export function buildShareText(
  mode: ModeId,
  guessCount: number,
  grid: string[]
): string {
  const meta = modeMeta.get(mode)!;
  const header = `Bibdle ${meta.icon} ${meta.title} — ${dateKey()}`;
  const result = `Solved in ${guessCount} ${guessCount === 1 ? "guess" : "guesses"}`;
  return [header, ...grid, result, "https://bibdle-daily.vercel.app"].join("\n");
}
