# Product Requirements Document
## BGG Data Import & Game Autocomplete

**Version:** v5
**Status:** Draft
**Last Updated:** 2026-05-06

---

## 1. Overview

### 1.1 Product Summary

Tally is a self-hosted, single-user board game manager. Currently, users must type all game data manually when adding games to their library. This iteration adds BoardGameGeek (BGG) catalog data — imported via a local CSV file — to power name autocomplete on the game form, reducing friction and improving data consistency for common games.

### 1.2 Goals

- Let users seed the app with BGG catalog data once (or update it periodically) via a CSV file downloaded from BGG's public data dump.
- Provide name autocomplete on the Add Game form so users can quickly find and pre-fill a game's name and publication year from the BGG dataset.
- Keep BGG data and library data cleanly separated — BGG is a lookup source only; once a game is added to the library its data is fully owned by Tally.

### 1.3 Non-Goals

- No live BGG API calls — the app is designed for offline / home-lab use.
- No syncing BGG ratings, descriptions, images, or category tags into the library.
- No ongoing automatic updates to the BGG dataset — this is a manual, user-driven import.
- No referential integrity between `bgg_games` and `games` — bgg_id on a library game is informational only.
- No deduplication or merge logic on import — re-importing always replaces all BGG data.

---

## 2. User Stories

1. As a user, I want to download the BGG data dump CSV from the BGG website and upload it in Settings, so that my app has a catalog of board games to draw from.
2. As a user, I want to see when my BGG dataset was last updated in Settings, so that I know whether I'm working from stale data.
3. As a user, I want to type a game name in the Add Game form and see matching BGG suggestions appear, so that I can quickly fill in the name without typing it in full.
4. As a user, I want selecting a BGG suggestion to auto-fill the game name and publication year, so that I don't have to look these up manually.
5. As a user, I want to still type the game name manually without selecting a BGG suggestion, so that I can log games that aren't in the BGG dataset.
6. As a user, I want to edit the auto-filled name and year after selecting a BGG suggestion, so that I can correct or personalise the data before saving.
7. As a user, I want a confirmation dialog before deleting all BGG data, so that I don't accidentally wipe the catalog.
8. As a user, I want to delete all BGG data from Settings, so that I can start fresh before importing a new CSV or free up space.
9. As a user, I want the app to show a success or error toast after a CSV import, so that I know whether the import succeeded without having to check anything else.
10. As a user, I want the BGG data upload to replace the existing catalog entirely, so that I always have a clean, consistent dataset after each import.
11. As a user, I want the year_published field to be visible and editable on the game form regardless of whether a BGG game was selected, so that I can record publication year for games I add manually.
12. As a user, I want the autocomplete to work even if I type only part of a game's name, so that I can find games without knowing the exact full title.
13. As a user, I want the autocomplete to show the publication year alongside each suggestion, so that I can distinguish between editions or games with similar names.
14. As a user, I want the library game's name, year, and bgg_id to remain unchanged if I later delete or update the BGG dataset, so that my library data is stable and self-contained.
15. As a user, I want the "last updated" timestamp to be cleared when I delete all BGG data, so that the Settings page accurately reflects that no dataset is loaded.

---

## 3. Features & Requirements

### 3.1 BGG CSV Import

A new section in Settings that lets users upload the BGG data dump CSV and tracks when it was last imported.

**Requirements:**

- Display a "BGG Data" section in the Settings page, below the existing general settings and above the Danger Zone.
- The section shows a file input (accept `.csv` only) and an "Import" button.
- On submit, the file is sent to `POST /api/v1/bgg/import` as multipart form data.
- The server parses only the `id`, `name`, and `yearpublished` columns from the CSV; all other columns are ignored.
- Rows where `name` is empty or `id` is not a valid integer are skipped silently.
- The import performs a full replace: existing `bgg_games` rows are deleted, then the new rows are bulk-inserted in a single transaction.
- On success, `settings.bgg_last_updated` is set to the current UTC timestamp.
- The server returns a response including the count of games imported.
- The client shows a success toast: "BGG data updated — N games imported."
- On failure (parse error, DB error), the server returns an error and the client shows an error toast with a human-readable message.
- After a successful import, the "Last updated" timestamp in the UI updates without a page reload.

### 3.2 BGG Attribution

BGG requires that all uses of their data credit BoardGameGeek by name as the source. The app's source code is public, so attribution must appear in the UI — not just in documentation.

**Requirements:**

