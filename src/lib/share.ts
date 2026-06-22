import type { ModeId } from "./daily";
import type { TileResult } from "./compare";
import { modeMeta } from "./modes";
import { dateKey, BARD_ROUNDS } from "./daily";

export const TILE_EMOJI: Record<TileResult, string> = {
  correct: "🟩",
  partial: "🟨",
  wrong: "⬛",
};

/** Modes scored out of a fixed number of rounds rather than solved in N guesses. */
const SCORE_MODES: Partial<Record<ModeId, number>> = {
  shakespeare: BARD_ROUNDS,
};

/**
 * Builds the full shareable text block (title + emoji grid + result line).
 * For guess modes `value` is the guess count; for score modes it is the score.
 */
export function buildShareText(
  mode: ModeId,
  value: number,
  grid: string[]
): string {
  const meta = modeMeta.get(mode)!;
  const header = `Bibdle ${meta.icon} ${meta.title} — ${dateKey()}`;
  const total = SCORE_MODES[mode];
  const result =
    total !== undefined
      ? `${value}/${total}`
      : `Solved in ${value} ${value === 1 ? "guess" : "guesses"}`;
  return [header, ...grid, result, "https://bibdle.app"].join("\n");
}
