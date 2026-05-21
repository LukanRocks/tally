# Product Requirements Document
## Dice Roller — Tally v9

**Version:** v9
**Status:** Draft
**Last Updated:** 2026-05-10

---

## 1. Overview

### 1.1 Product Summary

Dice Roller is a new tool in Tally's Tools hub that lets players roll any standard polyhedral die during a board game session. Players pick a die type from a preset list (d2 through d100), choose how many to roll, and tap Roll — each die animates individually before landing on its result. Individual rolls and the total are shown together so nothing needs to be added up mentally at the table.

### 1.2 Goals

- Give players a fast, no-setup way to roll standard dice mid-session without reaching for a physical set.
- Show individual results and the total together, eliminating mental arithmetic at the table.
- Match the tactile excitement of rolling physical dice through a per-die animation that reveals results one beat at a time.

### 1.3 Non-Goals

- No mixed-type rolls in a single throw (e.g. 2d6 + 1d20) — all dice in one roll must be the same type.
- No modifiers — no +/- bonuses applied to the result or total.
- No roll history — nothing is saved between sessions or even between rolls.
- No persistence to the database — the tool is entirely in-memory.
- No custom die sizes beyond the eight standard presets.
- No sound or haptic feedback.

---

## 2. User Stories

1. As a player, I want to open the Dice Roller from the Tools hub, so that I can access it without interrupting game flow.
2. As a player, I want to see a clear list of standard die types on the setup screen, so that I can pick the right die immediately without typing.
3. As a player, I want to tap a preset (d4, d6, d20, etc.) and have it selected instantly, so that setup takes a single tap.
4. As a player, I want to set the number of dice to roll (1–10), so that I can roll multiple dice for games that require it.
5. As a player, I want to increment and decrement the dice count with stepper buttons, so that I don't need to type a number.
6. As a player, I want the Roll button to be disabled when the count is zero or invalid, so that I can't trigger an empty roll.
7. As a player, I want each die to animate with rapidly cycling face values before landing on its result, so that the roll feels exciting and tangible.
8. As a player, I want all dice to animate simultaneously and land around the same moment, so that the reveal feels unified rather than sequential.
9. As a player, I want the Roll button to be disabled while the animation is running, so that I can't accidentally trigger a second roll before the first is revealed.
10. As a player, I want to see each individual die result displayed after the animation settles, so that I can read off specific values if the game requires it (e.g. hit dice, saving throws).
11. As a player, I want to see the total of all dice prominently displayed below the individual results, so that I don't have to add them up in my head.
12. As a player rolling a single die, I want to see both the individual result and the total (which will be the same number), so that the layout stays consistent regardless of how many dice I roll.
13. As a player, I want a "Roll Again" button on the results screen that reruns the full animation with the same die type and count, so that I can roll multiple times without reconfiguring.
14. As a player, I want a way to return to the setup screen to change the die type or count, so that I can switch between different dice types mid-session.
15. As a player on mobile, I want the individual results and total to be large enough to read from across a table, so that I don't have to pass the device around.
16. As a player using the Tools hub, I want to see the Dice Roller listed as a tool card with a short description, so that I know it exists and what it does.
17. As a player on a slow device, I want the animation to start immediately on tap with no loading delay, so that the roll feels instant and responsive.
18. As a player rolling d100, I want the result capped at 100 and the minimum at 1, so that the die behaves correctly per tabletop convention.
19. As a player rolling d2, I want results of 1 or 2, so that it works as a coin-flip stand-in (heads/tails mapped to die values).

---

## 3. Features & Requirements

### 3.1 Setup State

The entry state when the tool is opened or after returning from results.

**Requirements:**

- Display the tool name ("Dice Roller") and a brief one-line description.
- Die type picker: a row of preset buttons — **d2, d4, d6, d8, d10, d12, d20, d100**. Exactly one die type is selected at all times; default is **d2** on first open.
- Tapping a preset selects it immediately — no auto-roll.
- Dice count stepper: a numeric display with **–** and **+** buttons. Range: **1–10**. Default: **1**.
- The **–** button is disabled when count is 1; the **+** button is disabled when count is 10.
- A prominent **Roll** button below the inputs. Disabled only if count is somehow 0 or invalid (defensive guard — the stepper enforces the valid range).
- No other configuration required.

