# Engineering Requirements Document
## Dice Roller — Tally v9

**Version:** v9
**Status:** Draft
**Last Updated:** 2026-05-10
**References:** [prd.md](./prd.md)

---

## 1. Resolved Decisions

These close the open questions from the PRD:

| # | Decision |
|---|---|
| Q1 — Hub card label | `"Roll the Dice!"` |
| Q2 — Setup state on return | Preserve the last `dieType` + `count`; do not reset to defaults |
| Q3 — Results grid scroll | No scroll; all dice always visible. Grid columns shrink for larger counts (see §6.3) |
| Animation implementation | Elapsed-time `setInterval` at 16 ms; display updates are throttled based on a lerped interval; see §5.2 |

---

## 2. File Inventory

| File | Action | Description |
|---|---|---|
| `client/src/pages/Dice.tsx` | **Create** | Main page — owns all phases and sub-components |
| `client/src/pages/Tools.tsx` | **Modify** | Add Dice Roller entry to `TOOLS` array; import `Dice6` |
| `client/src/App.tsx` | **Modify** | Register `/tools/dice` route inside existing `OnboardingGuard > Layout` |

No other files change. No new packages. No server or database changes.

---

## 3. State Machine

```typescript
type Phase = 'setup' | 'rolling' | 'results'
```

### Transitions

```
setup   ──[Roll tapped]──────────────────► rolling
rolling ──[animation complete ~1.8s]─────► results
results ──[Roll Again tapped]────────────► rolling  (same dieType + count, new values)
results ──[New Roll tapped]──────────────► setup    (preserves dieType + count)
```

### State owned by `DicePage`

```typescript
const [phase, setPhase]               = useState<Phase>('setup')
const [dieType, setDieType]           = useState<DieType>('d2')
const [count, setCount]               = useState<number>(1)
const [displayValues, setDisplayValues] = useState<number[]>([])  // cycling during rolling; locked on results
const [results, setResults]           = useState<number[]>([])    // predetermined before animation starts
```

`displayValues` and `results` are both empty arrays while `phase === 'setup'`. On roll start, `results` is computed once and never changes until the next roll. `displayValues` is mutated each animation tick; it becomes identical to `results` when animation ends.

---

## 4. Data & Constants

### 4.1 Die Types

```typescript
type DieType = 'd2' | 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100'

const DIE_TYPES: DieType[] = ['d2', 'd4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100']

const FACES: Record<DieType, number> = {
  d2: 2, d4: 4, d6: 6, d8: 8,
  d10: 10, d12: 12, d20: 20, d100: 100,
}
```

### 4.2 Animation Constants

```typescript
const ANIMATION_DURATION = 1800   // ms — total animation length
const FAST_INTERVAL      = 50     // ms — effective update rate at t = 0 (chaotic phase)
const SLOW_INTERVAL      = 400    // ms — effective update rate at t = 1 (settling phase)
```

---

## 5. Business Logic

### 5.1 Roll Generation

```typescript
function rollDie(faces: number): number {
  return Math.floor(Math.random() * faces) + 1
}

function generateResults(faces: number, count: number): number[] {
  return Array.from({ length: count }, () => rollDie(faces))
}

function total(results: number[]): number {
  return results.reduce((sum, r) => sum + r, 0)
}
```

All results are generated in one call before `setPhase('rolling')`. The animation only reveals them.

### 5.2 Animation Algorithm

The animation runs a single `setInterval` at 16 ms. Each tick computes `t` (progress 0→1). Display values are not updated every tick — instead, a throttle based on `lerp(FAST_INTERVAL, SLOW_INTERVAL, easeOut(t))` controls when the displayed number changes. This creates the visual deceleration without adjusting the interval itself.

```typescript
// Ease-out: fast at start, slows toward end
function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 2)
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}
```

**Full `startRolling` implementation contract:**

```typescript
function startRolling() {
  const faces = FACES[dieType]
  const finalResults = generateResults(faces, count)

  setResults(finalResults)
  setDisplayValues(Array(count).fill(1))
  setPhase('rolling')

  const startTime = Date.now()
  let lastDisplayUpdate = 0

  intervalRef.current = setInterval(() => {
    const elapsed = Date.now() - startTime
    const t = Math.min(elapsed / ANIMATION_DURATION, 1)

    if (t >= 1) {
      clearInterval(intervalRef.current!)
      setDisplayValues(finalResults)
      setPhase('results')
      return
    }

    const throttleMs = lerp(FAST_INTERVAL, SLOW_INTERVAL, easeOut(t))
    const now = Date.now()

    if (now - lastDisplayUpdate >= throttleMs) {
      lastDisplayUpdate = now
      setDisplayValues(Array(count).fill(0).map(() => rollDie(faces)))
    }
  }, 16)
}
```

