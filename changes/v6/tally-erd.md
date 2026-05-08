# Engineering Requirements Document
## Tally — Design System v6

**Version:** 6.0  
**Status:** Draft  
**Last Updated:** 2026-05-08  
**References:** [tally-prd.md](./tally-prd.md)

---

## 1. Purpose

This document translates the v6 PRD into concrete, file-level implementation tasks. It records deviations from the PRD where codebase reality changed the approach, defines the CSS architecture decisions, and provides a QA checklist developers can use to verify the implementation is complete.

**Exact file scope — nothing else is touched:**

| File | Change type |
|---|---|
| `client/index.html` | Add Google Fonts `<link>` tags |
| `client/src/index.css` | Add `--ds-*` token block, `@theme inline` entries, `@layer components` utility classes |
| `client/src/components/Layout.tsx` | Style changes only — restyle `DesktopNav` and `MobileNav` with DS tokens |
| `client/src/pages/Home.tsx` | Style changes only — apply DS tokens and typography utility classes |

---

## 2. PRD Deviations

These are intentional departures from the PRD, agreed at planning time.

| # | PRD says | ERD decision | Reason |
|---|---|---|---|
| 1 | Create new `BottomNav.tsx` component | No new file; restyle existing `MobileNav` in-place inside `Layout.tsx` | The mobile nav already exists and is structurally correct; only styles need to change |
| 2 | Player status badges on Home using `--ds-status-*` tokens | Define tokens in CSS; do not render badges on Home | `LeaderboardEntry` has no ownership field; badges are for future pages |
| 3 | `--text-xs` through `--text-3xl` custom property type scale | Skip custom type scale vars; use existing Tailwind `text-*` utilities directly | Tailwind v4 already owns the type scale via `@theme`; duplicating it as raw vars adds noise without benefit |
| 4 | `.eyebrow`, `.num`, `.hand` as utility classes | Implement as `@layer components` blocks in `index.css` | These are multi-property combos (font + size + weight + letter-spacing), which is the intended use case for `@layer components` in Tailwind v4 |
| 5 | Inter "already loaded via Google Fonts, no import needed" | Add Inter to the font import alongside JetBrains Mono and Kalam | `index.html` has no font imports at all; Inter is currently falling back to the system sans-serif stack |

---

## 3. File-Level Implementation Plan

### 3.1 `client/index.html`

**Task:** Add Google Fonts imports for all three typefaces.

```html
<!-- Add to <head>, before </head> -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@600;700&family=Kalam:wght@700&display=swap"
  rel="stylesheet"
/>
```

**Requirements:**
- `display=swap` appended to the Google Fonts URL satisfies the `font-display: swap` NFR.
- All three families (Inter, JetBrains Mono, Kalam) in a single request to minimise round-trips.
- `preconnect` hints added for `fonts.googleapis.com` and `fonts.gstatic.com`.

---

### 3.2 `client/src/index.css`

This file gets four additions, each in a separate block. Never edit the existing shadcn variable block.

#### A. DS token block (`:root` and `.dark`)

Add immediately **after** the existing `.dark { }` closing brace, before `@theme inline`.