---

### 3.2 Rolling (Animation) State

The transition from Setup to Results, triggered by tapping Roll or Roll Again.

**Requirements:**

- Animation begins immediately on tap — no loading delay.
- Each die is shown as an individual cell or tile displaying a cycling number.
- All dice cycle simultaneously through random valid face values (1 → max faces) at high speed.
- Speed decelerates over approximately **1.5–2 seconds** across all dice, landing roughly simultaneously.
- Final values are predetermined before the animation starts (cosmetic deceleration only).
- The **Roll** and **Roll Again** buttons are disabled or hidden while animation is running.
- Animation must use `setInterval` or `requestAnimationFrame` — no new npm animation dependencies.

---

### 3.3 Results State

The state after all dice have landed.

**Requirements:**

- Each die result is shown in its own clearly labeled cell (e.g. "Die 1 · 14", or simply a grid of value chips — implementation choice, but individual values must be individually distinguishable).
- The **total** of all dice is displayed below the individual results, in a larger typographic treatment, prominently enough to read from ~1 meter.
- A **Roll Again** button reruns the full animation with the same die type and count. Unlimited re-rolls.
- A **New Roll** (or "Change Dice") button returns to the Setup state, preserving the previously selected die type and count as defaults so the player doesn't start from scratch.
- No additional information displayed (no labels like "critical hit", no category labels).

---

### 3.4 Tools Hub Integration

**Requirements:**

- A new tool card added to `pages/Tools.tsx` linking to `/tools/dice`, following the existing `TOOLS` array pattern.
- Card displays a suitable Lucide icon (e.g. `Dice6`) and a short subtitle (e.g. "Roll any die, any number of times.").
- Route `/tools/dice` registered in `App.tsx` inside the existing `OnboardingGuard > Layout` wrapper.

---

## 4. UI/UX Guidelines

- **Responsiveness:** Mobile-first. The tool sits on a table and results must be readable at arm's length. Desktop should also work cleanly, using the same layout.
- **Die type picker layout:** Eight buttons in a wrapping row. On narrow screens they may wrap to two rows of four — acceptable, as long as all eight are reachable without scrolling.
- **Die result cells:** Each cell should be large enough that all results are readable at a glance. For 1–4 dice, cells can be generous in size; for 5–10 dice, they may be smaller but must remain legible (minimum ~32px font size per cell on a 375px viewport).
- **Total typography:** The total should be the most visually dominant element on the results screen — larger than individual cell values. Inspired by the Timer's large countdown display.
- **Action placement:** Roll button centered and prominent on the setup screen. Roll Again and New Roll buttons at the bottom of the results screen, clearly accessible without scrolling.
- **No confirmation dialogs:** Roll Again and New Roll are low-stakes — instant response only.
- **Empty states:** Not applicable — setup always has a valid default state.
- **Error states:** No async operations — no error states needed.
- **Loading states:** None — entirely client-side with no async data.
- **Consistency:** Match the visual language of the Timer and Who Goes First tools — same card/border style, same shadcn/ui Button variants, same Tailwind-based layout patterns.
- **Animation feel:** Fast and chaotic at the start; the last ~0.5 seconds should visibly decelerate so the group can feel the result "click" into place. Similar pacing to the Who Goes First slot machine.

---

## 5. Technical Considerations

### 5.1 Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React + TypeScript + Vite | Same as all other pages |
| Styling | Tailwind CSS + shadcn/ui | Use existing Button component; no new UI packages |
| Icons | Lucide React | Already installed — `Dice6` or similar for hub card |
| Animation | `useEffect` + `setInterval` | No new animation libraries — hand-rolled, matching FirstPlayer pattern |
| Backend | None | Pure client-side — no server or DB involvement |

