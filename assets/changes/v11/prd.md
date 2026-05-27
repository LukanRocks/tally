# Product Requirements Document
## Score Counter Tool

**Version:** v11
**Status:** Draft
**Last Updated:** 2026-05-27

---

## 1. Overview

### 1.1 Product Summary

Score Counter is a new in-session tool that lets players track and tally raw game scores in real time. It is a stateless, client-only utility that lives under `/tools/score-counter` alongside the existing dice roller, turn timer, and first-player picker. Users pick their players, freely add points to any player at any time using preset buttons or a numpad, then see a ranked results screen with a direct shortcut to log that count as a Tally session.

### 1.2 Goals

- Let players count and track in-game scores digitally without pen and paper, handling any game where points accumulate over time.
- Produce a ranked result at the end that can be immediately submitted as a Tally session — removing friction between the game ending and the session being logged.
- Support both "highest wins" and "lowest wins" scoring directions to cover golf-style games.

### 1.3 Non-Goals

- Per-game scoring presets or game-specific scoring rules (marked "SOON" in designs — future version).
- Guest/temporary players not in the Tally player database.
- Persisting score data to the database — the tool is stateless; only the resulting session (if the user chooses to create one) is written to the DB.
- Editing or reviewing a past count after navigating away.

---

## 2. User Stories

