# Engineering Requirements Document
## Score Counter — v11

**Status:** Draft  
**Last Updated:** 2026-05-27  
**PRD:** [prd.md](./prd.md)

---

## 1. Decisions & Resolved Open Questions

| PRD Open Question | Decision |
|---|---|
| Winner hero copy for "Lowest wins" | "fewest points wins" as the subtitle label |
| Minimum entries to view results | None — results accessible at any time (all-zero scores are valid) |
| Bar chart with all-zero scores | Render equal-width bars (or none if all zero — see §6.3) |
| Game duration metadata on game cards | **Skip in v11** — show name + cover image only; duration not in Game schema |
| Mobile input layout | **Simple stack** — input panel renders below score sheet; no sheet/drawer |
| "Just counting" → "Create session" | **SessionLogger, user picks game manually** — no API change; no pre-selected game in this path |
| Player color source for ring + bar chart | **`getPlayerColor(id)` utility** using `var(--player-{letter})` CSS vars (see §5) |

---

## 2. Files to Create or Modify

| File | Action | Notes |
|---|---|---|
| `web/src/pages/tools/score-counter.tsx` | **Create** | Page component, orchestrates 3-step flow |
| `web/src/hooks/useScoreCounter.ts` | **Create** | All scoring state logic |
| `web/src/lib/player-color.ts` | **Create** | `getPlayerColor(id)` utility |
| `web/src/pages/tools/index.tsx` | **Modify** | Add Score Counter card entry to TOOLS array |
| `web/src/routes.tsx` | **Modify** | Register `tools/score-counter` route |
| `web/src/pages/SessionLogger.tsx` | **Modify** | Read `useLocation().state` for pre-fill |

---

## 3. TypeScript Interfaces

### 3.1 Hook state shape (`useScoreCounter`)

```ts
type Step = 'setup' | 'count' | 'result'
type ScoringDirection = 'highest' | 'lowest'

interface PlayerEntry {
  value: number  // positive or negative integer
}

interface PlayerScore {
  entries: PlayerEntry[]
  total: number  // sum of entries
}

interface ScoreCounterState {
  step: Step
  selectedPlayerIds: number[]       // ordered; index = tie-break priority
  gameId: number | null
  scoringDirection: ScoringDirection
  scores: Record<number, PlayerScore>
  activePlayerId: number | null
  inputBuffer: string               // raw digits string, may start with '-'
}
```

### 3.2 SessionLogger pre-fill payload

```ts
interface ScoreCounterPreFill {
  players: { id: number; rank: number }[]
  gameId?: number
}
```

Passed via `navigate('/sessions/new', { state: payload as ScoreCounterPreFill })`.

### 3.3 Ranked result (internal, computed in hook)

```ts
interface RankedResult {
  playerId: number
  total: number
  entryCount: number
  rank: number   // 1-based; ties broken by index in selectedPlayerIds
}
```

---

## 4. `useScoreCounter` Hook

**File:** `web/src/hooks/useScoreCounter.ts`

The hook owns all mutable state. The page component is a pure renderer.

### 4.1 Exports

```ts
function useScoreCounter(): {
  // state
  step: Step
  selectedPlayerIds: number[]
  gameId: number | null
  scoringDirection: ScoringDirection
  scores: Record<number, PlayerScore>
  activePlayerId: number | null
  inputBuffer: string

  // setup actions
  togglePlayer: (id: number) => void
  setGameId: (id: number | null) => void
  setScoringDirection: (dir: ScoringDirection) => void
  startCounting: () => void    // sets step → 'count', initialises scores map, sets activePlayerId to selectedPlayerIds[0]

  // count actions
  setActivePlayer: (id: number) => void
  applyQuickAdd: (value: number) => void   // commits immediately, no buffer
  appendDigit: (digit: string) => void     // appends to inputBuffer
  toggleSign: () => void                   // flips sign of inputBuffer
  backspace: () => void                    // removes last char from inputBuffer
  commitBuffer: () => void                 // creates entry from inputBuffer, clears buffer; no-op if buffer is empty or 0
  undoLast: () => void                     // removes last entry for activePlayer, recalculates total

  // navigation
  viewResults: () => void     // step → 'result'
  newCount: () => void        // resets all state → step → 'setup'

  // computed
  rankedResults: RankedResult[]
  canStartCounting: boolean   // selectedPlayerIds.length >= 2
  canCommitBuffer: boolean    // inputBuffer not empty and parsed value !== 0
}
```

