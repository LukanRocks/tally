# Product Requirements Document
## Deterministic Fallback Backgrounds — Tally v10

**Version:** v10
**Status:** Draft
**Last Updated:** 2026-05-22

---

## 1. Overview

### 1.1 Product Summary

When a user adds a board game to their library without uploading a cover image, Tally currently shows a generic `<Dices>` icon. v10 replaces that placeholder with one of 12 abstract SVG backgrounds, chosen deterministically from the game's ID — so the same game always shows the same background with no database involvement and no flicker between renders. As part of this work, the repeated inline game-card markup across Library, Home, and future surfaces is consolidated into a single shared `<GameCard>` component.

### 1.2 Goals

- Every game card has a visually appealing, distinct fallback when no cover image has been uploaded.
- The fallback is stable: the same game always maps to the same background across page loads, sessions, and devices.
- Game card markup is defined once and reused across all list surfaces, eliminating drift between Library and Home.
- Adding new SVG backgrounds in future requires only a new import line — no formula or component changes.

### 1.3 Non-Goals

- No user-facing control to choose or change a game's background.
- No database column to persist background assignment.
- No random-per-render selection (causes flicker and inconsistency).
- No hash-based ID dispersion — sequential IDs with modulo are sufficient at this scale.
- No changes to the image upload flow.
- No new backgrounds beyond the 12 already staged.

---

## 2. User Stories

1. As a user, I want games without a cover image to display an attractive background, so that my library looks polished even for games I haven't photographed.
2. As a user, I want the same game to always show the same background, so that I can recognise a game by its card at a glance without reading the title.
3. As a user adding a new game without a cover, I want the fallback to appear immediately with no loading delay, so that the card feels fully rendered from the start.
4. As a user with many coverless games, I want different games to show different backgrounds, so that my library grid is visually varied rather than uniform.
5. As a user viewing the Home page, I want most-played and least-played game cards to also show the SVG fallback, so that the experience is consistent regardless of which page I'm on.
6. As a user on the game detail page, I want the cover area to show the SVG fallback when no image has been uploaded, so that the page doesn't look broken before I upload one.
7. As a user on the game detail page, I want to still see the camera icon when hovering over the fallback cover area, so that I know I can upload an image even when a fallback is shown.
8. As a user with an uploaded cover image, I want my uploaded image to continue displaying as it always has, so that this change has no visible effect on my existing games.
9. As a developer, I want game card markup defined in one place, so that styling or layout changes propagate to every surface automatically.

---

## 3. Features & Requirements

### 3.1 Background Helper Module

A helper module at `web/src/lib/backgrounds/index.ts` (co-located with the SVG assets) that owns the selection logic.

**Requirements:**

- Statically imports all 12 SVGs (`bg-0.svg` through `bg-11.svg`) from the same directory using Vite's static asset import.
- Exports a single function: `getBackgroundFallback(gameId: number): string` that returns the resolved asset URL.
- Selection formula: `backgrounds[gameId % backgrounds.length]` — uses `backgrounds.length`, not the hardcoded number `12`, so adding a new SVG is a one-import change.
- No runtime asset fetching, no dynamic `import()`, no CDN.

---

### 3.2 Shared GameCard Component

A new `<GameCard>` component at `web/src/components/game-card.tsx` that encapsulates the card UI used in the Library grid and Home page.

**Requirements:**

- Accepts a minimal shared interface rather than the full `Game` type, so it can be used with both `Game` and `MostPlayedGame`: `{ id: number; name: string; cover_image_path: string | null; min_players?: number | null; max_players?: number | null; session_count?: number | null }`.
- Renders: cover image (uploaded or fallback), game name (truncated), player count range (if present), session count (if present).
- Uses `getBackgroundFallback(game.id)` when `game.cover_image_path` is null.
- The fallback image renders as an `<img>` element with `object-cover`, identical in treatment to an uploaded cover.
- The entire card is a `<Link>` to `/library/{game.id}`, matching current behaviour.
- Applies the same hover shadow and scale-on-image effects currently in Library.
- No upload affordance — that is specific to `GameDetail` and stays there.

---

### 3.3 Fallback on GameDetail Cover

The cover area on the game detail page shows the SVG fallback when no uploaded image exists, while preserving the click-to-upload interaction.

**Requirements:**