1. As a player, I want to open a score counter from the Tools hub, so that I can track points during a game without leaving the Tally app.
2. As a player, I want to select which players are at the table at the start, so that the score sheet reflects who's actually playing.
3. As a player, I want a minimum of 2 players to be required, so that the tool doesn't produce a meaningless single-player result.
4. As a player, I want to optionally tag the count with a game from my library, so that if I create a session later the game is already pre-selected.
5. As a player, I want to choose whether highest or lowest score wins before counting starts, so that the final ranking is correct for my game type.
6. As a player, I want to tap a quick-add preset (+1, +5, +10, +25, +50, +100, −1, −5) to instantly add points to the active player, so that scoring is fast and thumb-friendly.
7. As a player, I want to type any arbitrary number on a numpad and confirm it, so that I can add any point value that the quick presets don't cover.
8. As a player, I want the ± key on the numpad to toggle the sign of my typed value, so that I can enter negative scores without a separate UI.
9. As a player, I want to switch the active player by tapping their name on the score sheet, so that I can score players in any order without being forced through a sequence.
10. As a player, I want the active player to be visually distinct (gold ring, highlighted card, "ACTIVE" badge), so that I always know who I'm adding points to.
11. As a player, I want to see each individual entry logged as a chip (#1 +5, #2 −1) inside the active player card, so that I can review what was added.
12. As a player, I want an "Undo last" action on the active player's entries, so that I can correct a mis-tap without resetting the whole count.
13. As a player, I want all player scores to start at 0 (not blank), so that the sheet is immediately readable without needing to scroll or count.
14. As a player, I want to see all players' running totals on the score sheet at all times, so that I can check standings without leaving the counting step.
15. As a player, I want the "Add +" confirm button to be disabled when the numpad buffer is empty or zero, so that I don't accidentally submit a no-op entry.
16. As a player, I want to reach the results screen by pressing "View results" (or navigating to Step 3), so that I can see the final ranking whenever I decide the game is over.
17. As a player, I want the results screen to show a winner hero card with the top player's name, score, and a crown icon, so that the conclusion of the game feels celebratory.
18. As a player, I want all players listed in ranked order with a proportional horizontal bar chart (each player a distinct color), so that the score spread is visible at a glance.
19. As a player, I want ties broken by the order players were selected in Setup (first selected = better rank), so that the ranking is always deterministic.
20. As a player, I want a "New count" action on the results screen that returns to Step 1, so that I can immediately start a fresh count for another game.
21. As a player, I want a "Create session from this" action that navigates to the SessionLogger pre-filled with the ranked player list (and the selected game if one was tagged), so that logging a session takes seconds, not minutes.
22. As a player, I want a "Done" action that exits back to the Tools hub, so that I can leave without logging a session.
23. As a player, I want a "Cancel" button on the Setup screen that exits to the Tools hub, so that I can back out before starting.
24. As a player, I want the step indicator (1 · SETUP — 2 · COUNT — 3 · RESULT) visible at the top throughout the flow, so that I know where I am.
25. As a player, I want the Score Counter to appear as a card on the Tools hub `/tools`, so that I can discover and launch it from the existing tools list.

---

## 3. Features & Requirements

### 3.1 Step 1 — Setup

The entry point for the tool. Users configure who's playing, optionally which game, and the scoring direction before starting.

**Requirements:**

- Page header shows "TOOL · SCORE COUNTER · STEP 1 / 3" and the step indicator (1 · SETUP active, 2 · COUNT, 3 · RESULT).
- Page title is "Set up the count".
- **Players section** ("Who's at the table?"):
  - Displays all non-deleted `person`-type players from `GET /api/v1/players` as tappable chips.
  - Each chip shows the player's avatar (or initial fallback), name, and a checkmark when selected.
  - A badge in the section header shows "N picked" (count of selected players).
  - Selecting/deselecting a chip toggles that player's inclusion.
  - Minimum 2 players must be selected before "Start counting →" is enabled.
  - Selection order is preserved (determines tie-breaking on the results screen).
  - "Add guest" is **not** implemented in v11.
- **Game section** ("What are we playing?") — optional:
  - Helper text: "tag the count to save as a session later".
  - Always shows a "Just counting" option (no game tag) as the default selected state.
  - Scrollable horizontal list of games from the library (`GET /api/v1/games`) below "Just counting". Each game card shows cover image, name, and player count + duration metadata.
  - Tapping a game selects it (replaces "Just counting"); tapping "Just counting" deselects any game.
  - Per-game scoring presets are shown as game cards but labeled **SOON** and are non-interactive in v11.
- **Scoring section** ("Which way is up?"):
  - Two mutually exclusive options: "Highest wins — most points takes it" and "Lowest wins — golf-style, fewer is better".
  - "Highest wins" is selected by default.
- Footer: "Cancel" (left, navigates to `/tools`) and "Start counting →" (right, primary button, disabled until ≥2 players selected).

### 3.2 Step 2 — Count

The main scoring interface. Players are freely switchable; points are added to whoever is active.

**Requirements:**

- Page header shows "SCORE SHEET · N PLAYERS" and the hint "tap a name to switch". Step indicator shows step 2 active.
- **Active player card** (left/top panel):
  - Displays the active player's avatar (with gold ring treatment), name, current total score, "N entries" count, and "ACTIVE" badge.
  - Score starts at 0 for all players.
  - Below the player info: an ENTRIES section listing each committed entry as a chip in format `#N +VALUE` or `#N −VALUE`, numbered sequentially starting at #1.
  - "Undo last" button appears in the ENTRIES header area as soon as the active player has at least 1 entry. Pressing it removes the most recent entry for the active player only and recalculates their total. No confirmation required.
  - When the active player has 0 entries, the ENTRIES area shows: "no points yet — tap a number or quick-add to start".
- **Inactive player list** (below the active card):
  - Each inactive player is listed as a row: avatar, name, "N entries", and their current running total on the right.
  - All players show `0` until they have entries.
  - Tapping any inactive player row makes them the active player. The previously active player moves to the inactive list.
- **Input panel** (right panel):
  - **Quick Add** section: 8 preset buttons: +1, +5, +10, +25, +50, +100 (positive, standard style), −1, −5 (negative, red-tinted style).
  - Tapping a quick-add button immediately creates a new entry for the active player with that value and updates their total. No confirm step needed.
  - **Numpad** section: digit keys 0–9 arranged in phone-style grid (7-8-9 / 4-5-6 / 1-2-3 / ± 0 ←).
    - `±` toggles the sign of the current input buffer.
    - `←` (backspace) removes the last digit from the input buffer.
    - An "Add +" confirm button below the numpad commits the buffer as a new entry for the active player. Disabled when the buffer is empty or evaluates to 0.
  - After committing via "Add +", the input buffer clears automatically.
- **End count**: A "View results →" button is fixed to the bottom of the Count screen (same footer pattern used on Setup and other screens in the app). Tapping it advances to Step 3. Available at any time — no minimum entries required.
- No round counter concept. The header does not track or display rounds.

### 3.3 Step 3 — Result

Presents the final ranking and gives the user options to act on the result.

**Requirements:**

- Page title is "Final tally". Header shows "TOOL · SCORE COUNTER · STEP 3 / 3". Step indicator shows step 3 active.
- **Winner hero card** (full-width, gradient background):
  - "top of the heap" label (italic, accent color).
  - Winner's avatar, name, entry count ("N entries"), large score, "POINTS" label, and a crown icon.
  - For "Lowest wins" direction: winner is the player with the lowest total. Copy and visual treatment should reflect this (e.g. adjust "top of the heap" accordingly — see Open Questions).
- **Ranking section** ("RANKING · HIGH TO LOW" or "RANKING · LOW TO HIGH" depending on scoring direction):
  - Section subtitle: "How everyone stacked up". Player count shown top-right.
  - Each row: rank number badge, avatar, player name, "N entries", "WINNER" badge on rank 1, proportional horizontal bar (scaled to the highest score), score on the right.
  - Each player's bar color is derived from their avatar color, consistent with their avatar ring in Step 2.
  - Ties are broken by player selection order from Setup (earlier-selected player gets the better rank).
  - Ranking direction: descending for "Highest wins", ascending for "Lowest wins".
- **Footer actions** (left to right):
  - "Done" — navigates to `/tools` (exits the tool).
  - "New count" (secondary, with reset icon) — navigates back to Step 1, resetting all state.
  - "Create session from this" (primary CTA) — navigates to `/sessions/new` via React Router state, pre-filling: ranked player list (player IDs with ranks derived from final score order) and selected game ID if one was tagged in Setup.

### 3.4 Tools Hub Card

The Score Counter needs to be discoverable from the existing tools hub.

**Requirements:**

- Add a new card to `/tools` (index.tsx) for Score Counter with an appropriate icon, title, and one-line description.
- Card links to `/tools/score-counter`.

### 3.5 SessionLogger Pre-fill

The SessionLogger must accept pre-filled data from the Score Counter result screen.

**Requirements:**

- `SessionLogger` reads `useLocation().state` on mount for an optional pre-fill payload: `{ players: { id: number; rank: number }[], gameId?: number }`.
- When a pre-fill payload is present, the player list and their ranks are populated automatically; the game picker pre-selects the given game if `gameId` is provided.
- The user can still adjust date, notes, and player selection before submitting.
- This must not break the existing SessionLogger flow when no state is provided.

---

## 4. UI/UX Guidelines

- **Navigation**: Forward-only step progression. Step indicator chips are display-only — tapping them does not navigate backwards. "New count" on the results screen is the only way to restart from Step 1.
- **Layout**: Split-panel on desktop — left panel for score sheet, right panel for input. On mobile, the panels stack (input below score sheet) or the input slides up as a sheet.
- **Active player clarity**: The gold ring on the avatar and the highlighted card background must make the active player unambiguous at all times, since mis-scoring the wrong player is the main failure mode.
- **Quick-add immediacy**: Preset buttons apply instantly (no confirm). This is intentional — speed is the goal. Undo last is the recovery path.
- **Numpad confirm**: "Add +" is disabled at 0 to prevent accidental zero-entries. After confirming, the buffer clears automatically so the next entry can start immediately.
- **Color consistency**: Each player's accent color (used for their avatar ring and bar chart) is derived from their avatar color. The same color is used in both Step 2 (score sheet) and Step 3 (bar chart).
- **Scoring direction**: All ranking, bar chart sorting, and winner logic must respect the chosen direction. "RANKING · HIGH TO LOW" or "RANKING · LOW TO HIGH" label updates accordingly.
- **Negative scores**: Fully supported. Running totals can go below 0 and must display with a minus sign.
- **No destructive confirmations for undo**: "Undo last" is low-stakes and should be instant. Confirm dialogs would slow the flow.
- **Loading states**: Player and game lists on Setup use the existing spinner/skeleton pattern from the rest of the app while fetching.
- **Error states**: If the players API fails on Setup, surface an inline error with a retry action.
- **Color tokens**: Use `text-ink-*` / `bg-paper-*` design system tokens throughout, not shadcn compat aliases.

---

## 5. Technical Considerations

### 5.1 Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React 19 + TypeScript | New page + custom hook |
| Routing | React Router v6 | New route + router state handoff to SessionLogger |
| Styling | Tailwind v4 + shadcn/ui atoms | Follows existing atom/molecule patterns |
| State | React local state (useState / useReducer) | Fully client-side — no DB writes during the count |
| Backend | No new endpoints | Reads existing `/players` and `/games`; session creation uses existing `POST /sessions` |

### 5.2 Data Models

#### ScoreCounter (client state only — not persisted)

All state lives in a custom hook (`useScoreCounter`). Nothing is written to the database until the user chooses to create a session.

Key state shape:
- `step`: `'setup' | 'count' | 'result'`
- `players`: ordered array of selected player IDs (order determines tie-breaking)
- `gameId`: `number | null`
- `scoringDirection`: `'highest' | 'lowest'`
- `scores`: map of `playerId → { entries: number[], total: number }`
- `activePlayerId`: `number | null`
- `inputBuffer`: `string` (numpad digits in progress)

#### Business Logic

- **Total score**: sum of all entries for a player. Entries can be positive or negative.
- **Ranking**: sort by total score descending (highest wins) or ascending (lowest wins). Ties broken by index in the original `players` array (lower index = better rank).
- **Undo last**: removes the last element from `scores[activePlayerId].entries` and recalculates the total.
- **Session pre-fill rank**: player with rank 1 has the best score per the scoring direction. Maps directly to `session_results.rank`.

### 5.3 Key Constraints & Decisions

- Purely client-side state — no new backend routes, no new DB schema changes required for v11.
- The tool is ephemeral: navigating away loses all progress. No persistence, no "resume" flow.
- `SessionLogger` pre-fill uses React Router state (passed via `navigate('/sessions/new', { state: payload })`). This is non-breaking: SessionLogger must still work normally when state is absent.
- Minimum 2 players enforced at Setup, matching the existing session creation validation on the backend.

### 5.4 Modules to Build or Modify

| Module | New / Modify | Notes |
|---|---|---|
| `/web/src/pages/tools/score-counter.tsx` | New | Main page component, orchestrates the 3-step flow |
| `/web/src/hooks/useScoreCounter.ts` | New | All scoring state logic — entries, undo, totals, ranking, step transitions |
| `/web/src/pages/tools/index.tsx` | Modify | Add Score Counter card to the tools hub |
| `/web/src/routes.tsx` | Modify | Register `/tools/score-counter` route |
| `/web/src/pages/SessionLogger.tsx` | Modify | Read `useLocation().state` to accept pre-filled players + game |

---

## 6. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Quick-add responsiveness | Tapping a preset button must update the score display in < 100ms (local state update, no network call) |
| Players list load time | Player chips on Setup must render within the existing API response time for `GET /players` (no new latency) |
| Accessibility | Active player and rank 1 states must not rely solely on color — use badges and labels as redundant indicators |
| Mobile usability | Input panel must be reachable without scrolling on common phone screen sizes (stacked layout) |

---

## 7. Out of Scope (v11)

- **Per-game scoring presets**: game-specific pre-configured scoring rules (shown as "SOON" in designs). Future version.
- **Guest players**: adding unnamed participants not in the Tally player database.
- **Count persistence**: resuming a count after navigating away or closing the browser.
- **Edit past entries**: only "undo last" is supported; no arbitrary entry editing or reordering.
- **Multi-winner detection**: if two players tie for 1st, the first-selected player wins. Shared-winner UI is not handled.
- **Winner hero copy for "Lowest wins"**: the exact copy for the results hero card when scoring direction is "Lowest wins" is deferred (see Open Questions).
- **Score counter linked from SessionLogger**: the inverse flow (launching Score Counter from within a session log) is not in scope.

---

## 8. Open Questions

| # | Question | Owner | Status |
|---|---|---|---|
| 1 | What is the winner hero card copy for "Lowest wins" direction? "Top of the heap" reads wrong for golf-style. Options: "fewest points wins", "least is best", or something else. | Product | Open |
| 2 | Should "View results →" on the Count step require any minimum (e.g. at least 1 entry total), or can the user navigate to results with all-zero scores? | Product | Open |
| 3 | How should the bar chart render when all players have 0 points (e.g. user navigates to results immediately)? Equal bars, no bars, or hide the chart? | Engineering | Open |

---

*End of Document*