### 5.2 Data Models

No persistent data models introduced in this version. All state is ephemeral React state within `Dice.tsx`. Nothing is written to the database.

#### Business Logic — Die Faces

Each die type maps to a face count:

```
d2   → 2 faces   (results: 1–2)
d4   → 4 faces   (results: 1–4)
d6   → 6 faces   (results: 1–6)
d8   → 8 faces   (results: 1–8)
d10  → 10 faces  (results: 1–10)
d12  → 12 faces  (results: 1–12)
d20  → 20 faces  (results: 1–20)
d100 → 100 faces (results: 1–100)
```

Roll result generation:

```
result = Math.floor(Math.random() * faces) + 1
```

All `count` results are generated before the animation starts. The animation only reveals them — it does not affect the values.

Total:

```
total = results.reduce((sum, r) => sum + r, 0)
```

#### Business Logic — Animation

Cycling value during animation for die `i`:

```
displayValue = Math.floor(Math.random() * faces) + 1  // new random each tick
```

Tick interval starts fast (~50ms) and increases progressively until it reaches a resting state (~400ms), at which point the final predetermined value is locked in. Implementation may use a single shared interval that updates all dice simultaneously, or per-die intervals — implementation choice, but all dice should land within the same ~0.5s window.

### 5.3 Key Constraints & Decisions

- All state is in-memory — navigating away resets everything. Intentional (see Non-Goals).
- No new npm dependencies for the animation — `setInterval`-based, matching the FirstPlayer precedent.
- Final roll values are determined before animation starts — the animation is purely cosmetic. This keeps the logic simple and testable independently of the UI.
- Die count is capped at 10. Rolling more than 10 dice at once is rare in tabletop play and would make the results grid unwieldy on mobile.
- No changes to the server or database schema.
- Page follows the same self-contained component pattern as `FirstPlayer.tsx` — all sub-components live in `Dice.tsx` unless they grow large enough to warrant extraction.

### 5.4 Modules to Build or Modify

| Module | New / Modify | Notes |
|---|---|---|
| `client/src/pages/Dice.tsx` | New | Main page — owns Setup, Rolling, and Results states; all sub-components colocated |
| `client/src/pages/Tools.tsx` | Modify | Add Dice Roller tool card to `TOOLS` array |
| `client/src/App.tsx` | Modify | Register `/tools/dice` route inside existing `OnboardingGuard > Layout` wrapper |

---

## 6. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Animation start latency | < 50ms from tap to first animated frame |
| Full animation duration | 1.5–2 seconds |
| Roll result legibility | Individual values ≥ 32px on a 375px viewport; total ≥ 48px |
| Re-roll response time | < 50ms from tap to animation restart |
| No new dependencies | Animation implemented with React + vanilla JS only |
| Mobile compatibility | Works on iOS Safari and Android Chrome |
| Bundle size impact | Negligible — no new data files or packages |

---

## 7. Out of Scope (v9)

- Mixed-type rolls in a single throw (e.g. 2d6 + 1d4).
- Numeric modifiers (+/- bonuses applied to total or individual results).
- Roll history within a session or across sessions.
- Custom die sizes (e.g. d3, d7, d30).
- Integration with session logging or score tracking.
- Sound or haptic feedback on reveal.
- "Exploding dice" or other game-specific rolling mechanics.
- Dice count above 10.

---

## 8. Open Questions

| # | Question | Owner | Status |
|---|---|---|---|
| 1 | What should the Dice Roller hub card label be? Current proposal: "Roll the Dice!" — does this match the fun naming style of existing tools? | Product | Open |
| 2 | Should returning to Setup from Results preserve the previously selected die type and count, or always reset to defaults (d6, 1)? The PRD proposes preserving — confirm. | Product | Open |
| 3 | For the results grid with 5–10 dice, is a scrollable list acceptable if cells would otherwise be too small, or must all results be visible at once without scrolling? | Product | Open |

---

*End of Document*
