import type { BibleVersion } from "@/lib/version";

/**
 * Per-translation TEXT OVERRIDES, keyed by verse/quote `reference`.
 *
 * The inline `text` already stored in `characters.ts` (quotes) and
 * `verses.ts` is treated as the **KJV baseline**, so KJV does NOT need an
 * entry here. This map only holds *alternative* translations.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * HOW TO ADD NIV (or any future translation) LATER
 * ─────────────────────────────────────────────────────────────────────────
 * 1. Add the `reference` as a key (must exactly match the `reference` field
 *    used in characters.ts / verses.ts, e.g. "John 3:16").
 * 2. Add the translated text under the version key, e.g.:
 *
 *      "John 3:16": {
 *        NIV: "For God so loved the world that he gave his one and only Son, ...",
 *      },
 *
 * 3. Once a translation has text for the references in active rotation, add it
 *    to `POPULATED_VERSIONS` in `src/lib/version.ts` so the UI stops marking
 *    it "coming soon".
 *
 * NOTE: ship only public-domain or properly-licensed text. KJV is public
 * domain; the NIV is copyrighted, so confirm licensing before populating it.
 *
 * Intentionally (almost) empty for now — KJV is the inline baseline.
 */
export const TRANSLATIONS: Record<
  string,
  Partial<Record<BibleVersion, string>>
> = {
  // Example shape (commented out — no NIV text shipped yet):
  // "John 3:16": {
  //   NIV: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
  // },
};

/**
 * Resolve the scripture text to display for a given reference + version.
 *
 * @param reference  e.g. "John 3:16" — must match the data's `reference`.
 * @param kjvText     the inline KJV baseline text from characters/verses data.
 * @param version    the selected Bible version.
 * @returns the override text if one exists for that version, else the KJV
 *          baseline (so unpopulated translations gracefully show KJV).
 */
export function getText(
  reference: string,
  kjvText: string,
  version: BibleVersion
): string {
  if (version === "KJV") return kjvText;
  return TRANSLATIONS[reference]?.[version] ?? kjvText;
}
