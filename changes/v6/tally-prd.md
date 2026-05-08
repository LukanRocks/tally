# Product Requirements Document
## Tally — Design System v6

**Version:** 6.0
**Status:** Draft
**Last Updated:** 2026-05-08

---

## 1. Overview

### 1.1 Product Summary

Tally is a self-hosted board game manager that lets a household or group track game sessions, scores, and player rankings. The v6 update introduces a Tally-specific design system — a thin, playful layer on top of the existing shadcn/ui + Tailwind v4 stack. It does not replace the underlying component library; it adds a purposeful visual identity through new semantic tokens, a three-family typography system, and updated layout and navigation. The proof of concept is a restyled Home page that demonstrates the full system working end-to-end.

### 1.2 Goals

- Give Tally a distinct visual identity — warm, playful, "analog scoreboard" — rather than the generic shadcn defaults.
- Establish a stable, maintainable design token layer (`--ds-*`) that can be extended to all pages in future iterations without forking shadcn.
- Update the navigation chrome (Layout + BottomNav) to feel native and intentional on mobile.
- Prove the design system is functional by applying it to the Home page.

### 1.3 Non-Goals

- Restyling all 10 pages (deferred to future iterations; v6 covers Home only as proof of concept).
- Any backend, database, or API changes — this is a purely frontend update.
- Graduating shadcn components into `src/components/` (deferred; components stay in `src/shadcn/` for now).
- Custom animations or micro-interactions beyond what Tailwind + tw-animate-css provide.
- Changing the app's information architecture, routing, or feature set.

---

## 2. User Stories

1. As a player opening Tally on my phone, I want the app to feel visually distinct and intentional, so that it doesn't feel like a generic shadcn boilerplate.
2. As a player viewing the Home page, I want scores and ranks to be visually prominent and easy to scan, so that I can quickly see who's winning.
3. As a player navigating between pages on mobile, I want a bottom navigation bar, so that I can reach any section with one thumb tap.
4. As a player who prefers dark mode, I want the new design tokens to respect my theme preference, so that nothing is hard to read or visually broken in dark mode.
5. As a developer maintaining Tally, I want the new design tokens to use a `--ds-*` namespace, so that I can extend the system without conflicting with shadcn's own tokens.
6. As a developer adding a new page or component, I want documented typography utility classes (`.eyebrow`, `.num`, `.hand`), so that I can apply consistent styles without guessing.
7. As a developer updating shadcn in the future, I want the original files in `src/shadcn/` to remain untouched, so that `npx shadcn add` commands work cleanly.
8. As a player seeing my rank on the Home leaderboard, I want gold/silver/bronze rank indicators to use the correct medal colors, so that my position is immediately recognisable.
9. As a player checking my game collection status, I want own/friend/rented status to be visually distinguishable at a glance, so that I know what I can play right now.
10. As a developer applying the design system for the first time, I want the Home page to serve as a reference implementation, so that I have a concrete example to follow for other pages.

---

## 3. Features & Requirements

### 3.1 Design Token Registry

A new set of semantic CSS custom properties, namespaced as `--ds-*`, defined in `client/src/index.css`. Tokens have both light and dark mode variants. All tokens are exposed to Tailwind via `@theme inline` so they can be used as `bg-ds-*`, `text-ds-*`, etc.

**Requirements:**

- Rank medal tokens: `--ds-rank-gold`, `--ds-rank-silver`, `--ds-rank-bronze` — defined in OKLch to match the warm palette.
- Surface tokens: `--ds-surface-elevated` (near-white / dark-grey), `--ds-surface-sunken` (slightly darker nesting).
- Player status tokens: `--ds-status-own` (primary yellow), `--ds-status-friend` (blue), `--ds-status-rented` (pink).
- Feedback tokens: `--ds-success` (green), `--ds-warning` (amber), `--ds-info` (blue).
- All tokens must have distinct light and dark variants defined under `:root` and `.dark` respectively.
- Tokens must not conflict with or override any existing shadcn `--primary`, `--accent`, or other non-`--ds-` variables.
- Each token must be registered in `@theme inline` as `--color-ds-{name}` so Tailwind utility classes are generated.

### 3.2 Typography System

Three font families imported and configured, with three global utility classes for recurring type roles.

**Requirements:**

- **Inter** is already in use as the default sans-serif — no new import needed. Confirm the existing `font-family` declaration covers all body text.
- **JetBrains Mono** loaded via Google Fonts (or self-hosted) as the monospace family. Used for data labels, scores, ranks, table headers.
- **Kalam** loaded via Google Fonts (or self-hosted) as the hand/accent family. Used sparingly — max 1–2 instances per screen for empty states or celebratory moments.
- Utility class `.eyebrow`: mono, `text-xs`, weight 600, uppercase, letter-spacing `0.12em`. Used for section labels and table headers.
- Utility class `.num` (alias `.num-mono`): JetBrains Mono, `tabular-nums`, weight 700. Used for scores, ranks, and any displayed numerals.
- Utility class `.hand`: Kalam, `text-lg`–`text-2xl`, weight 700, slight rotation (~−2°), primary color. Used for accent text only.
- Type scale defined as CSS custom properties (`--text-xs` through `--text-3xl`) with mobile-first values, following the scale in the design draft.

### 3.3 Layout & Navigation Update

The main `Layout.tsx` component updated to support a mobile bottom navigation bar, with the existing layout chrome restyled using DS tokens.

**Requirements:**

