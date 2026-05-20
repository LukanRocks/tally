# Product Requirements Document
## Tally — Tools Hub & Turn Timer

**Version:** v7
**Status:** Draft
**Last Updated:** 2026-05-08

---

## 1. Overview

### 1.1 Product Summary

This version introduces a **Tools** section to Tally — a dedicated area for in-session utilities that complement the existing game library, session logging, and leaderboard features. The first tool is a **Turn Timer**: a full-screen countdown timer designed to be used mid-game, with a visually prominent background animation that communicates urgency at a glance without requiring players to read numbers.

### 1.2 Goals

- Give players a fast, low-friction way to set and run a countdown timer during a board game session.
- Communicate time pressure visually through a color-draining background, reducing cognitive load mid-game.
- Establish the `/tools` route as a composable hub that future tools (dice roller, score calculator, etc.) can slot into.

### 1.3 Non-Goals

- The timer does not integrate with session logging or record any data — it is entirely in-memory and stateless across page loads.
- No sound or vibration on expiry (browser audio API complexity, mobile permission friction — deferred).
- No multi-timer support (only one timer at a time).
- No timer history or presets persistence (not saved to the database).

---

## 2. User Stories

1. As a player, I want to open a timer from the main navigation, so that I can access it quickly without interrupting the game flow.
2. As a player, I want to see all available tools on a hub page, so that I know what utilities Tally offers beyond game tracking.
3. As a player, I want to enter a custom duration before starting the timer, so that I can match it to the specific time limit for my game.
4. As a player, I want to select a preset duration (e.g. 30s, 1m, 2m, 5m), so that I can start the timer without typing.
5. As a player, I want to press play and see the countdown fill the screen, so that all players at the table can see how much time is left.
6. As a player, I want the background to drain from top to bottom as time passes, so that I can read urgency without focusing on the number.
7. As a player, I want the background to be green when time is plentiful, transition to yellow in the last 40–20% of time, and turn red in the final 20%, so that urgency is communicated progressively.
8. As a player, I want the screen to flash red and the timer to freeze at zero, so that I know time has expired.
9. As a player, I want to pause the timer mid-countdown, so that the game can be interrupted without losing the current count.
10. As a player, I want to resume a paused timer, so that the countdown continues from where it stopped.
11. As a player, I want to restart the timer immediately while it is running, so that I can pass the turn to the next player without going back to setup.
12. As a player, I want to stop the timer and return to setup, so that I can set a new duration for the next round.
13. As a player, I want to add +10, +30, or +60 seconds to the running timer, so that I can extend the time limit on the fly without restarting.
14. As a player, I want the +sec buttons to be disabled after time runs out, so that expired timers cannot be extended unexpectedly.
15. As a player, I want the timer to stay visible if I accidentally tap the screen, so that casual interaction doesn't disrupt the countdown.
16. As a player, I want the setup screen to show a sensible default duration when I open the timer, so that I can start quickly without configuration.

---

## 3. Features & Requirements

### 3.1 Tools Hub (`/tools`)

A landing page that lists all available in-session tools. Currently contains only the Timer.

**Requirements:**

- Route: `/tools`
- Displays a card or entry point for each available tool with a name and short description.
- Navigates to the individual tool's route on selection (e.g. `/tools/timer`).
- "Tools" is added as a top-level item in the existing navigation bar, using the `Wrench` icon from lucide-react.
- **Mobile nav note:** The bottom nav currently has 5 items; adding Tools makes 6, which is cramped on small screens. This is accepted for now — a better entry point (e.g. home page shortcut, overflow menu) will be addressed in a future version.
- Empty-state is not applicable — the timer card is always present.

---

### 3.2 Timer Setup State

The initial state of `/tools/timer` before the countdown starts.

**Requirements:**

- Displays a time input and a set of preset buttons.
- Preset buttons: **30s**, **1m**, **2m**, **5m**. Tapping a preset populates the input field and does not auto-start.
- Custom input accepts minutes and seconds (e.g. `mm:ss` format or two separate fields — implementation choice, but must support sub-minute precision).
- A **Play** button starts the countdown and transitions to the Active state.
- The Play button is disabled if the entered duration is zero or invalid.
- Default value on open: **1 minute**.

---

### 3.3 Timer Active State

The full-screen countdown experience.

**Requirements:**

- The countdown (`mm:ss`) is centered on the screen, large and legible from across a table.
- The timer renders inside the existing Layout shell (sidebar on desktop, bottom nav on mobile). "Full-screen" refers to the timer filling the `<main>` content area, not the browser viewport.
- The background fills from **top to bottom** with a solid color. The filled portion represents elapsed time; the unfilled portion (below) represents remaining time. As time passes, the fill descends.
- Color thresholds based on percentage of total duration remaining:
  - **> 40% remaining** → green (`#22c55e` or equivalent)
  - **20–40% remaining** → yellow (`#eab308` or equivalent)
  - **< 20% remaining** → red (`#ef4444` or equivalent)
  - Transitions between colors should be smooth (CSS transition or interpolation, not a hard cut).
- The fill animation updates continuously (not in discrete jumps).
- **Primary actions** (always visible):
  - **Stop** — returns to Setup state; resets all progress.
  - **Restart** — immediately resets the countdown to the original duration and resumes running. Does not pass through Setup.
  - **Pause / Play** — toggles between paused and running. Button label and icon reflect current state.
- **Secondary actions** (visible during active/paused state):
  - **+10s**, **+30s**, **+60s** — adds the specified seconds to the remaining time.
  - These buttons are disabled when the timer is in the Expired state.
