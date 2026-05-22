# PRD: Tally — Settings Page

## Context

Tally has no user-configurable preferences today. The theme toggle is buried in the desktop sidebar with no mobile equivalent. Currency, language, and per-user defaults are absent. This PRD adds a Settings page accessible from both desktop (bottom of sidebar, replacing the theme toggle) and mobile (5th tab in the bottom bar). Settings are persisted in a single-row `settings` table in SQLite so they survive browser clears and are consistent across devices.

---

## Decisions Made

| Topic | Decision |
|---|---|
| Settings storage | Single-row `settings` table in SQLite via a new `GET/PUT /api/v1/settings` endpoint |
| Desktop nav | Replace theme toggle button with a Settings nav link (gear icon) at the sidebar bottom |
| Mobile nav | Add Settings as 5th tab in the fixed bottom tab bar |
| Settings UI | Full routed page at `/settings` |
| Default owner scope | Pre-fills the new Owner dropdown on the Add Game form only |
| Language | Toggle stored in DB; actual UI translation deferred to a future task |
| Theme options | Light / Dark / System (system tracks OS via `matchMedia`) |
| Hard reset scope | DB hard-delete all rows + delete all uploaded files + clear localStorage |

---

## Architecture

### DB Changes

**New `settings` table** — single row, seeded on server start if missing:

| Column | Type | Default |
|---|---|---|
| `id` | integer PK, CHECK (id = 1) | 1 (fixed) |
| `currency` | text | `'USD'` |
| `language` | text | `'en'` |
| `default_owner_id` | integer nullable | `NULL` (FK → players.id, SET NULL on delete) |
| `theme` | text | `'system'` |
| `updated_at` | text | `datetime('now')` |

**Migration required for `games` table** — add nullable FK column:

| Column | Type | Notes |
|---|---|---|
| `owner_id` | integer nullable | FK → players.id, SET NULL on delete |

Existing games get `owner_id = NULL`.

**Migration file:** `server/src/db/migrations/0002_settings_and_owner.sql`

---

### Server Changes

**New file: `server/src/routes/settings.ts`**

| Endpoint | Behaviour |
|---|---|
| `GET /api/v1/settings` | Return single settings row; seed row with defaults if it doesn't exist yet |
| `PUT /api/v1/settings` | Partial update; returns updated row |
| `POST /api/v1/reset` | Hard-delete all rows from all tables (order below), delete all uploaded files, re-seed settings with defaults. Returns `204`. |

Hard-delete order for reset (respects FK constraints):
1. `settings` — must go first so `default_owner_id` FK is cleared before players are deleted
2. `session_results`
3. `sessions`
4. `game_attachments`
5. `games`
6. `players`
7. Re-seed `settings` with defaults

File deletion scope: everything under `DATA_DIR/covers/`, `DATA_DIR/avatars/`, `DATA_DIR/attachments/`.

**`server/src/index.ts`** — register new router:
```
app.use('/api/v1/settings', settingsRouter)
```

---

### Client Changes

| File | Change |
|---|---|
| `client/src/lib/api.ts` | Add `settings` namespace: `get()`, `update(patch)`, `reset()` |
| `client/src/contexts/SettingsContext.tsx` | New — fetches settings on mount, exposes `{ settings, updateSetting, isLoading }` |
| `client/src/hooks/useTheme.ts` | Refactor to read theme from `SettingsContext` instead of `localStorage`; add `system` support via `matchMedia` |
| `client/src/pages/Settings.tsx` | New settings page (see spec below) |
| `client/src/App.tsx` | Wrap with `<SettingsProvider>`, add `<Route path='settings' element={<Settings />} />` |
| `client/src/components/Layout.tsx` | Desktop: replace theme toggle button with Settings `<NavLink>`; Mobile: add Settings as 5th tab |
| `client/src/pages/GameForm.tsx` | Add Owner dropdown field; pre-fill from `settings.default_owner_id` on new-game forms |

---

## Feature Specifications

### 1. Navigation

**Desktop (`≥ md`):**
- Remove the current theme toggle `<button>` from the sidebar bottom section.
- Replace it with a `<NavLink to='/settings'>` styled identically to the other nav links, using `Settings` (gear) icon from `lucide-react`.

**Mobile (`< md`):**
- Add a 5th `<NavLink to='/settings'>` tab to the bottom bar. Each tab becomes 20% width (`flex-1` already handles this).
- Icon: `Settings` from `lucide-react`. Label: "Settings".

---

### 2. Settings Page (`/settings`)

Single-column layout, `max-w-xl`, consistent with other pages (`p-4 md:p-8`).