### 4.2 Key invariants

- `scores` is initialised by `startCounting` with `{ entries: [], total: 0 }` for every selected player.
- `total` in `PlayerScore` is always kept in sync: recomputed as `entries.reduce((s, e) => s + e.value, 0)` on every mutation. Never derived on render — stored in state.
- `inputBuffer` only contains digits and an optional leading `-`. Never contains a decimal point or non-numeric chars.
- `applyQuickAdd` and `commitBuffer` both push a `PlayerEntry` to the active player's `entries` array and update their `total`.
- `undoLast` is a no-op when `entries` is empty.
- `rankedResults` is computed from `scores` on every render (not stored): sort `selectedPlayerIds` by `scores[id].total` ascending (lowest wins) or descending (highest wins), then assign ranks 1-based. Ties resolve by the original index in `selectedPlayerIds` (lower index = better rank — the earlier-selected player wins ties).

---

## 5. Player Color Utility

**File:** `web/src/lib/player-color.ts`

The `Avatar` component uses `useDeterministicPick(BACKGROUNDS, id)` where `BACKGROUNDS` is an array of 10 `bg-player-{letter}` Tailwind classes. The underlying CSS variables are `--player-a` through `--player-j`.

```ts
const PLAYER_COLOR_KEYS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'] as const

export function getPlayerColor(id: number): string {
  return `var(--player-${PLAYER_COLOR_KEYS[id % PLAYER_COLOR_KEYS.length]})`
}
```

Usage:
- **Gold ring on active player** — wrap the Avatar with a `ring-2 ring-offset-2` div and set `style={{ '--tw-ring-color': getPlayerColor(id) }}`, or use `outline` with `style={{ outlineColor: getPlayerColor(id) }}`.
- **Bar chart fill** — `style={{ backgroundColor: getPlayerColor(id) }}` on the bar element.
- Keep the `PLAYER_COLOR_KEYS` array in sync with the `BACKGROUNDS` array in `avatar.tsx` (same order, same count).

> **Note:** The "gold ring" in the PRD designs specifically means the active player gets a ring. In v11, the gold/yellow visual for the active player is achieved via the player's own color (not a fixed gold), matching the avatar background. If designs specify a literal gold ring, the color value should be `var(--yellow-primary)` instead.

---

## 6. Page Component — `score-counter.tsx`

**File:** `web/src/pages/tools/score-counter.tsx`

### 6.1 Component tree

```
ScoreCounter (page)
  StepIndicator
  {step === 'setup'}   → SetupStep
  {step === 'count'}   → CountStep
  {step === 'result'}  → ResultStep
```

Each step component receives props sliced from `useScoreCounter()`. The hook is called once at the top of `ScoreCounter`.

### 6.2 `SetupStep`

**Props:**
```ts
{
  players: Player[]          // from api.players.list(), filtered to player_type === 'person'
  games: Game[]              // from api.games.list()
  playersLoading: boolean
  playersError: string | null
  onRetryPlayers: () => void
  selectedPlayerIds: number[]
  gameId: number | null
  scoringDirection: ScoringDirection
  togglePlayer: (id: number) => void
  setGameId: (id: number | null) => void
  setScoringDirection: (dir: ScoringDirection) => void
  canStartCounting: boolean
  onStart: () => void
  onCancel: () => void        // navigates to /tools
}
```

**API fetching:** `SetupStep` does not fetch. The parent `ScoreCounter` page fetches `api.players.list()` and `api.games.list()` in a `useEffect` on mount and passes results down as props.

**Layout:**
- Section: "Who's at the table?" — player chips grid.
  - Each chip: `Avatar` (sm size) + name + checkmark when selected.
  - Section header badge: "N picked".
  - Error state: inline message with a "Retry" button (when `playersError` is set).
  - Loading state: skeleton placeholder using existing spinner/skeleton pattern.
- Section: "What are we playing?" — "Just counting" pill (always first, selected by default) + horizontal scroll of game cards.
  - Game cards: cover image + name only (no duration in v11).
  - "SOON" cards for per-game presets are **not rendered in v11**.
