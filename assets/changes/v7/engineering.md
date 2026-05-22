# Engineering Spec
## Tally v7 — Tools Hub & Turn Timer

**Version:** v7
**Status:** Draft
**Last Updated:** 2026-05-08

---

## 1. Overview

Pure client-side feature. No backend changes, no database changes, no new npm packages. Two new pages, one new hook, and minor modifications to the router and nav.

---

## 2. Files to Create or Modify

| File | Action | Notes |
|---|---|---|
| `client/src/pages/Tools.tsx` | Create | Tools hub — `/tools` |
| `client/src/pages/Timer.tsx` | Create | Timer page — `/tools/timer`; contains `TimerDisplay` and `TimerControls` as local components |
| `client/src/hooks/useTimer.ts` | Create | Timer state machine and tick logic |
| `client/src/App.tsx` | Modify | Register `/tools` and `/tools/timer` routes |
| `client/src/components/Layout.tsx` | Modify | Add Tools nav item (`Wrench` icon) |

---

## 3. Router Changes — `App.tsx`

Add two nested routes inside the existing `OnboardingGuard > Layout` wrapper, alongside the other routes:

```tsx
<Route path='tools' element={<ToolsPage />} />
<Route path='tools/timer' element={<TimerPage />} />
```

Import the two new page components at the top of the file.

---

## 4. Nav Changes — `Layout.tsx`

Add a Tools entry to the `navItems` array:

```ts
import { House, Library, Settings, Swords, Trophy, Users, Wrench } from 'lucide-react'

const navItems = [
  { to: '/home',        label: 'Home',        Icon: House },
  { to: '/leaderboard', label: 'Leaderboard', Icon: Trophy },
  { to: '/library',     label: 'Library',     Icon: Library },
  { to: '/players',     label: 'Players',     Icon: Users },
  { to: '/tools',       label: 'Tools',       Icon: Wrench },
  { to: '/settings',    label: 'Settings',    Icon: Settings },
]
```

No other changes to Layout. The mobile bottom bar will render 6 items; this is accepted for v7.

---

## 5. Tools Hub — `pages/Tools.tsx`

Simple page listing available tools. For v7, only the Timer card exists.

```tsx
export default function ToolsPage() {
  return (
    <div className='p-6 space-y-4'>
      <h1 className='text-2xl font-bold'>Tools</h1>
      <Link to='/tools/timer'>
        <Card> ... Timer card ... </Card>
      </Link>
    </div>
  )
}
```

Use the existing shadcn card primitives if available; otherwise a plain styled `<div>`.

---

## 6. `useTimer` Hook — `hooks/useTimer.ts`

### 6.1 State Machine

Four states:

```
idle → running → paused → running
                        ↓
                     expired
```

- `idle`: Setup screen visible; no tick running.
- `running`: Countdown active; tick interval live.
- `paused`: Countdown frozen; tick interval cleared.
- `expired`: `remaining === 0`; tick interval cleared.

### 6.2 Shape

```ts
type TimerState = 'idle' | 'running' | 'paused' | 'expired'

interface TimerValue {
  state: TimerState
  remaining: number   // seconds, integer
  total: number       // original duration in seconds
  pct: number         // remaining / total, 0.0–1.0
  start: (seconds: number) => void
  pause: () => void
  resume: () => void
  stop: () => void    // → idle
  restart: () => void // reset remaining to total, go to running
  addSeconds: (n: number) => void
}
```

### 6.3 Tick Logic

Use `setInterval` at 1s. Do **not** count ticks — track wall-clock time to avoid drift from tab throttling:

```ts
const endTimeRef = useRef<number | null>(null)

// on start / resume:
endTimeRef.current = Date.now() + remaining * 1000

// each tick:
const left = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000))
setRemaining(left)
if (left === 0) { clearInterval(...); setState('expired') }
```

On pause, compute and store `remaining` from `endTimeRef` before clearing the interval. On resume, recompute `endTimeRef` from the stored `remaining`.

