# Product Requirements Document
## Who Goes First? — Tally v8

**Version:** v1.0
**Status:** Draft
**Last Updated:** 2026-05-10

---

## 1. Overview

### 1.1 Product Summary

Who Goes First? is a new tool in Tally's Tools hub that helps board game groups decide who plays first. A player taps "Draw" and the app runs a slot-machine animation cycling through situational prompts before landing on one. The group reads it aloud, decides who it applies to, and that person goes first. If the prompt doesn't land, any player can tap "Re-roll" to run the animation again with a new prompt.

### 1.2 Goals

- Eliminate the "who goes first?" friction at the start of every game session with a single tap.
- Create a fun, shared social moment through an animated prompt reveal that the whole group watches together.
- Be instantly usable — no setup, no player selection, no configuration.

### 1.3 Non-Goals

- No prompt history or session-level deduplication — the same prompt can appear twice in a session.
- No player assignment — the tool never names a specific player as the result; the group decides together.
- No category filtering — all 200+ prompts are in one pool.
- No custom prompt creation — only the built-in list.
- No backend persistence — nothing is saved to the server or database.

---

## 2. User Stories

1. As a player, I want to open the First Player Picker and see a single clear call-to-action, so I understand immediately what to do without reading instructions.
2. As a player, I want to tap one button to start the reveal, so getting a prompt requires no setup.
3. As a player, I want to see text cycle rapidly through prompts and decelerate to a stop (slot-machine style), so the reveal feels dramatic and fun for the whole group.
4. As a player, I want the final prompt displayed in large, centered text, so everyone at the table can read it without passing the device around.
5. As a player, I want a "Re-roll" button visible after the prompt is revealed, so the group can draw again if the first prompt is unclear or doesn't apply to anyone.
6. As a player, I want re-rolls to be unlimited, so the group is never stuck on a prompt that doesn't work.
7. As a player, I want each re-roll to replay the full animation, so the re-roll feels as exciting as the first draw.
8. As a player, I want a way to reset back to the idle state, so I can use the tool again at the start of the next game without navigating away.
9. As a player on mobile, I want prompt text large enough to read from across a table, so I don't have to pass the device.
10. As a player using the Tools hub, I want to see First Player Picker listed as a tool card with a short description, so I know it exists and what it does.
11. As a player mid-animation, I want the Draw button to be disabled or replaced, so I can't accidentally trigger a second draw before the first one finishes.
12. As a player on a slow device, I want the animation to remain smooth and the prompt pool to load instantly, so the experience never feels sluggish.

---

## 3. Features & Requirements

### 3.1 Idle State

The entry state when the tool is opened or after a reset.

**Requirements:**

- Display the tool name and a one-line description of how it works (e.g. "Draw a prompt — whoever it fits goes first").
- Show a single prominent "Draw" button, centered on the screen.
- No player selection, no configuration inputs, no settings required before drawing.

### 3.2 Animated Reveal

The transition from idle to revealed, triggered by tapping "Draw" or "Re-roll".

**Requirements:**

- Animation begins immediately on tap — no loading delay.
- Text cycles through real prompts randomly drawn from the full pool at high speed.
- Speed decelerates over approximately 2 seconds, landing on the final selected prompt.
- The final prompt is selected before the animation starts (the deceleration is cosmetic — the result is predetermined).
- The Draw button is visually disabled or hidden while the animation is running.
- The animation must not introduce new npm dependencies — implement with `useEffect` and `setInterval` or `requestAnimationFrame`.

### 3.3 Revealed State

The state after the animation settles on a prompt.

**Requirements:**

- Final prompt displayed in large, centered text — minimum 32px font size on a 375px viewport.
- "Re-roll" button visible below the prompt; tapping it reruns the full animation with a new randomly-selected prompt.
- Re-rolls are unlimited.
- A "Reset" or "Draw again" action returns the tool to the idle state.
- No additional information is shown (no category label, no prompt ID).

### 3.4 Prompt Data

**Requirements:**

- All 202 prompts from `changes/v8/first_player_prompts.csv` are bundled as a static TypeScript constant at `client/src/data/firstPlayerPrompts.ts`.
- Prompt shape: `{ id: number; prompt: string; category: string }`.
- Random selection is uniform across the full pool — no category weighting.
- No deduplication required within a session.
- Prompts are available synchronously at runtime — no async fetch.

