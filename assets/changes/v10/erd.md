# Engineering Requirements Document
## Deterministic Fallback Backgrounds — Tally v10

**Version:** v10
**Status:** Final
**Last Updated:** 2026-05-22
**Based on PRD:** `assets/changes/v10/prd.md`

---

## 1. Scope

Five file changes, zero new dependencies, zero schema changes.

| File | Action |
|---|---|
| `web/src/lib/backgrounds/index.ts` | **Create** — background helper module |
| `web/src/components/game-card.tsx` | **Create** — shared card component |
| `web/src/pages/Library.tsx` | **Modify** — swap inline card for `<GameCard>` |
| `web/src/pages/Home.tsx` | **Modify** — swap 3 inline/local card instances for `<GameCard>`, delete local `GameCard` function |
| `web/src/pages/GameDetail.tsx` | **Modify** — replace `<Dices>` fallback with SVG fallback |

---

## 2. Implementation Order

Implement in dependency order — each step is independently reviewable:

1. `web/src/lib/backgrounds/index.ts`
2. `web/src/components/game-card.tsx`
3. `web/src/pages/Library.tsx`
4. `web/src/pages/Home.tsx`
5. `web/src/pages/GameDetail.tsx`

---

## 3. Module Specs

### 3.1 `web/src/lib/backgrounds/index.ts`

**Exact implementation:**

```typescript
import bg0 from './bg-0.svg'
import bg1 from './bg-1.svg'
import bg2 from './bg-2.svg'
import bg3 from './bg-3.svg'
import bg4 from './bg-4.svg'
import bg5 from './bg-5.svg'
import bg6 from './bg-6.svg'
import bg7 from './bg-7.svg'
import bg8 from './bg-8.svg'
import bg9 from './bg-9.svg'
import bg10 from './bg-10.svg'
import bg11 from './bg-11.svg'

const backgrounds = [bg0, bg1, bg2, bg3, bg4, bg5, bg6, bg7, bg8, bg9, bg10, bg11]

export function getBackgroundFallback(gameId: number): string {
  return backgrounds[gameId % backgrounds.length]
}
```

**Constraints:**
- All 12 SVGs (`bg-0.svg` through `bg-11.svg`) are already present in `web/src/lib/backgrounds/`.
- Imports must be static (not dynamic `import()`) so Vite fingerprints them at build time.
- The formula uses `backgrounds.length`, not the literal `12`.
- Function is pure — no side effects.

---

### 3.2 `web/src/components/game-card.tsx`

**Props interface** (defined inline in the file — do not import or extend `Game`):

```typescript
interface GameCardProps {
  id: number
  name: string
  cover_image_path: string | null
  min_players?: number | null
  max_players?: number | null
  session_count?: number | null
}
```

Both `Game` and `MostPlayedGame` from `@/lib/api` satisfy this interface structurally — no type cast needed at call sites.

**Render spec:**

```tsx
<Link to={`/library/${game.id}`} className="group overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md">
  <div className="flex aspect-[3/4] items-center justify-center bg-muted">
    <img
      src={game.cover_image_path ?? getBackgroundFallback(game.id)}
      alt={game.cover_image_path ? game.name : ''}
      className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
    />
  </div>
  <div className="p-3">
    <p className="truncate text-sm font-semibold leading-tight">{game.name}</p>
    {game.min_players && game.max_players && (
      <p className="mt-1 text-xs text-muted-foreground">
        {game.min_players}–{game.max_players} players
      </p>
    )}
    <p className="mt-0.5 text-xs text-muted-foreground">{game.session_count ?? 0} sessions</p>
  </div>
</Link>
```

**Design decisions baked in:**

| Decision | Value | Source |
|---|---|---|
| Image background | `bg-muted` | Library style wins |
| Font weight | `font-semibold` | Library style wins |
| Image hover effect | `group-hover:scale-105` | Library style wins |
| SVG fallback alt | `""` (empty string) | Decorative — no informational value |
| Uploaded image alt | `game.name` | Matches existing Library behaviour |
| Session count | Always rendered | `session_count ?? 0` — shown on all surfaces |
| Upload affordance | None | GameDetail keeps its own bespoke cover area |

**Imports required:**
```typescript
import { Link } from 'react-router-dom'
import { getBackgroundFallback } from '@/lib/backgrounds'
```

No `Dices` import — this component never renders the icon.

---

### 3.3 `web/src/pages/Library.tsx`

**Exact change:** Replace the entire `<Link key={game.id} …>…</Link>` card block (lines 126–144) with:

```tsx
<GameCard key={game.id} {...game} />
```

**Removals:**
- `import { Dices, Plus } from 'lucide-react'` → change to `import { Plus } from 'lucide-react'` (the `Dices` icon in the empty-state at line 115 stays — that is not a card, it is the empty library illustration).