- The BGG section in Settings must include a line crediting BGG: e.g. "Game data provided by [BoardGameGeek](https://boardgamegeek.com)" as a visible, persistent note (not hidden behind the import flow).
- The README must include a brief note that BGG data is optional, user-imported, and subject to BGG's Terms of Use, with a link to https://boardgamegeek.com/terms.
- Display the "Powered by BGG" logo in the BGG settings section, linked to https://boardgamegeek.com/. The logo must be large enough for the text to be legible (per BGG's guidelines). Logo assets should be downloaded from the BGG logos page and bundled with the client.
- Attribution must not be removed if the user deletes the BGG dataset — the credit is for the data source, not conditional on data being present.

### 3.3 BGG Last Updated Display

Show the import timestamp in the BGG settings section so users know how fresh their data is.

**Requirements:**

- If `settings.bgg_last_updated` is null (no import yet), show: "No BGG data loaded."
- If a timestamp exists, show: "Last updated: [formatted date and time]."
- Use the app's existing locale settings for date formatting.

### 3.4 Delete BGG Data

Let users wipe the entire BGG catalog from Settings.

**Requirements:**

- A "Delete BGG Data" button in the BGG section, styled as a destructive action (consistent with the existing Danger Zone button style).
- Clicking triggers a confirmation dialog (consistent with the existing "Delete all data" confirmation pattern).
- On confirm, calls `DELETE /api/v1/bgg`.
- The server truncates `bgg_games` and sets `settings.bgg_last_updated` to null.
- The client shows a success toast: "BGG data deleted."
- The UI "Last updated" line reverts to "No BGG data loaded." without a page reload.

### 3.5 Game Form Autocomplete

Replace the plain text name input on the Add/Edit Game form with a combobox that queries the BGG catalog as the user types.

**Requirements:**

- The name field on `GameForm` becomes a combobox/autocomplete input.
- Autocomplete is triggered after the user types at least 2 characters.
- The client calls `GET /api/v1/bgg/search?q={query}` (debounced, ~300ms).
- The endpoint performs a case-insensitive `LIKE '%query%'` search on `bgg_games.name` and returns up to 10 results, each with `bgg_id`, `name`, and `year_published`.
- Each suggestion in the dropdown shows the game name and publication year (e.g. "Brass: Birmingham (2018)").
- Selecting a suggestion fills the name field with the BGG name, fills the year_published field with the BGG year, and stores the bgg_id on the form state (submitted to the server, not shown to the user).
- The user can type freely without selecting a suggestion — the name field remains a free-text input if no suggestion is chosen.
- The user can edit the auto-filled name and year after selection.
- If the BGG dataset is empty (no rows in `bgg_games`), the autocomplete returns no suggestions and the field behaves as a plain text input; no error is shown.
- The autocomplete is active on the name field on both the Add Game and Edit Game forms; no other game form field changes.

### 3.6 Year Published Field

Add a new visible, editable year field to the game form and game detail view.

**Requirements:**

- Add a `year_published` (nullable integer) field to the `games` table via migration.
- Show a "Year Published" input (number type) on `GameForm`, below the name field.
- The field is optional — users can leave it blank.
- When populated via BGG autocomplete, the field is pre-filled but remains editable.
- When a game has a year, display it on the game detail page. It is not shown on the library grid cards.
- The year is passed to `POST /api/v1/games` and `PUT /api/v1/games/:id` and persisted.

---

## 4. UI/UX Guidelines

- **Responsiveness:** Consistent with the existing app — mobile-first, md: breakpoints.
- **Navigation:** BGG section lives in Settings, no new top-level navigation needed.
- **Destructive actions:** The "Delete BGG Data" button must trigger a confirmation dialog before executing, consistent with the existing Danger Zone pattern.
- **Empty states:** If no BGG data is loaded, the autocomplete shows no dropdown and the field behaves as plain text — no error or warning shown inline.
- **Error states:** Import and delete failures show a toast with a human-readable message, not a blank screen or raw error.
- **Loading states:** Import button shows a disabled/loading state while the upload is in progress. Autocomplete shows a subtle loading indicator while the search request is in-flight.
- **Autocomplete UX:** Year is shown in the dropdown item to help users distinguish editions. Free-text entry is always permitted — selecting from the list is optional.
- **Toast copy:** Keep toast messages consistent with the existing style (short, sentence-case, no trailing period inconsistency — match what already exists in the app).

---

## 5. Technical Considerations

### 5.1 Stack

