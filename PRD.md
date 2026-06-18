# Bibdle — Product Requirements Document

A daily Bible-themed guessing game (Wordle/LoLdle-style) with multiple game modes and an AI character chat unlocked on win. Portfolio project; must run on Vercel free tier.

## Goals
- Showcase polished, custom CSS animations (flexbox + grid, no animation libraries).
- Daily puzzle loop: same answer for everyone each day, streaks tracked locally.
- AI chatbot: after solving, chat with the day's character in persona.

## Target stack
- **Frontend:** Next.js (App Router) + TypeScript, deployed on Vercel free tier.
- **Styling:** Hand-written CSS Modules / vanilla CSS — custom keyframe animations, grid-based guess board, flexbox layouts. No Tailwind, no Framer Motion (portfolio point: raw CSS skill).
- **Data:** Static JSON dataset of characters/quotes/emojis bundled with the app. No database for v1.
- **Daily answer:** deterministic seeded pick from date (e.g. hash of YYYY-MM-DD) — no backend needed.
- **State:** localStorage for streaks, stats, completed modes per day.
- **AI chat:** Vercel serverless route → Gemini Flash (free tier / lowest cost; provider abstracted so Claude Haiku is a drop-in swap), persona system prompt per character. Daily message cap per user (localStorage + soft server rate limit) to stay within budget.

## Game modes (v1)

### 1. Classic mode
Guess the Bible character. Each guess renders a row of attribute tiles compared to the answer:

| Attribute | Feedback |
|---|---|
| Testament | ✅ / ❌ |
| Book (first appearance) | ✅ / 🟡 same testament section / ❌ |
| Role (prophet, king, apostle, judge, patriarch, etc.) | ✅ / 🟡 partial overlap / ❌ |
| Tribe / Nation | ✅ / ❌ |
| Era | ✅ / ⬆️ earlier / ⬇️ later |
| Gender | ✅ / ❌ |

- Tiles flip in sequentially (staggered CSS 3D flip animation).
- Autocomplete search input over the character list.
- Unlimited guesses; guess count shown in share result.

### 2. Quote mode
- Show a quote spoken by (or about) the character; guess who.
- Each wrong guess reveals a hint: book → chapter → first letter.

### 3. Emoji mode
- Character represented by up to 5 emojis; start with 1, reveal one more per wrong guess.

### 4. Verse mode
- Show a verse (text only, no reference); guess which **book** it's from.
- Feedback per guess: ✅ correct book / 🟡 right section (Law, History, Wisdom, Prophets, Gospels, Acts/Epistles, Revelation) / ❌ wrong testament, plus ⬆️/⬇️ arrow toward the book's canonical position.
- Wrong guesses progressively reveal: testament → section → chapter count hint.

### 5. Scripture or Shakespeare mode
A daily multi-round "which is it?" round-robin — the shareable/viral hook. Both
corpora are public domain (KJV already bundled; Shakespeare added), so no
licensing wrinkle.

