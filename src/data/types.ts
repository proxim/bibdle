export type Testament = "Old" | "New";

export type Section =
  | "Law"
  | "History"
  | "Wisdom"
  | "Prophets"
  | "Gospels"
  | "Acts & Epistles"
  | "Revelation";

export type Role =
  | "Patriarch"
  | "Matriarch"
  | "Prophet"
  | "Prophetess"
  | "King"
  | "Queen"
  | "Judge"
  | "Priest"
  | "Apostle"
  | "Disciple"
  | "Shepherd"
  | "Warrior"
  | "Leader"
  | "Wife"
  | "Mother"
  | "Messiah"
  | "Tax Collector"
  | "Fisherman"
  | "Missionary";

/** Coarse chronological eras, ordered. Index = ordinal used for ⬆️/⬇️ hints. */
export const ERAS = [
  "Creation & Early World", // Adam–Noah
  "Patriarchs", // Abraham–Joseph
  "Exodus & Wilderness", // Moses, Aaron
  "Conquest & Judges", // Joshua–Samson, Ruth
  "United Kingdom", // Saul, David, Solomon
  "Divided Kingdom", // Elijah, Elisha, kings
  "Exile & Return", // Daniel, Esther, Ezra, Nehemiah
  "Life of Jesus", // Gospels
  "Early Church", // Acts, Epistles
] as const;

export type Era = (typeof ERAS)[number];

export interface Character {
  id: string; // kebab-case slug
  name: string;
  aliases: string[];
  testament: Testament;
  book: string; // book of first appearance
  roles: Role[];
  tribeNation: string; // e.g. "Judah", "Levi", "Israel", "Moab", "Gentile"
  era: Era;
  gender: "Male" | "Female";
  emojis: string[]; // up to 5, ordered from cryptic to obvious
  /** Short gloss for each emoji, aligned 1:1 with `emojis`, shown after solving. */
  emojiMeanings: string[];
  quotes: { text: string; reference: string }[];
  /** Short one-line hint shown to the player; identifies without naming. */
  description: string;
  /** Short notes used to ground the AI persona prompt. */
  persona: string;
}

export interface Book {
  name: string;
  testament: Testament;
  section: Section;
  order: number; // canonical position, 1–66
  chapters: number;
}

export interface Verse {
  text: string;
  book: string;
  reference: string; // e.g. "John 3:16"
}

/** Source corpus for the "Scripture or Shakespeare" mode. */
export type BardSource = "scripture" | "shakespeare";

export interface BardPassage {
  id: string;
  text: string;
  source: BardSource;
  /** Revealed after the player answers — KJV reference or Shakespeare play. */
  attribution: string;
}