**Section: Preferences**

| Setting | Control | Values |
|---|---|---|
| Language | Segmented control / radio group | English (en) · Português (pt) |
| Currency | Segmented control / radio group | USD · BRL |
| Default owner | Combobox / select | None + all non-deleted players by name |

- Changes call `PUT /api/v1/settings` immediately (no explicit Save button).

**Section: Appearance**

| Setting | Control | Values |
|---|---|---|
| Theme | 3-way toggle (or radio group) | Light · Dark · System |

- System option reads `window.matchMedia('(prefers-color-scheme: dark)')` and also attaches a `change` listener so the UI updates if the OS theme changes while the app is open.

**Section: Danger Zone**

- A red/destructive bordered card.
- "Delete all data" `<button>` with destructive styling.
- Clicking it opens a confirmation modal (see spec below).

---

### 3. Delete All Data — Confirmation Flow

1. Modal opens with title: **"Delete all data?"**
2. Body copy: *"This will permanently delete all games, sessions, players, and uploaded files. This action cannot be undone."*
3. A text input: `placeholder="Type DELETE to confirm"`
4. Confirm button ("Delete everything") is **disabled** until input value === `'DELETE'` (case-sensitive).
5. On confirm:
   - Call `POST /api/v1/reset`
   - On 204: clear `localStorage` entirely, then navigate to `/home`
   - Show sonner toast: *"All data has been deleted."*
6. Dismiss button cancels without action.

---

### 4. Theme — System Mode Detail

Current `useTheme` hook: two states (`light | dark`), stored in `localStorage`.

New behaviour:
- Three states: `'light' | 'dark' | 'system'`
- Stored in `settings.theme` via `SettingsContext`
- Resolved theme (what class gets applied to `<html>`):
  - `'light'` → remove `dark` class
  - `'dark'` → add `dark` class
  - `'system'` → match `window.matchMedia('(prefers-color-scheme: dark)').matches`
- Add `addEventListener('change', ...)` on the media query when `system` is active; remove it when switching away.

---

### 5. Currency — Display Behaviour

- `settings.currency` is consumed via `useSettings()` wherever prices are displayed.
- Use `Intl.NumberFormat` for formatting:
  - USD: `en-US`, currency `USD` → `$49.99`
  - BRL: `pt-BR`, currency `BRL` → `R$ 49,99`
- Locations affected: Library game cards (if price shown), GameDetail price field, GameForm price input placeholder/label.
- The stored price value in the DB is unchanged — only display formatting changes.

---

### 6. Default Owner — Game Form Behaviour

- `GameForm.tsx` reads `settings.default_owner_id` via `useSettings()`.
- A new **Owner** field (player select, optional) is added to the form, above Purchase Date.
- On new-game forms: `owner_id` is pre-filled with `settings.default_owner_id` if set; user can override.
- On edit forms: `owner_id` is loaded from the existing game record.
- `games` table gains `owner_id` (nullable FK); `GET /api/v1/games/:id` and `GET /api/v1/games` return it.

---

## Holes / Deferred Decisions

1. **Language translations** — the toggle is wired and persisted but no strings are translated in this version. A follow-up task will add `react-i18next` and translation files.
2. **Currency display audit** — implementation should grep for all `price` usages to ensure no display location is missed.
3. **Owner FK integrity** — if a player is currently set as `default_owner_id`, their delete action must be disabled in the UI (button greyed out / not rendered). The player can still be renamed. No backend enforcement is required beyond this UI guard.
4. **5-tab bottom bar on small phones** — five tabs at ~64px each on a 320px screen is acceptable for now; revisit if label text truncates.
5. **Settings seeding race** — use `INSERT OR IGNORE` so existing rows are never overwritten on server restart.

---

## Out of Scope

- Multi-user support (settings are app-wide, not per-user)
- Language translations (deferred)
- Settings import / export / backup
- Per-game ownership history or transfer
- Tablet-specific layout changes

---

## Verification

| Step | Expected result |
|---|---|
| Navigate to `/settings` | Page renders with all three sections |
| Change currency to BRL, refresh page | BRL persists; prices display as `R$ X,XX` |
| Set theme to System; toggle OS dark mode | App follows OS without page reload |
| Set default owner to a player; open Add Game | Owner dropdown is pre-filled |
| Click Delete all data, type `DELE` | Confirm button stays disabled |
| Type `DELETE`, confirm | All data gone, redirected to `/home`, toast shown |
| Check `DATA_DIR` on server | `covers/`, `avatars/`, `attachments/` are empty |