**Cleanup:** `useEffect(() => () => { clearInterval(intervalRef.current!) }, [])` — clears interval on unmount (navigation away mid-animation).

**Re-roll:** "Roll Again" calls `startRolling()` directly. The existing interval is cleared via `intervalRef.current` before starting a new one (add `if (intervalRef.current) clearInterval(intervalRef.current)` at the top of `startRolling`).

---

## 6. Component Breakdown

All components colocated in `Dice.tsx`. Extract to separate files only if any single component exceeds ~80 lines.

### 6.1 `DicePage` (default export)

Owns all state and refs. Renders one of three phases. No props.

```
DicePage
├── phase === 'setup'   → <SetupView />
├── phase === 'rolling' → <RollingView />
└── phase === 'results' → <ResultsView />
```

Props passed down as needed — prefer passing primitives over passing state setters; expose handler functions instead (e.g. `onRoll`, `onRollAgain`, `onNewRoll`).

---

### 6.2 `SetupView`

Rendered when `phase === 'setup'`.

```typescript
interface SetupViewProps {
  dieType: DieType
  count: number
  onDieTypeChange: (dt: DieType) => void
  onCountChange: (n: number) => void
  onRoll: () => void
}
```

Layout (vertical, centered, matches Timer/FirstPlayer setup pattern):

```
h1 "Dice Roller"
p  "Roll any die, any number of times."

<DiePicker />          // die type selector
<CountStepper />       // count –/+
<Button size='lg'>Roll</Button>   // disabled when count < 1
```

Roll button: `disabled={count < 1}` — defensive only; the stepper enforces 1–10.

---

### 6.3 `DiePicker`

```typescript
interface DiePickerProps {
  selected: DieType
  onChange: (dt: DieType) => void
}
```

Renders `DIE_TYPES.map(...)` as a `flex flex-wrap justify-center gap-2`.

Each button:
- Selected: `<Button variant='default' size='sm'>{dt}</Button>`
- Unselected: `<Button variant='outline' size='sm'>{dt}</Button>`

Eight buttons, wrapping to two rows of four on narrow viewports. No scroll.

---

### 6.4 `CountStepper`

```typescript
interface CountStepperProps {
  count: number
  onChange: (n: number) => void
}
```

Layout mirrors Timer's minute/second steppers:

```
[–]  [count display]  [+]
```

- `–` button: `variant='secondary'`, `disabled={count <= 1}`
- Count display: `text-4xl font-bold tabular-nums` centered, minimum width so it doesn't shift layout
- `+` button: `variant='secondary'`, `disabled={count >= 10}`

Increment/decrement clamps to [1, 10].

---

### 6.5 `RollingView`

Rendered when `phase === 'rolling'`. Displays the cycling dice grid. No controls — Roll and Roll Again are absent.

```typescript
interface RollingViewProps {
  dieType: DieType
  displayValues: number[]
}
```

Uses `<DiceGrid displayValues={displayValues} animating />`.

---

### 6.6 `ResultsView`

Rendered when `phase === 'results'`.

```typescript
interface ResultsViewProps {
  dieType: DieType
  results: number[]
  onRollAgain: () => void
  onNewRoll: () => void
}
```

Layout:

```
<DiceGrid displayValues={results} />
<p class="text-6xl font-bold tabular-nums">{total}</p>   // total
<Button size='lg' onClick={onRollAgain}>Roll Again</Button>
<Button size='lg' variant='outline' onClick={onNewRoll}>New Roll</Button>
```