- Primary and secondary actions must remain accessible without scrolling on common mobile screen sizes.

---

### 3.4 Timer Expired State

Triggered when the countdown reaches zero.

**Requirements:**

- Timer freezes at `00:00`.
- The entire screen background becomes solid red.
- The background fill animation stops.
- **+sec buttons are disabled.**
- **Stop** and **Restart** remain functional — Stop returns to Setup, Restart resumes from the original duration.
- No sound or visual flash animation is required in v7 (deferred).

---

## 4. UI/UX Guidelines

- **Responsiveness:** Mobile-first. The timer is designed to sit on a table and be read from a distance — large typography, high contrast, full-screen background. Desktop should also work cleanly.
- **Navigation:** "Tools" added to the existing top-level nav bar alongside Games, Sessions, Leaderboard, etc.
- **Timer typography:** The countdown display should be the dominant visual element — font size should be large enough to be legible at arm's length (target: ~15–20vw or equivalent).
- **Action placement:** Primary actions (Stop, Restart, Pause/Play) at the bottom of the screen. Secondary actions (+sec) below or alongside, clearly subordinate in visual weight.
- **Color transitions:** Use CSS transitions or a continuous interpolation on the background to avoid jarring color jumps at thresholds.
- **Background layering:** The color fill is a background element — the countdown and action buttons sit on top with sufficient contrast (white text recommended over all three colors).
- **No confirmation dialogs** for Stop or Restart — these are in-session controls that need to be fast.
- **Loading states:** No async operations — the timer is entirely client-side. No loaders needed.
- **Error states:** If an invalid duration is entered, the Play button is simply disabled — no error toast needed.

---

## 5. Technical Considerations

### 5.1 Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React + Vite | Existing stack — timer is a pure client-side feature |
| UI | shadcn/ui + Tailwind CSS | Use existing component primitives; background animation via inline styles or Tailwind utilities |
| Backend | Node.js + Express.js | No backend involvement — timer is entirely in-memory |
| Database | SQLite via Drizzle ORM | Not used for this feature |

### 5.2 Data Models

No persistent data models are introduced in this version. All timer state is ephemeral React state within the `TimerEngine` module. Nothing is written to the database.

#### Business Logic — Color Thresholds

Given `remaining` (seconds left) and `total` (original duration in seconds):

```
pct = remaining / total  // 0.0 → 1.0

if pct > 0.40  → green
if pct > 0.20  → yellow
if pct <= 0.20 → red
```

The fill height of the background element:

```
fillHeight = (1 - pct) * 100  // percentage from top, in %
```

At `pct = 1.0` (full time remaining), fill is 0% (no color visible at top).
At `pct = 0.0` (expired), fill is 100% (entire background is colored).

### 5.3 Key Constraints & Decisions

- Timer state is not persisted — navigating away resets everything. This is intentional (see Non-Goals).
- `setInterval` (1s tick) is acceptable for this use case; sub-second precision is not required. However, the implementation should track elapsed wall-clock time (using `Date.now()` deltas) rather than counting ticks, to avoid drift from tab throttling.
- The fill animation should run via CSS (e.g. transitioning a `height` or `clip-path` property) rather than re-rendering on every frame, to keep it smooth without a `requestAnimationFrame` loop.
- No new npm dependencies should be introduced for the timer itself — it is achievable with React state, `useEffect`, and CSS.

### 5.4 Modules to Build or Modify

| Module | New / Modify | Notes |
|---|---|---|
| `ToolsPage` | New | `/tools` route — hub page listing available tools |
| `TimerPage` | New | `/tools/timer` — composes Setup and Active views, owns routing between states |
| `TimerEngine` (`hooks/useTimer.ts`) | New | Pure logic hook (`useTimer`) — state machine (idle → running → paused → expired), tick management, wall-clock drift correction, expiry detection |
| `TimerDisplay` | New | Presentational component defined in `TimerPage.tsx` — centered countdown, full-screen color-fill background, driven by `pct` prop |
| `TimerControls` | New | Presentational component defined in `TimerPage.tsx` — primary and secondary action buttons; receives state and callbacks as props |
| `NavBar` | Modify | Add "Tools" nav item linking to `/tools` |
| `Router` | Modify | Register `/tools` and `/tools/timer` routes |

---

## 6. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Timer accuracy | Drift < 1s over a 10-minute countdown (wall-clock correction required) |
| Animation smoothness | Background fill transitions at 60fps on mid-range mobile hardware |
| Legibility distance | Countdown readable from ~1m away on a standard phone screen |
| No dependencies added | Timer implemented with React + CSS only — no new npm packages |
| Mobile compatibility | Works on iOS Safari and Android Chrome without screen-lock interference (best-effort — browser limitations apply) |

---

## 7. Out of Scope (v7)

- Sound or haptic feedback on expiry.
- Persisting custom presets or last-used duration to the database.
- Multiple concurrent timers.
- Integration with session logging (e.g. auto-filling session duration).
- Visual flash/strobe animation at expiry.
- Background running when the screen locks (not controllable from a web app).
- Any other tools beyond the Timer (dice roller, score calculator, etc. — future versions).

---

## 8. Open Questions

| # | Question | Owner | Status |
|---|---|---|---|
| 1 | Should the Restart action require confirmation if the timer has more than N seconds remaining, or always be instant? | Product | Open |
| 2 | What is the exact default preset on open — 1 minute hardcoded, or the last-used value (would require sessionStorage)? | Product | Open |
| 3 | Should the Tools nav item appear for all users unconditionally, or only when at least one tool is available (currently always true, but relevant as the hub grows)? | Product | Open |

---

*End of Document*