# ERD: Tally — Responsive Layout

## Overview

Single PR. Eight commits, one per PRD section, in the order below. Single breakpoint: Tailwind `md` (768px). Desktop layout is untouched; all changes are additive mobile overrides.

---

## Commit 1 — Layout: mobile bottom tab bar

**File:** `client/src/components/Layout.tsx`

### 1. Hide sidebar on mobile

Change the `<aside>` className from:
```
w-56 bg-sidebar text-sidebar-foreground border-r border-border flex flex-col shrink-0
```
to:
```
hidden md:flex md:flex-col w-56 bg-sidebar text-sidebar-foreground border-r border-border shrink-0
```

### 2. Add bottom padding to `<main>` on mobile

Change the `<main>` className from:
```
flex-1 overflow-auto bg-background
```
to:
```
flex-1 overflow-auto bg-background pb-16 md:pb-0
```

### 3. Add fixed bottom tab bar

Insert a new `<nav>` element between `<main>` and the closing outer `<div>`:

```tsx
<nav className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-sidebar border-t border-border flex">
  {navItems.map(({ to, label, Icon }) => (
    <NavLink
      key={to}
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center justify-center flex-1 py-2 gap-1 text-xs font-medium transition-colors ${
          isActive
            ? 'bg-sidebar-primary/15 text-sidebar-primary'
            : 'text-sidebar-foreground/70'
        }`
      }
    >
      <Icon size={20} />
      <span>{label}</span>
    </NavLink>
  ))}
</nav>
```

**Notes:**
- `navItems` is already defined at the top of the file — reuse it as-is.
- Theme toggle is not exposed on mobile. It lives inside `<aside>` which is hidden — no further action needed.
- iOS safe-area inset (`env(safe-area-inset-bottom)`) is deferred — not a v1 requirement.

---

## Commit 2 — Global: page padding

**Change:** `p-8` → `p-4 md:p-8` on the outermost container of every page.

**Affected files and locations:**

| File | What to change |
|---|---|
| `client/src/pages/Dashboard.tsx` | Outermost `<div className="p-8 ...">` |
| `client/src/pages/Library.tsx` | Outermost `<div className="p-8 ...">` |
| `client/src/pages/Players.tsx` | Outermost `<div className="p-8 ...">` |
| `client/src/pages/SessionLogger.tsx` | Outermost `<div className="p-8 ...">` |
| `client/src/pages/Leaderboard.tsx` | Outermost `<div className="p-8 ...">` |
| `client/src/pages/PlayerProfile.tsx` | Outermost `<div className="p-8 ...">` |
| `client/src/pages/GameDetail.tsx` | Outermost `<div className="p-8 max-w-4xl">` + both loading/error fallback divs (`p-8 text-muted-foreground`) |
| `client/src/pages/GameForm.tsx` | Outermost `<div className="p-8 ...">` |

---

## Commit 3 — Dashboard: table overflow

**File:** `client/src/pages/Dashboard.tsx`

Wrap the Top Players `<table>` element in a scroll container:

```tsx
<div className="overflow-x-auto">
  <table ...>
    ...
  </table>
</div>
```

No other changes — game grids already have responsive column breakpoints.

---

## Commit 4 — Library: search input width

**File:** `client/src/pages/Library.tsx`

Change the search input width from `w-52` to `w-full sm:w-52` so it fills the row on narrow screens.

No other changes — game grid already has responsive column breakpoints; min/max player inputs are fine as-is.

---

## Commit 5 — SessionLogger: date/notes grid

**File:** `client/src/pages/SessionLogger.tsx`

Change the Date + Notes grid from `grid-cols-2` to `grid-cols-1 sm:grid-cols-2` so the two fields stack on mobile.

No other changes — player search and drag-to-rank work on touch as-is.

---

## Commit 6 — Leaderboard: overflow and head-to-head stacking

**File:** `client/src/pages/Leaderboard.tsx`

### Tables — wrap each in `overflow-x-auto`

Four tables need scroll wrappers:

1. **Global Rankings** (6 columns)
2. **Most Played Games** (3 columns)
3. **Per-Game Leaderboard** (5 columns)
4. **Head-to-Head sessions** (4 columns)

For each:
```tsx
<div className="overflow-x-auto">
  <table ...>
    ...
  </table>
</div>
```

### Head-to-Head player selects — stack on mobile

Change the player select row from `flex gap-3` to `flex flex-col sm:flex-row gap-3`.

---

## Commit 7 — PlayerProfile: session history overflow

**File:** `client/src/pages/PlayerProfile.tsx`

Wrap the session history `<table>` in a scroll container:

```tsx
<div className="overflow-x-auto">
  <table ...>
    ...
  </table>
</div>
```

No other changes — stats grid already uses `grid-cols-2 sm:grid-cols-4`; player header is fine on mobile.

---

## Commit 8 — GameDetail: header stacking and table overflow

**File:** `client/src/pages/GameDetail.tsx`

### 1. Stack the cover + info header on mobile

Line 68 — change `<div className="flex gap-8">` to:
```tsx
<div className="flex flex-col sm:flex-row gap-8">
```

### 2. Action buttons row — add flex-wrap

Line 90 — the title + action buttons row (`flex items-start justify-between gap-4`) can overflow on mobile when the game title is long and all three buttons (Session, Edit, Delete) are inline. Add `flex-wrap`:
```tsx
<div className="flex flex-wrap items-start justify-between gap-4">
```

### 3. Session history table overflow

Wrap the session history `<table>` in a scroll container:
```tsx
<div className="overflow-x-auto">
  <table ...>
    ...
  </table>
</div>
```

---

## Verification

Follow the verification checklist in `responsive-prd.md`.