**Additions:**
```typescript
import { GameCard } from '@/components/game-card'
```

**Nothing else changes** — grid layout, filters, sort controls, loading/empty states are untouched.

---

### 3.4 `web/src/pages/Home.tsx`

**Three replacements:**

1. **Most Played** (currently lines 85–91): replace the `<Link>…</Link>` block with `<GameCard key={g.id} {...g} />`
2. **Least Played** (currently lines 103–109): same replacement
3. **Recently Added** (currently lines 134–136): replace `<GameCard key={g.id} game={g} />` call with `<GameCard key={g.id} {...g} />`

**Delete** the local `function GameCard({ game }: { game: Game })` block (currently lines 144–164) entirely.

**Removals from imports:**
- `import { Dices } from 'lucide-react'` — remove entirely (no remaining usages)

**Additions to imports:**
```typescript
import { GameCard } from '@/components/game-card'
```

**Visual change on Home after this diff:**
- Most Played / Least Played cards: gain `bg-muted` (was `bg-surface-sunken`), `font-semibold` (was `font-medium`), `group-hover:scale-105` (new), and player count row (new — these cards have no `min_players`/`max_players` so the row will not render)
- Recently Added cards: gain session count display (new), `font-semibold` (was `font-medium`), `group-hover:scale-105` (new)

---

### 3.5 `web/src/pages/GameDetail.tsx`

**Exact change:** Replace the `else` branch of the cover area (currently lines 85–88):

Before:
```tsx
) : (
  <div className='flex h-full items-center justify-center'>
    <Dices size={40} className='text-muted-foreground/40' />
  </div>
)}
```

After:
```tsx
) : (
  <img src={getBackgroundFallback(game.id)} alt='' className='h-full w-full object-cover' />
)}
```

**Nothing else changes** — the `onClick` on the outer `div`, the `coverFileRef` hidden input, the Camera hover overlay (`absolute inset-0 … group-hover:opacity-100`), and the uploaded-image `<img>` branch are all untouched.

**Removals from imports:**
- `import { Camera, Dices, Paperclip, Plus, Trash2, Pencil } from 'lucide-react'` → remove `Dices` only

**Additions to imports:**
```typescript
import { getBackgroundFallback } from '@/lib/backgrounds'
```

---

## 4. TypeScript Considerations

- No new types are added to `@/lib/api`.
- `GameCardProps` is a structural subset of both `Game` and `MostPlayedGame` — spread syntax (`{...game}`) works at all three call sites without explicit casting.
- Vite SVG static imports resolve to `string` (the asset URL) by default. No `vite-plugin-svgr` or special config needed — we are using `<img src={url}>`, not inline SVG.
- If the TypeScript compiler complains about `.svg` imports, add `/// <reference types="vite/client" />` at the top of `backgrounds/index.ts` (it's likely already in `vite-env.d.ts`).

---

## 5. Explicit Non-Changes

These must not be touched:

- Grid layout classes in Library (`grid-cols-2 gap-5 sm:grid-cols-3 …`)
- Grid layout classes in Home (`grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-3` and `grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5`)
- Library filter/sort/search controls
- The `<Dices>` empty-state illustration in Library (line 115) — this is not a card; it stays
- GameDetail cover `onClick`, `coverFileRef`, Camera overlay, file `<input>` — no behavioural change
- The image upload flow in GameDetail
- All server/API code

---

## 6. Acceptance Criteria

| Criterion | How to verify |
|---|---|
| Games without a cover show an SVG background in Library | Add a game with no cover; verify a coloured background appears in the grid |
| Same game always shows the same background | Hard-refresh multiple times; background is stable |
| Different games show different backgrounds | IDs 0–11 each map to a distinct SVG; id 12 maps to the same as id 0 |
| Games with an uploaded cover are unaffected | Existing covered games still show the cover image |
| Library card hover scale works | Hover a card in Library; image scales; card shadow appears |
| Home Most/Least Played cards now have scale | Hover a card in either section |
| Session count visible on Recently Added cards | Recently Added row shows "N sessions" per card |
| GameDetail fallback renders behind camera overlay | Open a coverless game; SVG fills the cover area; hover shows Camera icon on top |
| GameDetail upload still works | Click cover on a coverless game; file picker opens; upload succeeds; real cover replaces SVG |
| No `<Dices>` icon appears anywhere in card contexts | `grep -r 'Dices' web/src/pages/Library.tsx web/src/pages/Home.tsx` should have zero hits for card usage |

---

## 7. Out of Scope (confirmed)

Everything listed in PRD Section 7. Additionally confirmed out of scope:
- Extracting GameDetail cover into a shared component
- Passing a `showSessionCount` prop to suppress session count on some surfaces (all surfaces show it)
- Any changes to `@/lib/api` types

---

*End of Document*