- Section: "Which way is up?" — two radio-style cards: "Highest wins" and "Lowest wins".
- Footer: "Cancel" (ghost, `color='secondary'`) left + "Start counting →" (primary, disabled when `!canStartCounting`) right.

### 6.3 `CountStep`

**Props:**
```ts
{
  selectedPlayerIds: number[]
  players: Player[]           // full player list for name/avatar lookup
  scores: Record<number, PlayerScore>
  activePlayerId: number
  inputBuffer: string
  canCommitBuffer: boolean
  setActivePlayer: (id: number) => void
  applyQuickAdd: (value: number) => void
  appendDigit: (digit: string) => void
  toggleSign: () => void
  backspace: () => void
  commitBuffer: () => void
  undoLast: () => void
  onViewResults: () => void
}
```

**Layout (mobile: stacked; desktop: two-column):**

Left/top panel — score sheet:
- **Active player card** (highlighted background using `getPlayerColor` at low opacity, e.g. `20%`):
  - Avatar with ring (using `getPlayerColor(activePlayerId)`).
  - Name, "ACTIVE" badge, current total (large), "N entries" sub-label.
  - ENTRIES list: chips in `#N +VALUE` / `#N −VALUE` format, scrollable, newest at bottom.
  - "Undo last" button in entries header — visible only when `entries.length > 0`.
  - Empty state: "no points yet — tap a number or quick-add to start".
- **Inactive player rows** (below active card):
  - Each row: avatar, name, "N entries", current total right-aligned.
  - Tap → `setActivePlayer(id)`.

Right/bottom panel — input:
- **Quick Add** — `ButtonGroup` or grid of preset buttons: `+1 +5 +10 +25 +50 +100` (secondary style) and `−1 −5` (destructive style).
- **Numpad** — 3×4 grid: rows `[7 8 9] [4 5 6] [1 2 3] [± 0 ←]`.
  - Display of current `inputBuffer` above numpad (shows "0" when empty).
  - "Add +" confirm button below numpad — disabled when `!canCommitBuffer`.

Footer: "View results →" button (full-width, primary) fixed to page bottom.

**Numpad display rule:** Show the buffer value. When buffer is empty, show "0" (greyed). When buffer starts with `-`, show `−<digits>`.

### 6.4 `ResultStep`

**Props:**
```ts
{
  rankedResults: RankedResult[]
  players: Player[]
  scoringDirection: ScoringDirection
  gameId: number | null
  onNewCount: () => void
  onCreateSession: () => void   // navigates with pre-fill payload
  onDone: () => void            // navigates to /tools
}
```

**Layout:**
- **Winner hero card** (full-width, gradient using `getPlayerColor(winnerId)` at varying opacity):
  - Label: "top of the heap" (highest wins) or "fewest points wins" (lowest wins) — italic.
  - Winner's Avatar (xl size) with ring.
  - Winner name, entry count, large score + "POINTS" label, crown icon (Lucide `Crown`).
- **Ranking section:**
  - Header: "RANKING · HIGH TO LOW" or "RANKING · LOW TO HIGH".
  - Sub-header: "How everyone stacked up" + player count right.
  - Each row: rank badge, Avatar (sm), name, "N entries", "WINNER" badge on rank 1, bar chart, score.
  - **Bar chart:** each player's bar is a horizontal `div` with `backgroundColor: getPlayerColor(id)`.
    - Width is proportional: `(Math.abs(total) / maxAbsTotal) * 100` percent.
    - `maxAbsTotal` = max `Math.abs(total)` across all players.
    - When all players have `total === 0`: render bars at `10%` width (minimal placeholder) — don't hide.
    - Negative totals use absolute value for bar width (bar is still visual, just the number shows `−`).
- **Footer actions** (left to right):
  - "Done" → `/tools`.
  - "New count" (outline, secondary, `RotateCcw` icon) → `onNewCount`.
  - "Create session from this" (primary CTA).

### 6.5 `StepIndicator`

Simple inline component — display only, no click handlers.

```tsx
<StepIndicator currentStep={step} />
```

Renders: `1 · SETUP — 2 · COUNT — 3 · RESULT` with the current step visually active (bold / primary color). The separators `—` are muted.

---

## 7. Routing & Tools Hub

### 7.1 `routes.tsx` — add one import and one Route