- New `BottomNav.tsx` component in `src/components/` with navigation items for: Home, Library, Leaderboard, Players, Settings.
- `BottomNav` is only visible on mobile (hidden at `md:` breakpoint and above).
- Active route is highlighted in `BottomNav` using the `--ds-*` primary/accent token.
- `Layout.tsx` renders `BottomNav` below the page content on mobile.
- Existing desktop nav/sidebar chrome in `Layout.tsx` is restyled with DS tokens and typography utilities — no structural or behavioral changes.
- Dark mode must be fully functional for the updated layout — all DS token colors must render correctly in both `:root` and `.dark`.
- The layout change must not break any existing page; all 10 routes must still render correctly.

### 3.4 Home Page — Proof of Concept

`Home.tsx` restyled to use the new design tokens and typography utilities, serving as the reference implementation for the design system.

**Requirements:**

- Page title / hero uses the new `--text-2xl` / sans bold type scale.
- Leaderboard section uses `.eyebrow` for section label and `.num` for rank numerals and scores.
- Rank indicators (1st, 2nd, 3rd) use `--ds-rank-gold`, `--ds-rank-silver`, `--ds-rank-bronze` respectively.
- Player status badges (if shown) use `--ds-status-own`, `--ds-status-friend`, `--ds-status-rented`.
- Card surfaces use `--ds-surface-elevated` / `--ds-surface-sunken` where applicable.
- The page must be visually consistent in both light and dark mode.
- The page must remain functionally identical — no data fetching, routing, or logic changes.

---

## 4. UI/UX Guidelines

- **Responsiveness:** Mobile-first. Default styles target phone (375px+); `md:` breakpoint (768px+) adjusts for tablet/desktop. BottomNav is phone-only.
- **Navigation:** Bottom navigation bar on mobile. Existing top/sidebar chrome on desktop (exact desktop pattern to be decided during implementation — not blocking for v6 proof of concept).
- **Typography tone:** Mono for anything numeric or data-table; sans for prose and UI copy; hand font sparingly for personality moments only.
- **Color discipline:** Only use `--ds-*` tokens for new design work. Never apply shadcn tokens (`--primary`, `--accent`, etc.) directly to new Tally-specific components — graduate them via the DS namespace instead.
- **Dark mode:** All new tokens must pass WCAG AA contrast in both light and dark mode before shipping.
- **Empty states:** Not in scope for v6 (only Home is being restyled, and Home has populated data).
- **Loading states:** Inherit existing loading patterns from `Page.tsx` — no changes to loading UX in v6.
- **Destructive actions:** Not affected by this update.

---

## 5. Technical Considerations

### 5.1 Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend framework | React 18 + Vite | No changes |
| Styling | Tailwind CSS v4 (Vite plugin) | No `tailwind.config.js` — all via CSS custom properties |
| Component library | shadcn/ui (radix-luma) | Files in `src/shadcn/` remain untouched |
| CSS architecture | OKLch custom properties in `index.css` | New `--ds-*` tokens added alongside existing vars |
| Fonts | Google Fonts (Inter, JetBrains Mono, Kalam) | Imported in `index.html` or `index.css` |
| Theme switching | next-themes + `document.documentElement.classList` | No changes to mechanism |

### 5.2 Data Models

No new data models. This update is purely presentational — no schema, migration, or API changes.

### 5.3 Key Constraints & Decisions

- **Never edit `src/shadcn/ui/`** — shadcn primitives must remain untouched for clean future upgrades.
- **`--ds-*` namespace only** — all new tokens use this prefix; no new tokens should be added to the existing shadcn variable block.
- **OKLch color space** — all new color tokens defined in OKLch to match the existing palette approach.
- **Dark mode parity** — every `--ds-*` token must have a `.dark` variant. Light-only tokens are not acceptable.
- **No backend changes** — this is a 100% frontend update. No server, DB, or API modifications.
- **Tailwind v4 conventions** — no `tailwind.config.js`, no `extend`; all Tailwind theme values registered via `@theme inline` in CSS.
- **Font loading** — fonts added to `index.html` `<head>` as Google Fonts `<link>` tags (or self-hosted to avoid external requests, to be decided during implementation).

### 5.4 Modules to Build or Modify

| Module | New / Modify | Notes |
|---|---|---|
| `client/src/index.css` | Modify | Add `--ds-*` token block, type scale vars, `.eyebrow`/`.num`/`.hand` utility classes, `@theme inline` entries |
| `client/index.html` | Modify | Add font `<link>` imports for Inter, JetBrains Mono, Kalam |
| `client/src/components/BottomNav.tsx` | New | Mobile bottom navigation — 5 items, active state with DS tokens |
| `client/src/components/Layout.tsx` | Modify | Wire in BottomNav, apply DS tokens to chrome |
| `client/src/pages/Home.tsx` | Modify | Restyle with DS tokens and typography utilities as proof of concept |

---

## 6. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Dark mode | All DS tokens render correctly in both light (`:root`) and dark (`.dark`) modes |
| WCAG contrast | All new text/background token pairs meet AA (4.5:1 for normal text, 3:1 for large text) |
| Existing pages | All 10 routes must continue to render without visual regressions after Layout changes |
| Font load performance | Fonts declared with `font-display: swap` to avoid layout shift on slow connections |
| Bundle size | No new runtime JS dependencies introduced — typography and tokens are CSS-only |

---

## 7. Out of Scope (v6)

- Restyling Library, GameDetail, GameForm, SessionLogger, Players, PlayerProfile, Leaderboard, Settings, Onboarding pages.
- Graduating shadcn components into `src/components/` with DS token substitutions.
- Custom animations or entrance transitions beyond existing tw-animate-css utilities.
- New Tally-specific composed components (LeaderboardRow, GameCard, AvatarRank, StatPill, etc.) — those come after the design system is stable.
- Changing the desktop navigation pattern (sidebar vs top nav) — v6 only adds BottomNav for mobile.
- Self-hosting fonts — Google Fonts import is acceptable for v6.
- Any database, API, or backend changes.