- **Loop:** 8 passages per day, one at a time. Two big choice buttons —
  📖 **Scripture** / 🎭 **Shakespeare**. Tap one → the card does a 3D flip
  reveal (reuse Classic's flip keyframes) showing right/wrong + the true
  attribution (e.g. "Ecclesiastes 1:2" or "Macbeth, Act V"), a running tally
  ticks, then **Next →**. After round 8 a results modal opens.
- **No single "answer"** and **no character**, so (like Verse mode) there is
  **no AI chat** and **no version toggle** — KJV is the scripture baseline.
- **Difficulty is the feature:** KJV's Early-Modern-English cadence overlaps
  Shakespeare's, so honest mistakes are common — those near-misses are exactly
  what people screenshot. Curate the pool toward genuinely ambiguous passages
  (archaic, aphoristic) and trim anything with dead giveaways ("verily",
  "thy kingdom", obvious proper nouns like "Romeo").
- **Deterministic daily set:** date-hash deterministically shuffles the pool and
  takes 8, clamped to **≥2 of each source** so no degenerate all-one-source day.
  The Scripture/Shakespeare split is intentionally *not* fixed at 4/4 so players
  can't game the count.
- **Feedback per round:** 🟩 correct / 🟥 wrong (no 🟨). Immediate, per-passage.
- **Share (spoiler-free):** the green/red grid in round order + score, e.g.
  ```
  Bibdle 🎭 Scripture or Shakespeare — 2026-06-17
  🟩🟩🟥🟩🟩🟩🟥🟩
  6/8
  https://bibdle-daily.vercel.app
  ```
  Order is preserved but *which* passage was which is not revealed, so friends
  can play the same daily. Surfaces the other-modes quick links like every mode.
- **Stats/streak:** finishing the daily run counts as the "win" for streak
  purposes (streak = consecutive days completed — forgiving, drives return).
  The existing `guessDistribution` slot is repurposed as a **score
  distribution** (score 0–8 → count). A perfect-run (8/8) streak is a possible
  future brag metric.

#### Engineering touchpoints
- `src/data/types.ts` — add `BardPassage { id; text; source: "scripture" | "shakespeare"; attribution: string }`.
- `src/data/bardPassages.ts` — new curated pool (~60–100 items, roughly balanced). Scripture entries are KJV; reuse/extend `verses.ts` style.
- `src/lib/daily.ts` — add `ModeId` member `"shakespeare"`; add `dailyBardRound(key)` returning the 8 picks via deterministic shuffle + ≥2-each clamp.
- `src/lib/modes.ts` — register `{ id: "shakespeare", title: "Shakespeare", icon: "🎭", blurb: "Bible verse or the Bard?" }`.
- `src/lib/share.ts` — `buildShareText` is currently guess-count phrased ("Solved in N guesses"); branch on score-based modes to emit `${score}/8` instead. Confirm `ShareModal` passes the score through.
- `src/lib/useDailyState.ts` — state shape `{ picks: (Source | null)[]; done: boolean }`.
- `src/components/ShakespeareGame.tsx` (+ reuse `GuessGame.module.css`, add a flip-card / choice-button block) and `src/app/shakespeare/page.tsx` route.
- No `CharacterSearch`, no `CharacterChat`, no `VersionToggle` for this mode.

### Future modes (backlog)
- Relation mode (genealogy clues).
- Object/symbol mode.
- Timeline ordering mode.
- Connections-style daily (4 hidden biblical groups; NYT-Connections share grid).
- Higher/Lower (lifespans, chapter counts).

## AI character chat — ✅ implemented
- Unlocks per-mode after a correct guess ("Talk to David →") in Classic, Quote,
  and Emoji modes. (Verse mode has no character, so no chat there.)
- Serverless API route `/api/chat`: validates the character is actually unlocked today (client sends solved proof token or simply the date-derived character id — acceptable for portfolio), injects persona system prompt, streams response.
- Persona prompt: speak in character, ground answers in the biblical narrative, gracefully deflect off-topic/modern questions, keep replies short.
- Caps: ~10 messages/day/user, max token limits, typing animation.
- **Status:** Implemented via `src/app/api/chat/route.ts` + a provider-abstracted
  `src/lib/llm.ts` (default Google Gemini Flash over plain `fetch`, no SDK). The
  build/route degrade gracefully with no `GEMINI_API_KEY` set. Daily cap +
  per-message length/count limits enforced client- and server-side.

## UX / animation requirements
- Tile flip reveal (staggered), shake on invalid guess, pure-CSS confetti burst in the win/share popup — all pure CSS.
- Per-mode stats tracked in localStorage: games played, win rate, current streak, max streak, guess distribution. Streak increments on consecutive daily wins and resets on a missed day; shown in the share popup.
- Mode-select landing page: animated card grid (CSS grid, hover transforms).
- Smooth page/mode transitions; dark mode default with light toggle.
- Mobile-first responsive (grid reflow), accessible (reduced-motion media query, ARIA on tiles).
- Share: on win, a share popup (animated modal) shows the spoiler-free emoji-grid result with a copy-to-clipboard button (toast confirmation) and native `navigator.share` on mobile. The popup also surfaces quick links to the other game modes, highlighting the ones not yet played today, so players can switch modes without returning to the main menu.

## Data requirements
- ~80–150 characters with: name, aliases, testament, book, role(s), tribe/nation, era (ordinal + label), gender, emojis[], quotes[] (with reference), persona notes for chatbot.
- Stored as typed JSON; one source of truth shared by all modes.

## Bible version switcher — ✅ infrastructure implemented
- KJV ↔ NIV switch on the scripture-text modes (Quote, Verse), persisted to
  `localStorage` (`bibdle:version`, default KJV) via `src/lib/version.ts`.
- KJV is the populated baseline (existing inline text); NIV is wired end-to-end
  but unpopulated — marked "coming soon" and falls back to KJV with a note.
- Adding NIV later: fill `src/data/translations.ts` (override map keyed by
  verse `reference`) and add the version to `POPULATED_VERSIONS`. No churn to
  `characters.ts` / `verses.ts`.

## Non-goals (v1)
- Accounts, server-side persistence, leaderboards.
- Multiple languages. (Multiple English translations: infrastructure now in
  place; only KJV populated.)
- Anti-cheat beyond obscuring the daily answer.

## Milestones
1. **Scaffold + data:** Next.js setup, character dataset, daily-seed logic.
2. **Classic mode:** board, autocomplete, attribute comparison, flip animations.
3. **Quote, Emoji + Verse modes:** shared game shell, mode-specific reveal logic; verse dataset (books metadata + verse pool).
4. **Polish:** stats/streaks, share results, landing page, transitions, a11y.
5. **AI chat:** serverless route, persona prompts, streaming chat UI, caps.
6. **Deploy:** Vercel, OG images, README/portfolio writeup.

## Success criteria
- All four modes playable daily with consistent answers across users.
- Lighthouse 90+ performance on free-tier deploy.
- Chat stays in character and within free-tier/API budget.
