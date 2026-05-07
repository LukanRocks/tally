# Product Requirements Document
## Tally — Player Types (Person vs. Shop)

**Version:** v4
**Status:** Draft
**Last Updated:** 2026-05-06

---

## 1. Overview

### 1.1 Product Summary

Players in Tally currently represent only human participants. This feature introduces a `player_type` field (`person` or `shop`) so that game rental shops can be modelled as players and set as a game's owner — making it easy to distinguish rented games from owned games in the library. Shop-type players are excluded from all competitive surfaces (leaderboards, head-to-head, session creation) because they are organisational entities, not game participants.

### 1.2 Goals

- Allow users to mark any player as either a person or a shop, at creation or by editing later.
- Enable rented/borrowed games to be tracked accurately by assigning a shop as the game's owner.
- Keep leaderboards, head-to-head comparisons, and session player selection free of shop-type players.
- Surface the person/shop distinction clearly in the Players page without disrupting the existing layout.

### 1.3 Non-Goals

- No per-shop analytics or profile pages — shops are not navigable entities.
- No new library filter UI — the existing owner filter already allows filtering games by shop owner.
- No per-game rental metadata (rental dates, return dates, cost).
- No authentication or multi-user access control.

---

## 2. User Stories

1. As a user, I want to mark a player as a shop when creating it, so that I can represent a rental shop from the start.
2. As a user, I want to change a player's type after creation, so that I can correct mistakes without deleting and recreating the player.
3. As a user, I want shop-type players to appear in a separate section on the Players page, so that I can tell at a glance which entries are shops and which are people.
4. As a user, I want to assign a shop as the owner of a game, so that I can record which games I borrowed rather than own.
5. As a user, I want to filter the library by owner using the existing owner filter, so that I can view only games I personally own (not rented from a shop).
6. As a user, I want shop-type players to be hidden from the session player selector, so that I don't accidentally add a shop as a session participant.
7. As a user, I want the global leaderboard to show only person-type players, so that shop entries don't pollute the rankings.
8. As a user, I want the per-game leaderboard to show only person-type players, so that game-level rankings remain meaningful.
9. As a user, I want the head-to-head comparison dropdowns to show only person-type players, so that I can only compare real participants.
10. As a user, I want existing players to default to the `person` type after the migration, so that nothing about the current app breaks.
11. As a user, I want to see a visual indicator (badge or icon) distinguishing shops from people on the Players page, so that the type is immediately obvious without opening an edit form.
12. As a user, I want to create a shop-type player inline from the Players page, so that I can add a rental shop the same way I add any other player.
13. As a user, I want to delete a shop-type player, so that I can remove a shop I no longer use (with the same soft-delete behaviour as person players).
14. As a user, I want the Players page to show both sections even when one is empty, so that I understand the concept of player types from first use.

---

## 3. Features & Requirements

### 3.1 Player Type Field

A new `player_type` field on the player entity that can be set at creation and changed afterward.

**Requirements:**

- `player_type` accepts exactly two values: `'person'` and `'shop'`.
- Default value is `'person'` for all new and existing players.
- `player_type` is included in all player API responses (`GET /api/v1/players`, `GET /api/v1/players/:id`).
- `POST /api/v1/players` accepts an optional `player_type` field; omitting it defaults to `'person'`.
- `PUT /api/v1/players/:id` accepts `player_type` as an updatable field.
- The API must reject any value other than `'person'` or `'shop'` with a 400 error.

### 3.2 Players Page — Two-Section Layout

The Players page is split into a People section and a Shops section, each with its own header and add-player control.

**Requirements:**

- Person-type players are listed under a "People" section header.
- Shop-type players are listed under a "Shops" section header.
- Each section has its own inline add-player control that pre-selects the correct type.
- Shop entries display a visual indicator (e.g. a store/shop icon or "Shop" badge) to distinguish them from people.
- Both sections are always visible, even when one is empty — the empty state must include a short label (e.g. "No shops added yet").
- Shop entries are **not clickable** — they have no profile page. Only person-type players link through to `PlayerProfile`.
- Editing a player (name, avatar, type) works the same way for both sections.
- Changing `player_type` via edit moves the player from one section to the other immediately.

### 3.3 Leaderboard Filtering

All competitive surfaces filter out shop-type players.

**Requirements:**

- `GET /api/v1/stats/leaderboard` returns only players where `player_type = 'person'`.
- `GET /api/v1/stats/leaderboard/game/:gameId` returns only players where `player_type = 'person'`.
- The H2H endpoint (`GET /api/v1/stats/head-to-head`) accepts only `player_id` values for person-type players; requests referencing a shop ID return a 400 error.
- The H2H player selection dropdowns on the Leaderboard page list only person-type players.
- The podium on the Leaderboard page never shows a shop-type player.

### 3.4 Session Player Filtering

Shop-type players are not available when building a session's participant list.

**Requirements:**