```css
/* ── Tally DS tokens ──────────────────────────────────────── */
:root {
  /* Rank medals */
  --ds-rank-gold:   oklch(0.82 0.17 87);
  --ds-rank-silver: oklch(0.72 0.02 240);
  --ds-rank-bronze: oklch(0.66 0.12 50);

  /* Surfaces */
  --ds-surface-elevated: oklch(0.99 0 0);
  --ds-surface-sunken:   oklch(0.96 0 0);

  /* Player status */
  --ds-status-own:    oklch(0.85 0.18 90);   /* primary yellow */
  --ds-status-friend: oklch(0.65 0.15 250);  /* blue */
  --ds-status-rented: oklch(0.72 0.18 0);    /* pink */

  /* Feedback */
  --ds-success: oklch(0.68 0.18 145);
  --ds-warning: oklch(0.78 0.18 70);
  --ds-info:    oklch(0.65 0.15 250);
}

.dark {
  /* Rank medals — slightly desaturated for dark backgrounds */
  --ds-rank-gold:   oklch(0.78 0.15 87);
  --ds-rank-silver: oklch(0.65 0.02 240);
  --ds-rank-bronze: oklch(0.60 0.10 50);

  /* Surfaces */
  --ds-surface-elevated: oklch(0.22 0 0);
  --ds-surface-sunken:   oklch(0.18 0 0);

  /* Player status */
  --ds-status-own:    oklch(0.78 0.16 90);
  --ds-status-friend: oklch(0.60 0.14 250);
  --ds-status-rented: oklch(0.68 0.16 0);

  /* Feedback */
  --ds-success: oklch(0.62 0.16 145);
  --ds-warning: oklch(0.72 0.16 70);
  --ds-info:    oklch(0.60 0.14 250);
}
```

> **OKLch values above are initial proposals.** They must pass a WCAG AA contrast check before the PR merges (see §7 QA checklist). Adjust lightness as needed.

#### B. `@theme inline` DS entries

Append inside the existing `@theme inline { }` block, after the last shadcn entry:

```css
  /* Tally DS tokens */
  --color-ds-rank-gold:   var(--ds-rank-gold);
  --color-ds-rank-silver: var(--ds-rank-silver);
  --color-ds-rank-bronze: var(--ds-rank-bronze);

  --color-ds-surface-elevated: var(--ds-surface-elevated);
  --color-ds-surface-sunken:   var(--ds-surface-sunken);

  --color-ds-status-own:    var(--ds-status-own);
  --color-ds-status-friend: var(--ds-status-friend);
  --color-ds-status-rented: var(--ds-status-rented);

  --color-ds-success: var(--ds-success);
  --color-ds-warning: var(--ds-warning);
  --color-ds-info:    var(--ds-info);
```

This generates Tailwind utilities: `bg-ds-rank-gold`, `text-ds-rank-silver`, `border-ds-surface-elevated`, etc.

#### C. Font family registrations

Append inside `@theme inline { }` alongside the color entries:

```css
  /* DS typography families */
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;
  --font-hand: 'Kalam', cursive;
```

Tailwind v4 maps `--font-sans` / `--font-mono` into its theme. Overriding `--font-mono` ensures `font-mono` utility uses JetBrains Mono. `--font-hand` is a new family key; use it as `font-[--font-hand]` in JSX, or define a shorthand utility class below.

#### D. Typography utility classes (`@layer components`)

Add after the `@theme inline` block:

```css
@layer components {
  .eyebrow {
    font-family: var(--font-mono);
    font-size: var(--text-xs);      /* Tailwind's existing 0.75rem */
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.12em;
  }

  .num {
    font-family: var(--font-mono);
    font-variant-numeric: tabular-nums;
    font-weight: 700;
  }

  .hand {
    font-family: var(--font-hand);
    font-size: var(--text-xl);      /* Tailwind's existing 1.25rem */
    font-weight: 700;
    rotate: -2deg;
    color: var(--primary);
  }
}
```

Usage in JSX: `className="eyebrow"`, `className="num"`, `className="hand"`. These compose freely with Tailwind utilities (e.g. `className="num text-ds-rank-gold"`).

---

### 3.3 `client/src/components/Layout.tsx`

**Scope:** Style changes only. No structural changes, no new component files, no prop or export changes.

#### DesktopNav (`<aside>`)

| Element | Current class | Replace with |
|---|---|---|
| Sidebar background | `bg-sidebar` | `bg-ds-surface-elevated` |
| Sidebar border | `border-border` | keep as-is (shadcn border token is fine) |
| Brand mark text | `text-sidebar-primary` | `text-primary` (maps to the warm yellow) |
| Active nav item background | `bg-sidebar-primary/15` | `bg-primary/10` |
| Active nav item text | `text-sidebar-primary` | `text-primary` |
| Inactive nav item text | `text-sidebar-foreground/70` | `text-foreground/60` |
| Section label (if added) | — | `eyebrow` class |

