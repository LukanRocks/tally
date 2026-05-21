# Engineering Requirements Document
## Who Goes First? — Tally v8

**Version:** v1.0
**Status:** Draft
**Last Updated:** 2026-05-10
**Ref PRD:** `changes/v8/prd.md`

---

## 1. Scope

Pure client-side feature. No server changes, no database changes, no new npm dependencies.

Four touch-points in the existing codebase:

| File | Change |
|---|---|
| `client/src/data/firstPlayerPrompts.ts` | **New** — static prompt array |
| `client/src/pages/FirstPlayer.tsx` | **New** — main page component |
| `client/src/pages/Tools.tsx` | **Modify** — add tool card |
| `client/src/App.tsx` | **Modify** — register route |

---

## 2. Data Layer

### 2.1 Prompt type

```ts
// client/src/data/firstPlayerPrompts.ts
export interface Prompt {
  id: number
  prompt: string
  category: string
}

export const PROMPTS: Prompt[] = [ /* 202 entries */ ]
```

### 2.2 Source & conversion

Source: `changes/v8/first_player_prompts.csv` (semicolon-delimited, header row `id;prompt;category`).

Conversion: **manual copy-paste** into the TS array. Run once; commit the output file. No build script, no Vite plugin.

Validation checklist before merging:
- [ ] `PROMPTS.length === 202`
- [ ] Every entry has a non-empty `prompt` string
- [ ] No duplicate `id` values

### 2.3 Random selection

```ts
function pick(): Prompt {
  return PROMPTS[Math.floor(Math.random() * PROMPTS.length)]
}
```

Uniform distribution, no weighting, no session-level deduplication.

---

## 3. State Machine

Three phases managed by a single `phase` state variable inside `FirstPlayer.tsx`.

```
idle ──[Draw tapped]──▶ animating ──[3 s elapsed]──▶ revealed
                              ▲                           │
                              └──────[Re-roll tapped]─────┘
```

No path back to `idle` from within the page. The user reaches `idle` only on initial mount.

### 3.1 State shape

```ts
type Phase = 'idle' | 'animating' | 'revealed'

const [phase, setPhase] = useState<Phase>('idle')
const [displayText, setDisplayText] = useState<string>('')
const [finalPrompt, setFinalPrompt] = useState<Prompt | null>(null)
```

`displayText` — the string currently rendered in the large text area (cycling during animation, the final prompt when revealed).

`finalPrompt` — pre-selected before the animation starts; referenced only when the interval ends.

---

## 4. Animation

### 4.1 Mechanic

**Fixed-cadence cycling, hard stop.** No deceleration.

- Interval: `60 ms` (≈ 16–17 prompt changes per second)
- Duration: `3 000 ms`
- At t = 3 000 ms: clear the interval, set `displayText = finalPrompt.prompt`, transition to `revealed`

The result (`finalPrompt`) is selected **before** the interval starts so the final value is always known upfront.

### 4.2 Implementation

```ts
const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

function startAnimation(result: Prompt) {
  setFinalPrompt(result)
  setPhase('animating')

  intervalRef.current = setInterval(() => {
    setDisplayText(pick().prompt)
  }, 60)

  setTimeout(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setDisplayText(result.prompt)
    setPhase('revealed')
  }, 3000)
}
```

Cleanup in `useEffect` return:

```ts
useEffect(() => {
  return () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
  }
}, [])
```

### 4.3 Triggering

- **Draw** (from `idle`): calls `startAnimation(pick())`
- **Re-roll** (from `revealed`): calls `startAnimation(pick())`

Both paths are identical — same function, different entry phase.

### 4.4 Constraints

- No `requestAnimationFrame` — `setInterval` at 60 ms is sufficient and simpler.
- No new npm packages.
- Draw/Re-roll button is hidden or `disabled` while `phase === 'animating'`.

---

## 5. Component Structure

All logic and sub-components live in `FirstPlayer.tsx` unless a sub-component exceeds ~80 lines, in which case it may be extracted to `client/src/pages/FirstPlayerDisplay.tsx`.