On `addSeconds(n)`:
- If `running`: push `endTimeRef.current` forward by `n * 1000` and update `remaining`.
- If `paused`: increment `remaining` by `n`.
- If `expired`: no-op (disabled in UI).

### 6.4 Cleanup

Clear the interval on unmount via `useEffect` cleanup.

---

## 7. Timer Page — `pages/Timer.tsx`

Owns the `useTimer` hook. Renders either the **Setup** view (`state === 'idle'`) or the **Active/Expired** view.

### 7.1 Setup View

Two controlled number inputs: one for minutes (`0–99`), one for seconds (`0–59`). Default on mount: `minutes = 1, seconds = 0`.

Preset buttons populate both inputs without auto-starting:
- 30s → `{ minutes: 0, seconds: 30 }`
- 1m  → `{ minutes: 1, seconds: 0 }`
- 2m  → `{ minutes: 2, seconds: 0 }`
- 5m  → `{ minutes: 5, seconds: 0 }`

Play button calls `start(minutes * 60 + seconds)`. Disabled when total duration is 0.

### 7.2 `TimerDisplay` (local component)

Props: `remaining: number`, `pct: number`, `state: TimerState`

Renders:
- A full-height container (`h-full` or `min-h-[calc(100vh-...)]` to fill the `<main>` area).
- A background fill div absolutely positioned, top-anchored, height = `(1 - pct) * 100%`. Color class switches based on `pct`:
  - `pct > 0.40` → green (`bg-green-500`)
  - `pct > 0.20` → yellow (`bg-yellow-400`)
  - `pct <= 0.20` or `expired` → red (`bg-red-500`)
- Apply `transition-colors duration-500` to the fill div so color threshold crossings are smooth.
- The fill height updates on every `remaining` change. Use `style={{ height: '...' }}` for the continuous height — CSS `transition` on `height` would make it animate between ticks, which is undesirable. Do **not** add a height transition.
- Countdown text (`mm:ss`) centered over the background, in white, large (`text-[18vw]` or similar).

Format helper:
```ts
const fmt = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
```

### 7.3 `TimerControls` (local component)

Props: `state`, `onStop`, `onRestart`, `onPauseResume`, `onAdd`

Renders at the bottom of the screen (`fixed bottom` or flex column layout):

**Primary row** (always visible): Stop · Restart · Pause/Play  
**Secondary row**: +10s · +30s · +60s — disabled when `state === 'expired'`

Use `variant='secondary'` or outline buttons for secondary actions to subordinate their visual weight.

---

## 8. Background Fill — Implementation Detail

The fill is a positioned div inside a relative container:

```tsx
<div className='relative h-full'>
  {/* fill */}
  <div
    className={`absolute top-0 left-0 w-full transition-colors duration-500 ${colorClass}`}
    style={{ height: `${(1 - pct) * 100}%` }}
  />
  {/* content on top */}
  <div className='relative z-10 flex flex-col items-center justify-between h-full'>
    <TimerDisplay ... />
    <TimerControls ... />
  </div>
</div>
```

`transition-colors duration-500` handles smooth color threshold switches. Height changes are instant (driven by the 1s tick), which is correct.

---

## 9. Color Logic Summary

```ts
function colorClass(pct: number): string {
  if (pct > 0.40) return 'bg-green-500'
  if (pct > 0.20) return 'bg-yellow-400'
  return 'bg-red-500'
}
```

Called from `TimerDisplay` on every render. At `expired`, `pct` is `0`, so red is applied automatically.

---

## 10. Open Questions (resolved)

| # | Question | Decision |
|---|---|---|
| 1 | Restart confirmation? | No confirmation — instant, per UI/UX guidelines. |
| 2 | Default duration source? | Hardcoded 1 minute. No sessionStorage. |
| 3 | Tools nav always visible? | Yes, unconditionally. |
| 4 | Time input format? | Two separate fields: minutes + seconds. |
| 5 | Color transition style? | Hard threshold switch + `transition-colors duration-500` CSS. |