#### MobileNav (`<nav>`)

| Element | Current class | Replace with |
|---|---|---|
| Nav background | `bg-sidebar` | `bg-ds-surface-elevated` |
| Active item text | `text-sidebar-primary` | `text-primary` |
| Active item background | `bg-sidebar-primary/15` | `bg-primary/10` |
| Inactive item text | `text-sidebar-foreground/70` | `text-foreground/50` |

> The existing `fixed bottom-4 left-4 right-4 rounded-2xl border shadow-lg` structure is correct and stays unchanged.

---

### 3.4 `client/src/pages/Home.tsx`

**Scope:** Style changes only. No data fetching, routing, state, or logic changes.

#### Leaderboard section

| Element | Current | Replace with |
|---|---|---|
| Section header `<h2>` | `text-lg font-semibold text-foreground` | keep size; add `font-sans` if needed for clarity |
| Table `<thead>` | `text-xs tracking-wide text-muted-foreground uppercase` | replace with `.eyebrow text-muted-foreground` |
| Rank `<td>` (column `#`) | `font-medium text-muted-foreground` | `.num text-muted-foreground` |
| Points `<td>` | `font-semibold` | `.num` |
| Wins `<td>` | `text-muted-foreground` | `.num text-muted-foreground` |
| Row 1 rank cell | — | add `text-ds-rank-gold` |
| Row 2 rank cell | — | add `text-ds-rank-silver` |
| Row 3 rank cell | — | add `text-ds-rank-bronze` |
| Table container | `bg-card` | `bg-ds-surface-elevated` |

#### Most Played / Least Played game cards

| Element | Current | Replace with |
|---|---|---|
| Card background | `bg-card` | `bg-ds-surface-elevated` |
| Session count text | `text-xs text-muted-foreground` | `.num text-muted-foreground text-xs` |

#### Recently Added `GameCard`

| Element | Current | Replace with |
|---|---|---|
| Card background | `bg-card` | `bg-ds-surface-elevated` |
| Placeholder area | `bg-muted` | `bg-ds-surface-sunken` |

#### Section headers (all three sections)

Current: `text-lg font-semibold text-foreground`  
No change required — these are prose headings, sans-serif is correct.

---

## 4. Token Naming Reference

| Tailwind class | CSS variable | Use case |
|---|---|---|
| `text-ds-rank-gold` | `--ds-rank-gold` | 1st place rank indicator |
| `text-ds-rank-silver` | `--ds-rank-silver` | 2nd place rank indicator |
| `text-ds-rank-bronze` | `--ds-rank-bronze` | 3rd place rank indicator |
| `bg-ds-surface-elevated` | `--ds-surface-elevated` | Cards, sidebars, any raised surface |
| `bg-ds-surface-sunken` | `--ds-surface-sunken` | Image placeholders, nested content areas |
| `text-ds-status-own` | `--ds-status-own` | (Future) Game ownership badge |
| `text-ds-status-friend` | `--ds-status-friend` | (Future) Friend-owned badge |
| `text-ds-status-rented` | `--ds-status-rented` | (Future) Rented game badge |
| `text-ds-success` | `--ds-success` | (Future) Success feedback |
| `text-ds-warning` | `--ds-warning` | (Future) Warning feedback |
| `text-ds-info` | `--ds-info` | (Future) Info feedback |

---

## 5. Typography Class Reference