### 5.1 Render by phase

**`idle`**

```
┌──────────────────────────────┐
│                              │
│       Who Goes First?        │  ← h1, text-2xl font-bold
│  Draw a prompt — whoever     │  ← subtitle, text-sm muted
│  it fits goes first          │
│                              │
│         [ Draw ]             │  ← Button size='lg'
│                              │
└──────────────────────────────┘
```

**`animating`**

```
┌──────────────────────────────┐
│                              │
│   Player wearing the most    │  ← displayText, text-4xl font-bold
│         colors               │    text-center, cycling every 60ms
│                              │
│       [ Draw ]  (disabled)   │  ← same Button, disabled={true}
│                              │
└──────────────────────────────┘
```

**`revealed`**

```
┌──────────────────────────────┐
│                              │
│   Player wearing the most    │  ← displayText, text-4xl font-bold
│         colors               │    text-center, static
│                              │
│        [ Re-roll ]           │  ← Button size='lg'
│                              │
└──────────────────────────────┘
```

### 5.2 Text sizing

Use `text-4xl` (36 px at default scale). Prompts wrap naturally to 2–3 lines on narrow viewports; this is acceptable. Do **not** implement dynamic fit-to-width. The `min-h` and `flex items-center justify-center` container ensures the text block is vertically centered regardless of line count.

---

## 6. Tools Hub Integration

### 6.1 `Tools.tsx` — add card

Add after the existing Timer card, following the exact same markup pattern:

```tsx
import { Timer, Dices } from 'lucide-react'

// ...
<Link to='/tools/first-player'>
  <div className='flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:bg-accent'>
    <div className='flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary'>
      <Dices size={20} />
    </div>
    <div>
      <p className='font-semibold'>Who Goes First?</p>
      <p className='text-sm text-muted-foreground'>Decide who goes first</p>
    </div>
  </div>
</Link>
```

### 6.2 `App.tsx` — register route

Add inside the existing `OnboardingGuard > Layout` route group, alongside the Timer route:

```tsx
import FirstPlayerPage from './pages/FirstPlayer'

// inside <Routes>…<Route element={<OnboardingGuard><Layout /></OnboardingGuard>}>
<Route path='tools/first-player' element={<FirstPlayerPage />} />
```

---

## 7. Non-Functional Targets

| Requirement | Target | How met |
|---|---|---|
| Draw-to-first-frame latency | < 50 ms | Synchronous state update; `setInterval` fires within one tick |
| Re-roll-to-first-frame latency | < 50 ms | Same — no async path |
| Animation duration | 3 000 ms ± 1 tick | `setTimeout(3000)` |
| Prompt text legibility | ≥ 36 px on any viewport | `text-4xl` = 36 px at 16 px base |
| Bundle size delta | < 20 KB uncompressed | 202 short strings; no new deps |
| Memory leak on unmount | None | `clearInterval` in `useEffect` cleanup |

---

## 8. Implementation Order

1. **`firstPlayerPrompts.ts`** — copy-paste prompts from CSV, verify count = 202.
2. **`FirstPlayer.tsx`** — implement idle → animating → revealed state machine.
3. **`Tools.tsx`** — add Dices card.
4. **`App.tsx`** — register route.
5. **Manual smoke test** checklist:
   - [ ] Idle screen renders with Draw button
   - [ ] Tap Draw → text cycles for ~3 s → hard stop on final prompt
   - [ ] Re-roll replays full 3 s animation with a different result
   - [ ] Draw button is disabled during animation (cannot double-trigger)
   - [ ] Navigating away mid-animation → no console errors (cleanup fires)
   - [ ] Tool card appears on `/tools` and link routes correctly
   - [ ] Text readable on 375 px viewport (iPhone SE)

---

## 9. Out of Scope (confirmed carry-over from PRD)

- Deceleration / slot-machine ease-out animation
- Reset-to-idle button within the page
- Category filtering, deduplication, custom prompts
- Sound, haptics, analytics
- Any server or database changes

---

*End of Document*