- The player search/autocomplete dropdown in the Session Logger shows only person-type players.
- The inline "create new player" flow in the Session Logger always creates a `person`-type player (no type selector shown there).
- If a shop-type player somehow exists in a session's saved results (historical data), their result is still displayed in the session detail view — only future selection is blocked.

---

## 4. UI/UX Guidelines

- **Responsiveness:** Match the existing responsive behaviour of the Players page (desktop-first, mobile best-effort).
- **Navigation:** No new nav items — shops are managed from the existing Players page.
- **Destructive actions:** Deleting a shop follows the same confirmation modal as deleting a person player.
- **Empty states:** Both People and Shops sections must show a non-empty descriptive label when empty (not just blank space).
- **Error states:** Type validation errors from the API must surface as a readable toast message.
- **Loading states:** Follow the existing pattern (spinner/skeleton) used on the current Players page.
- **Type indicator:** Use a consistent visual treatment — a small icon (e.g. `Store` from lucide-react) next to shop names, or a muted "Shop" badge. Do not rely on colour alone.
- **Section headers:** Keep them lightweight — same weight and style as other section headers in the app, not a heavy divider.
- **Edit flow:** When editing a player, the type selector should be clearly labelled and placed near the name field. Changing from shop to person (or vice versa) should show no extra confirmation — the move between sections is immediate feedback enough.

---

## 5. Technical Considerations

### 5.1 Stack

| Layer | Technology | Notes |
|---|---|---|
| Backend | Node.js + Express + TypeScript | Existing server, no new dependencies |
| Database | SQLite + Drizzle ORM | New migration to add column |
| Frontend | React 18 + Vite + TypeScript | Existing client |
| UI | shadcn/ui + Tailwind CSS 4 + lucide-react | Use existing component set |

### 5.2 Data Models

#### Player (modified)

The `players` table gains a `player_type` column.

Key fields: `id`, `name`, `avatar_path`, `player_type` (new), `created_at`, `deleted_at`

Relationships: unchanged — games still reference `players.id` via `owner_id`

**Business Logic:**
- `player_type` is a SQLite `TEXT` column with a `NOT NULL` constraint and a `DEFAULT 'person'`.
- The migration must backfill all existing rows to `'person'` before adding the constraint.
- No cascade changes — type only affects query-level filtering, not FK relationships.

### 5.3 Key Constraints & Decisions

- **Backward compatibility:** All existing players become `person` type via migration default — no manual migration step required.
- **No new FK or join table:** `player_type` is a plain column on the existing `players` table.
- **Filtering is query-level only:** Shop players remain in the database and in `session_results` historical data; they are excluded by `WHERE player_type = 'person'` in stat queries and by the frontend in player-selection UIs.
- **Session Logger creates persons only:** The inline create-player shortcut in the Session Logger always sets `player_type = 'person'`; there is no need to expose the type selector there.
- **No new migration for session_results:** Existing session results that reference a shop player are not invalidated; they just won't surface in future stat queries.
- **Deleted shop owner association is preserved:** When a shop is soft-deleted, games that reference it via `owner_id` are left unchanged. The Library query must handle deleted owners gracefully (e.g. omit from filter options but still display the name on the game card).

### 5.4 Modules to Build or Modify

| Module | New / Modify | Notes |
|---|---|---|
| `0004_player_type.sql` | New | Migration: add `player_type TEXT NOT NULL DEFAULT 'person'` to `players` |
| `server/src/db/schema.ts` | Modify | Add `player_type` field to Drizzle player table definition |
| `server/src/routes/players.ts` | Modify | Accept and return `player_type` on create, update, and list routes; validate enum |
| `server/src/routes/stats.ts` | Modify | Filter `player_type = 'person'` in all leaderboard and H2H queries |
| `client/src/pages/Players.tsx` | Modify | Split into People / Shops sections; add type selector to create and edit flows |
| `client/src/pages/SessionLogger.tsx` | Modify | Filter shop-type players out of the player search dropdown |
| `client/src/pages/Leaderboard.tsx` | Modify | Filter shop-type players out of H2H player dropdowns (follows API, may be redundant) |
| `client/src/lib/api.ts` | Modify | Add `player_type` to player typings |

---

## 6. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Migration safety | Backfill must complete without downtime; default value handles all existing rows |
| API response time | No measurable regression — one additional `WHERE` clause on indexed table |
| No data loss | Soft-delete and historical session results are unaffected by the new column |
| Bundle size | No new frontend dependencies; use existing lucide-react icons |

---

## 7. Out of Scope (v4)

- Shop-specific profile page or shop analytics.
- Rental metadata on games (rental dates, return dates, cost).
- Bulk re-typing of players (changing multiple players' types at once).
- Any change to the Library filter UI — the existing owner filter is sufficient.
- Restricting which player types can be set as a game's `owner_id` at the API level.
- Multi-type players (e.g. a person who also runs a shop).
- Hard-delete migration for players — a future version will replace soft-delete with a flow that requires reassigning or cascade-deleting a player's owned games and session results before deletion is allowed.

---

*End of Document*