| Class | Font | Size | Weight | Extra | Use case |
|---|---|---|---|---|---|
| `.eyebrow` | JetBrains Mono | `text-xs` (0.75rem) | 600 | uppercase, 0.12em tracking | Table headers, section labels |
| `.num` | JetBrains Mono | inherits | 700 | tabular-nums | Scores, ranks, counts |
| `.hand` | Kalam | `text-xl` (1.25rem) | 700 | −2° rotation, primary color | Accent text only (1–2 per screen) |

---

## 6. Risks & Open Questions

| # | Risk / Question | Owner | Resolution |
|---|---|---|---|
| 1 | **Inter loading** — Currently no font import exists. System Inter may render differently from Google Fonts Inter across devices. | Dev | Add Inter to the Google Fonts import; monitor for visual regressions on Windows (system sans is not Inter). |
| 2 | **OKLch values** — Token values in §3.2A are proposals, not verified. Some text-on-background pairs may fail WCAG AA. | Dev | Run contrast check during implementation (see QA §7). Adjust lightness values before merge. |
| 3 | **DS tokens bleeding into shadcn components** — Any `--ds-*` token that accidentally shares a value chain with a shadcn variable could cause unexpected color changes in untouched shadcn components (Button, Badge, Dialog, etc.). | Dev | Keep `--ds-*` entirely separate from the shadcn block. Never assign a `--ds-*` var as the value of `--primary`, `--accent`, or any other non-`--ds-` variable. Spot-check shadcn components visually after the token block lands. |
| 4 | **Google Fonts in production** — External font requests may be blocked in certain self-hosted network setups. | Dev | Acceptable for v6 per PRD. Self-hosting deferred. Note in README if network-restricted deployments are expected. |

---

## 7. QA Checklist

Before marking v6 implementation complete:

### CSS / Tokens
- [ ] `--ds-*` block exists in both `:root` and `.dark` in `index.css`
- [ ] All `--ds-*` tokens registered in `@theme inline` as `--color-ds-*`
- [ ] No new tokens added to the existing shadcn variable block
- [ ] `.eyebrow`, `.num`, `.hand` defined in `@layer components`
- [ ] `font-mono` utility renders JetBrains Mono — verify in browser devtools (expected; intentional global change)
- [ ] Spot-check shadcn components (Button, Badge, Input, Dialog) — no unintended color changes from DS token block

### Fonts
- [ ] Google Fonts `<link>` present in `index.html` with `display=swap`
- [ ] Inter, JetBrains Mono, Kalam all load correctly in browser Network tab
- [ ] No layout shift observable on slow-network throttle (Chrome DevTools)

### WCAG AA Contrast (manual check)
- [ ] `text-ds-rank-gold` on `bg-ds-surface-elevated` — light mode ≥ 4.5:1
- [ ] `text-ds-rank-gold` on `bg-ds-surface-elevated` — dark mode ≥ 4.5:1
- [ ] `.eyebrow` (`text-muted-foreground`) on table header background — both modes ≥ 3:1 (large text)
- [ ] `.num` scores on card background — both modes ≥ 4.5:1

### Layout
- [ ] Desktop sidebar renders correctly in light and dark mode
- [ ] Mobile nav renders correctly in light and dark mode
- [ ] Active route highlighted correctly in both nav variants
- [ ] No visual regressions on all 10 routes (navigate through each manually)
- [ ] `pb-28` bottom padding on `<main>` still clears the floating mobile nav

### Home Page
- [ ] Leaderboard table header uses `.eyebrow` class
- [ ] Rank `#` column uses `.num` class
- [ ] Points and Wins columns use `.num` class
- [ ] Rows 1, 2, 3 have gold/silver/bronze text color respectively
- [ ] All card backgrounds use `bg-ds-surface-elevated`
- [ ] Image placeholder areas use `bg-ds-surface-sunken`
- [ ] Page is functionally identical to pre-v6 (same data renders, links work)

### Dark Mode
- [ ] Toggle dark mode on Home page — no token renders as `oklch(0 0 0)` or invisible
- [ ] Toggle dark mode on Layout — sidebar and mobile nav both switch correctly