Total: `text-6xl` minimum on mobile, bumped via `md:text-8xl` for desktop. More visually dominant than individual cells (matches Timer's `text-[18vw]` philosophy — use `text-[min(20vw,8rem)]` or equivalent to scale without overflowing on tablet).

---

### 6.7 `DiceGrid`

Shared by `RollingView` and `ResultsView`.

```typescript
interface DiceGridProps {
  displayValues: number[]
  animating?: boolean
}
```

Renders a `grid` of `<DieCell>` components. Grid columns determined by `displayValues.length`:

| Count | `className` | Notes |
|---|---|---|
| 1 | `grid-cols-1 max-w-[160px]` | Large centered cell |
| 2–4 | `grid-cols-2` | 2 rows max for 4 dice |
| 5–6 | `grid-cols-3` | 2 rows for 6 |
| 7–10 | `grid-cols-4` | Up to 3 rows; all visible |

```typescript
function getGridCols(count: number): string {
  if (count === 1) return 'grid-cols-1 max-w-[160px] mx-auto'
  if (count <= 4)  return 'grid-cols-2'
  if (count <= 6)  return 'grid-cols-3'
  return 'grid-cols-4'
}
```

The grid sits inside a container with `w-full max-w-sm mx-auto` to center on desktop.

---

### 6.8 `DieCell`

```typescript
interface DieCellProps {
  value: number
  animating?: boolean
}
```

A bordered card-style cell:

```
rounded-xl border border-border bg-card
flex items-center justify-center
aspect-square
text-2xl font-bold tabular-nums
```

`aspect-square` keeps cells consistently proportioned as the grid column width changes. Font size `text-2xl` (`24px`) satisfies the PRD's ≥32px total cell legibility at 375px with the grid above — cells will be ~85px wide on a 375px 4-col grid, so `text-2xl` is conservative and can be `text-xl` for 7–10 dice if layout needs it.

`animating` prop: when `true`, apply a subtle pulsing effect — `animate-pulse` (Tailwind built-in) on the cell border or background, removed once settled.

---

## 7. Tools Hub Integration

### `Tools.tsx`

```typescript
// Add to imports:
import { Timer, Dices, Dice6, type LucideIcon } from 'lucide-react'

// Add to TOOLS array:
{ path: '/tools/dice', icon: Dice6, label: 'Roll the Dice!', description: 'Roll any die, any number of times.' }
```

Order in `TOOLS`: append after the existing two entries.

### `App.tsx`

```typescript
// Add import:
import DicePage from './pages/Dice'

// Add route inside OnboardingGuard > Layout (after first-player route):
<Route path='tools/dice' element={<DicePage />} />
```

---

## 8. Implementation Sequence

Work in this order to keep each step independently testable:

1. **Constants + pure functions** — `DIE_TYPES`, `FACES`, `rollDie`, `generateResults`, `total`, `easeOut`, `lerp`. Easiest to verify in isolation.
2. **`DieCell` + `DiceGrid`** — static rendering with hardcoded values; confirms layout and grid math.
3. **`DiePicker` + `CountStepper`** — static controls; confirms selection highlight and stepper disabled states.
4. **`SetupView`** — assembles the above; smoke-test all die types and count edge values (1, 10).
5. **`RollingView` + animation loop** — wire `startRolling` into `DicePage`; confirm visual deceleration and that `phase` transitions to `'results'`.
6. **`ResultsView`** — total display, Roll Again (reruns animation), New Roll (returns to setup with preserved state).
7. **Tools.tsx + App.tsx** — hub card and routing; navigate end-to-end from Tools hub through a full roll.

---

## 9. Edge Cases & Guards

| Scenario | Handling |
|---|---|
| Navigate away during animation | `useEffect` cleanup clears `intervalRef.current`; state is discarded |
| `count` somehow 0 at roll time | Roll button `disabled={count < 1}`; `generateResults` returns `[]`; animation shows nothing (defensive) |
| `dieType` not in `FACES` | TypeScript prevents invalid values at compile time |
| Rapid double-tap on Roll Again | `startRolling` clears existing interval before starting; idempotent |
| Single die rolled | `DiceGrid` renders 1 cell; total equals the single result — both shown (consistent layout) |
| d100 result | `rollDie(100)` returns 1–100; no special casing needed |

---

## 10. Non-Functional Checklist

| Requirement | Implementation path |
|---|---|
| Animation start < 50ms | `startRolling` is synchronous before first `setInterval` tick; React state update is batched |
| Full animation 1.5–2s | `ANIMATION_DURATION = 1800` |
| Individual values ≥ 32px at 375px | `text-2xl` (24px rem) + cell padding gives rendered size ≥ 32px; verify in browser at 375px |
| Total ≥ 48px | `text-6xl` (60px) satisfies this comfortably |
| No new npm packages | Only `react`, `lucide-react` (already installed), and Tailwind classes |
| iOS Safari + Android Chrome | `setInterval` + `useState` are universal; no web API flags needed |

---

*End of Document*