```tsx
import ScoreCounter from '@/pages/tools/score-counter'
// ...
<Route path='tools/score-counter' element={<ScoreCounter />} />
```

Place it after the existing `tools/turn-timer` route.

### 7.2 `tools/index.tsx` — add one entry to TOOLS

Import `Calculator` from `lucide-react` (or `Hash` — whichever reads as "score counter").

```ts
{ path: '/tools/score-counter', icon: Calculator, label: 'Score Counter', description: 'Track and tally scores for any game.' }
```

> The existing ToolCard uses shadcn compat tokens (`bg-card`, `text-muted-foreground`). Do not refactor those for v11 — match the existing style so the new card is visually consistent with the others. CLAUDE.md token rules apply inside the new score-counter page, not to this existing component.

---

## 8. SessionLogger Pre-fill

**File:** `web/src/pages/SessionLogger.tsx`

### 8.1 Changes

Read router state on mount and merge into local state:

```ts
import { useLocation } from 'react-router-dom'

interface ScoreCounterPreFill {
  players?: { id: number; rank: number }[]
  gameId?: number
}

// inside SessionLogger:
const location = useLocation()
const prefill = location.state as ScoreCounterPreFill | null
```

In the `useEffect` that fetches games and players:

```ts
useEffect(() => {
  Promise.all([api.games.list(), api.players.list()]).then(([g, p]) => {
    setGames(g)
    setPlayers(p)

    if (prefill?.gameId) {
      setGameId(prefill.gameId)
    }

    if (prefill?.players?.length) {
      const sorted = [...prefill.players].sort((a, b) => a.rank - b.rank)
      const rankedPlayers = sorted
        .map((pf) => p.find((pl) => pl.id === pf.id))
        .filter((pl): pl is Player => Boolean(pl))
        .map((pl) => ({ id: pl.id, name: pl.name }))
      setRanked(rankedPlayers)
    }
  })
}, [])
```

### 8.2 Non-breaking guarantee

- When `location.state` is `null` or `undefined`, the block is skipped entirely and SessionLogger behaves exactly as before.
- `gameId` defaults to `id ? Number(id) : 0` from `useParams` as before; the prefill only overrides it when `prefill.gameId` is truthy.
- No validation changes — `game_id` is still required on submit (user must pick a game when none is pre-filled).

---

## 9. Edge Cases

| Scenario | Behaviour |
|---|---|
| User navigates away mid-count | All state is lost — no persistence. No warning/confirm dialog needed per PRD non-goals. |
| Active player tapped in inactive list | No-op (they can't be in the inactive list if they're active). |
| Undo last on a player with 0 entries | `undoLast` is a no-op; button is hidden so this should never be triggered. |
| All players score 0, user views results | Valid. Bar chart renders minimal-width placeholder bars. Winner = first selected player (rank 1 by tie-break). |
| Negative `inputBuffer` committed | Entry value is negative (e.g. `−3`). Total can go below 0. Displayed with `−` prefix. |
| `inputBuffer` = `"-"` (only sign, no digits) | `canCommitBuffer` is false — "Add +" remains disabled. |
| 2 players tie | Tie-break by original selection order. Rank 2 gets the worse rank. No shared-winner UI. |
| `prefill.players` contains IDs not in fetched players | Filtered out silently — those players may have been deleted since the count started. |

---

## 10. Component Rules Checklist

All new components in `score-counter.tsx` must follow CLAUDE.md:

- [ ] `data-slot='score-counter'` (or per-sub-component name) on root elements.
- [ ] Use `text-ink-*` / `bg-paper-*` tokens — not `text-foreground` / `text-muted-foreground`.
- [ ] Variant definitions follow `NAME_VARIANTS_CONFIG` / `NAME_VARIANTS_PROPS` naming if a cva component is introduced.
- [ ] Classes via `const classes = cn(...)` before the JSX return — never inline.
- [ ] No comments unless the WHY is non-obvious.

---

## 11. Out of Scope (confirmed for v11)

- Per-game scoring presets (SOON label in PRD) — game cards in Setup are just tappable game selectors; no preset chips rendered.
- Guest players.
- Radix Sheet / Drawer for mobile input panel.
- "Score Counter linked from SessionLogger" (inverse flow).
- `avg_duration` field on Game schema.
- Multi-winner / tie UI beyond rank badge ordering.

---

*End of Document*