- When `game.cover_image_path` is null, render `<img src={getBackgroundFallback(game.id)} className="h-full w-full object-cover" />` in place of the current `<Dices>` icon.
- The camera-icon overlay (triggered on hover, `absolute`-positioned) remains unchanged and renders on top of both uploaded images and the SVG fallback.
- The `onClick` handler that triggers the hidden file input is unchanged.
- Games with an uploaded cover continue to render that cover — no change to the existing `<img>` branch.

---

### 3.4 Surface Updates

Replace the inline card markup in Library and Home with the new `<GameCard>` component.

**Requirements:**

- `Library.tsx`: replace the inline `<Link>…</Link>` card block with `<GameCard game={game} />`. Grid layout and filter/sort controls are unchanged.
- `Home.tsx`: replace all three inline card instances (most-played, least-played, recent games) with `<GameCard game={g} />` or equivalent.
- Visual output on both pages must be identical to the current implementation for games that have a cover image.

---

## 4. UI/UX Guidelines

- **Fallback appearance:** The SVG fills the full image area with `object-cover` — same dimensions and aspect ratio as an uploaded cover. It should look intentional, not like a broken image state.
- **No label or badge:** The fallback is not annotated with "no image" or any placeholder text.
- **Consistency:** The same background renders for a given game on every surface (Library grid, Home cards, GameDetail cover) because it derives from the same `game.id`.
- **Upload affordance preserved:** On the GameDetail cover, the hover overlay and camera icon are unaffected by the fallback — the user can still discover and use the upload action.
- **Responsiveness:** `<GameCard>` is mobile-first, matching the current grid layout in Library.

---

## 5. Technical Considerations

### 5.1 Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React + TypeScript + Vite | Static SVG imports resolved and fingerprinted at build time |
| Styling | Tailwind CSS + shadcn/ui | No new UI packages; `<GameCard>` uses existing Tailwind classes |
| Backend | None | Entirely client-side — no server or DB involvement |

### 5.2 Data Models

No new data models. No schema changes. The helper derives its output entirely from the existing `game.id: number` field on the `Game` type.

#### Business Logic — Background Selection

```
getBackgroundFallback(gameId) → backgrounds[gameId % backgrounds.length]
```

`backgrounds` is a statically-typed array of resolved Vite asset URLs, built from the 12 static imports in `index.ts`. The formula is pure and has no side effects.

**Future note:** If sequential clustering (games 1–12 mapping to bg-1 through bg-12 in order) becomes visually monotonous in dense grid views, the modulo can be replaced with a one-line multiplicative hash without changing the exported function signature or any call sites.

### 5.3 Key Constraints & Decisions

- Static imports only — Vite fingerprints and caches SVGs at build time; no runtime resolution needed.
- `backgrounds.length` used in the formula (not the literal `12`) to keep the asset set extensible without touching logic.
- `<GameCard>` has no upload affordance — the GameDetail cover is structurally different (clickable area, hidden file input) and stays as bespoke markup, consuming `getBackgroundFallback` directly.
- `<GameCard>` accepts a minimal interface `{ id, name, cover_image_path, min_players?, max_players?, session_count? }` rather than the full `Game` type. Both `Game` and `MostPlayedGame` satisfy this interface, enabling reuse across Library and Home without type casts.

### 5.4 Modules to Build or Modify

| Module | New / Modify | Notes |
|---|---|---|
| `web/src/lib/backgrounds/index.ts` | New | Helper module co-located with SVGs; exports `getBackgroundFallback` |
| `web/src/components/game-card.tsx` | New | Shared card component for Library and Home |
| `web/src/pages/Library.tsx` | Modify | Replace inline card block with `<GameCard>` |
| `web/src/pages/Home.tsx` | Modify | Replace all inline card instances with `<GameCard>` |
| `web/src/pages/GameDetail.tsx` | Modify | Use `getBackgroundFallback` for cover fallback; no structural change to upload UX |

---

## 6. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Fallback render latency | Zero — SVG URLs resolved at build time, no async |
| Stability | Same `gameId` → same background on every render, everywhere |
| Games with uploaded covers | Completely unaffected — no visual or behavioural change |
| Bundle size impact | Negligible — 12 small abstract SVGs |
| DB impact | None |
| New dependencies | None |

---

## 7. Out of Scope (v10)

- User-selectable backgrounds per game.
- Animated or gradient backgrounds.
- Background assignment persisted in the database.
- Hash-based ID dispersion (can be swapped in without interface changes if needed later).
- Adding backgrounds beyond the current 12 SVGs.
- Extracting the GameDetail cover area into a shared component (it has upload UX that makes it structurally distinct).

---

## 8. Open Questions

No open questions — all items resolved during the PRD interview.

---

*End of Document*
