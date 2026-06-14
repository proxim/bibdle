# Bibdle 📖

The daily Bible guessing game — a Wordle/LoLdle-inspired puzzle with four game
modes, polished hand-written CSS animations, and (coming soon) an AI chat where
you can talk to the character you just guessed.

> One puzzle per day, the same answer for everyone, no account required.

## Game modes

| Mode | Goal | Feedback |
| --- | --- | --- |
| 📖 **Classic** | Guess the Bible character | Per-trait tiles: Testament, Book, Role, Tribe/Nation, Era, Gender — 🟩 correct / 🟨 partial / ⬛ wrong, with ⬆️/⬇️ era hints |
| 💬 **Quote** | Name who said it | Wrong guesses progressively reveal book → chapter → first letter |
| 🐳 **Emoji** | Decode the emoji story | One emoji revealed at a time per wrong guess |
| 📜 **Verse** | Guess which book a verse is from | 🟩 book / 🟨 section / 🟧 testament / ⬛ wrong, plus canonical ⬆️/⬇️ direction |

Solve a mode to see a confetti win popup with your spoiler-free emoji-grid
result (copy-to-clipboard / native share) and quick links to jump straight into
the other modes. Per-mode stats — games played, win rate, current and max
streak — are tracked locally.

## Tech stack

- **[Next.js](https://nextjs.org/) (App Router) + TypeScript** — statically
  rendered, deploys to the Vercel free tier.
- **Vanilla CSS Modules** — every animation (staggered 3D tile flips, shake,
  confetti, modal pop-in) is hand-written keyframes; no Tailwind or animation
  libraries. Respects `prefers-reduced-motion`.
- **No backend / database** — the daily answer is a deterministic FNV-1a hash of
  `mode + date`, so every player gets the same puzzle with zero server state.
  Progress and stats live in `localStorage`.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts:

```bash
npm run build    # production build
npm run start    # serve the production build
npm run lint     # eslint
```

## Project structure

```
src/
├─ app/                 # routes: / (mode select), /classic, /quote, /emoji, /verse
├─ components/          # game UIs, search inputs, share modal, confetti
├─ data/
│  ├─ types.ts          # Character / Book / Verse types + ordered ERAS
│  ├─ characters.ts     # ~90 characters with traits, emojis, quotes, persona notes
│  ├─ books.ts          # all 66 books (testament, section, canonical order, chapters)
│  └─ verses.ts         # verse pool for Verse mode
└─ lib/
   ├─ daily.ts          # deterministic daily-answer selection
   ├─ compare.ts        # Classic-mode trait comparison
   ├─ stats.ts          # streaks / win-rate persistence
   ├─ share.ts          # emoji-grid share text
   ├─ modes.ts          # mode registry
   └─ useDailyState.ts  # per-day localStorage hook
```

## Adding content

- **Characters:** append entries to `src/data/characters.ts` (every field is
  typed; `era`, `roles`, and `section` are string unions checked by `tsc`).
- **Verses:** append to `src/data/verses.ts`.

All quotes and verses use the KJV (public domain).

## Roadmap

- AI character chat — talk to the character in persona after solving (Gemini
  Flash via a Vercel serverless route; provider abstracted).
- More modes: Relation (genealogy), Object/Symbol, Timeline ordering.

See [`PRD.md`](./PRD.md) for the full product spec.

## Deploying

Push to GitHub and import the repo on [Vercel](https://vercel.com/new) — no
configuration or environment variables needed for the current build. The AI chat
milestone will add a single API key.