| Layer | Technology | Notes |
|---|---|---|
| Backend | Express.js + TypeScript | New BGG router added alongside existing routers |
| Database | SQLite + Drizzle ORM | New `bgg_games` table + migrations for `games` and `settings` |
| File upload | Multer | Already in use for covers/attachments/avatars — reuse for CSV |
| CSV parsing | Node.js built-in or lightweight lib | No large dependency; `csv-parse` or manual line splitting acceptable |
| Frontend | React 18 + Vite + TypeScript | Modify GameForm.tsx and Settings.tsx |
| UI Components | shadcn/ui + Tailwind CSS 4.2 | Use existing Combobox or Command component for autocomplete |

### 5.2 Data Models

#### bgg_games (new table)

Lightweight BGG catalog used exclusively for autocomplete. Data is sourced from the BGG data dump CSV.

Key fields: `bgg_id` (integer, primary key — the BGG game ID), `name` (text, not null), `year_published` (integer, nullable)

Relationships: none — standalone lookup table, no foreign keys to or from other tables.

#### games (modified)

Two new nullable fields added via migration.

Key fields added: `bgg_id` (integer, nullable — the BGG ID of the game this was created from, informational only), `year_published` (integer, nullable)

Relationships: `bgg_id` is not a foreign key — BGG data can be deleted without affecting library games.

#### settings (modified)

One new nullable field added via migration.

Key fields added: `bgg_last_updated` (text/timestamp, nullable — ISO 8601 UTC timestamp of the last successful BGG import)

### 5.3 Key Constraints & Decisions

- **No foreign key between `games.bgg_id` and `bgg_games.bgg_id`** — BGG data is ephemeral (user can wipe it); library game records must remain stable.
- **Full replace on import** — No merge/upsert logic. Delete all rows, insert new rows in a single transaction. This keeps the import simple and guarantees consistency.
- **Only 3 columns stored from BGG CSV** — `id`, `name`, `yearpublished`. All other columns (ranks, averages, expansion flags, category ranks) are ignored to keep the table small.
- **Autocomplete is additive, not mandatory** — The name field must remain a plain text input for users who don't have BGG data loaded or whose game isn't in the dataset.
- **bgg_id on games is informational** — It is stored for potential future use (e.g. fetching box art) but has no current functional role beyond traceability.
- **CSV upload size** — The BGG data dump is ~100k rows. The import runs server-side in a single transaction; no streaming or chunked progress is required for v5.
- **Search uses LIKE, not FTS** — For ~100k rows with a 2-character minimum trigger and a 10-result cap, a `LIKE '%query%'` with an index on `name` is sufficient. Full-text search can be considered in a later version if performance is an issue.

### 5.4 Modules to Build or Modify

| Module | New / Modify | Notes |
|---|---|---|
| `bgg_games` DB table + migration | New | `bgg_id` PK, `name`, `year_published`; index on `name` for LIKE search |
| `games` table migration | Modify | Add `bgg_id` (nullable int) and `year_published` (nullable int) |
| `settings` table migration | Modify | Add `bgg_last_updated` (nullable text) |
| BGG router (`/api/v1/bgg`) | New | Three endpoints: import, delete, search |
| Settings page (`Settings.tsx`) | Modify | New BGG section: upload, last-updated display, delete button |
| GameForm (`GameForm.tsx`) | Modify | Name field → combobox; add year_published field |
| API client (`api.ts`) | Modify | Add typed wrappers for the three new BGG endpoints |

---

## 6. Non-Functional Requirements

| Requirement | Target |
|---|---|
| CSV import time | < 10s for the full ~100k-row BGG dump on typical home-lab hardware |
| Autocomplete response time | < 200ms p95 for a LIKE search with a name index on ~100k rows |
| CSV file size limit | 50 MB (the current BGG dump is ~15 MB; this gives headroom for growth) |
| Import atomicity | Full replace runs in a single SQLite transaction — partial imports must not be possible |
| Library data stability | Deleting or replacing BGG data must never modify or delete existing `games` rows |

---

## 7. Out of Scope (v5)

- Fetching any data from the BGG XML API (live lookups, box art, descriptions, ratings).
- Importing BGG expansion flag or category rank columns into Tally.
- Showing BGG ratings, average scores, or user counts anywhere in the UI.
- Automatic / scheduled BGG dataset updates.
- Searching the BGG dataset from anywhere other than the Add/Edit Game form name field.
- Full-text search (FTS5) on `bgg_games` — LIKE with an index is sufficient for v5.
- Per-game linking back to the BGG website.
- Migrating or enriching existing library games with BGG IDs retroactively.

---

## 8. Open Questions

| # | Question | Owner | Status |
|---|---|---|---|
| 1 | Is a name index on `bgg_games` sufficient, or does the import volume warrant WAL mode or other SQLite tuning? | Engineering | Open |

---

*End of Document*
