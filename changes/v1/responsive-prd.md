# PRD: Tally — Responsive Layout

## Context

Tally is currently desktop-only. The entire layout assumes a 224px fixed sidebar at all times. Every page uses `p-8` padding and most contain `max-w-*` containers. Tables have no horizontal overflow treatment. There is no mobile navigation at all.

The goal is full responsive parity — the app should work equally well for someone logging a session at the table on their phone and someone reviewing the leaderboard from the couch.

---

## Decisions Made

| Topic | Decision |
|---|---|
| Primary use case | Full parity — logging and browsing both matter |
| Mobile navigation | Bottom tab bar (sidebar hidden below `md`) |
| Data tables | Horizontal scroll (`overflow-x-auto` wrapper) |
| Drag-to-rank (Session Logger) | Keep touch drag as-is — `PointerSensor` already handles it |

---

## Breakpoint Strategy

Single breakpoint: Tailwind's `md` (768px).

- **`< md`** → mobile layout
- **`≥ md`** → existing desktop layout, no changes

No `sm`-specific layout changes unless already present (some grids already use `sm:` breakpoints — leave those alone).

---

## Component-by-Component Requirements

### Layout.tsx — Navigation (biggest structural change)

**Desktop (`≥ md`):** No change. Sidebar stays as `w-56 shrink-0`.

**Mobile (`< md`):**

1. Hide the entire `<aside>` sidebar.
2. Add a **top bar**: full-width strip at the top of the screen showing the Tally wordmark (left) and the theme toggle button (right). This is the only place the theme toggle lives on mobile.
3. Add a **fixed bottom tab bar**: 4 tabs — Home, Leaderboard, Library, Players — each with an icon and a label. Active tab is highlighted using the sidebar primary color.
4. The `<main>` content area needs bottom padding equal to the tab bar height (approximately `pb-16`) to prevent content from being obscured.

**File:** `client/src/components/Layout.tsx`

---

### Global — Padding

Every page currently uses `p-8` as its outermost padding. Change to `p-4 md:p-8` across all pages.

**Affected files:**
- `client/src/pages/Dashboard.tsx`
- `client/src/pages/Library.tsx`
- `client/src/pages/Players.tsx`
- `client/src/pages/SessionLogger.tsx`
- `client/src/pages/Leaderboard.tsx`
- `client/src/pages/PlayerProfile.tsx`
- `client/src/pages/GameDetail.tsx`
- `client/src/pages/GameForm.tsx`

---

### Dashboard.tsx

- Game grids already have `grid-cols-2 sm:grid-cols-3 md:grid-cols-5` — no change needed.
- **Top Players table** (4 columns): wrap the table container in `<div className="overflow-x-auto">`.

---

### Library.tsx

- Game grid already has responsive column breakpoints — no change.
- Filter bar: search input has a fixed `w-52`. Change to `w-full sm:w-52` so it fills the row on small screens.
- Min/max players inputs (`w-28`) are fine as-is.

---

### Players.tsx

- "Add player" form (`flex gap-2`) works fine on mobile.
- Player list items with inline Edit/Delete buttons: touch targets are borderline (~28–32px) but acceptable.
- Delete confirm modal is already `max-w-sm fixed inset-0` — no change.

---

### SessionLogger.tsx

- `grid-cols-2` for Date + Notes: change to `grid-cols-1 sm:grid-cols-2` so they stack on mobile.
- Player search, dropdown, and "Create new player" flow: vertical by nature, no changes.
- Drag-to-rank: **no changes** — `PointerSensor` handles touch drag.

---

### Leaderboard.tsx

Most change-heavy page — multiple wide tables and an inline filter row.

1. **Global Rankings table** (6 columns): wrap in `overflow-x-auto`.
2. **Most Played Games table** (3 columns): wrap in `overflow-x-auto`.
3. **Per-Game Leaderboard table** (5 columns): wrap in `overflow-x-auto`.
4. **Head-to-Head player selects**: `flex gap-3` inline → `flex flex-col sm:flex-row gap-3` to stack on mobile.
5. **Head-to-Head result** `grid-cols-3` scoreboard: fine on mobile, no change.
6. **Head-to-Head sessions table** (4 columns): wrap in `overflow-x-auto`.

---

### PlayerProfile.tsx

- Stats grid already uses `grid-cols-2 sm:grid-cols-4` — no change.
- Player header (`flex items-center gap-5`): fine on mobile.
- Session history table: wrap in `overflow-x-auto`.

---

### GameDetail.tsx

- Cover image + metadata header: if it's a `flex` row, add `flex-col sm:flex-row` so it stacks on mobile.
- Session history / results tables: wrap in `overflow-x-auto`.

---

### GameForm.tsx

- Form fields are a vertical stack — no layout changes beyond the global padding fix.

---

## Holes / Deferred Decisions

1. **Library filter bar on mobile**: Five filter inputs with `flex-wrap` is functional but visually cluttered at 375px. A collapse/expand "Filters" toggle would improve UX but is deferred — accepted as-is for v1.

2. **Touch target sizes**: Edit and Delete buttons on player rows are `text-xs px-3 py-1` (~28px). Below the 44px WCAG recommendation. Acceptable for a private self-hosted app; revisit if usability issues are reported.

3. **Landscape phone mode**: Treated the same as tablet (≥ 768px). No special handling.

4. **`max-w-*` containers**: Harmless on mobile (they exceed any phone viewport). Leave unchanged.

5. **iOS safe-area inset**: The bottom tab bar may overlap the system home indicator on iPhone. Adding `padding-bottom: env(safe-area-inset-bottom)` to the tab bar is a polish item, not a v1 blocker.

---

## Out of Scope

- New features, pages, or routes
- Design system or color token changes
- PWA / installability / offline support
- Tablet-specific layouts (tablet uses the desktop layout)
- Animation or transition changes