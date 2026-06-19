import type { ModeId } from "./daily";

export interface ModeMeta {
  id: ModeId;
  title: string;
  icon: string;
  blurb: string;
}

export const MODES: ModeMeta[] = [
  { id: "classic", title: "Classic", icon: "📖", blurb: "Guess the character from their traits" },
  { id: "quote", title: "Quote", icon: "💬", blurb: "Who said it?" },
  { id: "emoji", title: "Emoji", icon: "🐳", blurb: "Decode the emoji story" },
  { id: "verse", title: "Verse", icon: "📜", blurb: "Which book is this verse from?" },
  { id: "shakespeare", title: "Shakespeare", icon: "🎭", blurb: "Bible verse or the Bard?" },
];

export const modeMeta = new Map(MODES.map((m) => [m.id, m]));