### 3.5 Tools Hub Integration

**Requirements:**

- A new tool card added to `pages/Tools.tsx` linking to `/tools/first-player`, following the existing card pattern.
- Card displays the `Dices` Lucide icon and a short subtitle (e.g. "Decide who goes first").
- Route `/tools/first-player` registered in `App.tsx` inside the existing `OnboardingGuard > Layout` wrapper.

---

## 4. UI/UX Guidelines

- **Responsiveness:** Mobile-first. The tool is used by a group gathered around a phone or tablet — legibility at arm's length is the primary constraint.
- **Navigation:** Standard app nav via the Layout component; no custom back button needed.
- **Prompt text size:** Should scale to fill available width, similar to the Timer's `text-[18vw]` approach — the prompt must be readable from ~1 meter on a typical phone.
- **Animation feel:** Fast-and-frantic at the start, slowing noticeably in the last ~0.5 seconds so the group can feel the suspense of it settling. Text should visibly change multiple times per frame at peak speed.
- **Destructive actions:** N/A — no destructive actions exist in this tool.
- **Empty states:** N/A — the prompt pool is always populated.
- **Single-screen experience:** No dialogs, no overlays, no multi-step flows. Everything happens on one page.
- **Consistency:** Match the visual language of the Timer tool — same card/border style, same button components from shadcn/ui.

---

## 5. Technical Considerations

### 5.1 Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React + TypeScript | Same as all other pages |
| Styling | Tailwind CSS + shadcn/ui | Use existing Button component; no new UI packages |
| Icons | Lucide React | Already installed |
| Animation | `useEffect` + `setInterval` / `requestAnimationFrame` | No new animation libraries |
| Data | Static TS const | Bundled at build time from the CSV |
| Backend | None | Pure client-side |

### 5.2 Data Models

#### Prompt

A single entry from the prompt pool.

Key fields: `id: number`, `prompt: string`, `category: string`

Relationships: None — standalone data, not linked to any other entity in the app.

**Business Logic:** Random selection picks one prompt uniformly from the full array using `Math.floor(Math.random() * prompts.length)`. A second random prompt is pre-selected before the animation runs so the deceleration can anticipate the final value.

### 5.3 Key Constraints & Decisions

- No new npm dependencies — animation must be hand-rolled.
- Prompts bundled at build time (not fetched at runtime) — no network dependency during tool use.
- No changes to the server or database schema.
- Page follows the same self-contained component pattern as `Timer.tsx` — all sub-components live in the same file unless they grow large enough to warrant extraction.

### 5.4 Modules to Build or Modify

| Module | New / Modify | Notes |
|---|---|---|
| `client/src/pages/FirstPlayer.tsx` | New | Main page component — owns idle, animating, and revealed states |
| `client/src/data/firstPlayerPrompts.ts` | New | Static array of all 202 prompts, typed as `{ id: number; prompt: string; category: string }[]` |
| `client/src/pages/Tools.tsx` | Modify | Add tool card for First Player Picker |
| `client/src/App.tsx` | Modify | Register `/tools/first-player` route |

---

## 6. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Animation start latency | < 50ms from tap to first frame |
| Full animation duration | ~2–2.5 seconds |
| Prompt text legibility | ≥ 32px on 375px viewport; readable at ~1 meter |
| Page load time | Instant — no async data; prompts are a static import |
| Re-roll response time | < 50ms from tap to animation restart |
| Bundle size impact | Negligible — 202 short strings add < 20 KB uncompressed |

---

## 7. Out of Scope (v8)

- Category filtering — players cannot restrict draws to a specific category.
- Prompt deduplication — no tracking of which prompts have already been shown in a session.
- Custom prompts — players cannot add their own prompts to the pool.
- Player name integration — the tool never suggests or selects a player name as the answer.
- Usage analytics or logging.
- Backend persistence of any kind.
- Sound effects or haptic feedback.

---

## 8. Open Questions

| # | Question | Owner | Status |
|---|---|---|---|
| 1 | ~~What should the tool be called in the UI?~~ Resolved: **"Who Goes First?"** | Product | Resolved |
| 2 | ~~Which Lucide icon for the Tools hub card?~~ Resolved: **`Dices`** | Design | Resolved |
| 3 | ~~Placeholder vs. real prompts during animation?~~ Resolved: **cycle real prompts** | Product | Resolved |

---

*End of Document*
