# ERD: Tally — Settings + Owner (v2)

> Schema after migration `0002_settings_and_owner.sql`.  
> All timestamps are stored as ISO-8601 text.  
> Soft deletes use `deleted_at IS NULL` as the "active" filter.

---

## Tables

### `games`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | INTEGER | PK AUTOINCREMENT | |
| `name` | TEXT | NOT NULL | |
| `description` | TEXT | | |
| `quick_rules` | TEXT | | |
| `min_players` | INTEGER | | |
| `max_players` | INTEGER | | |
| `purchase_at` | TEXT | | ISO-8601 date |
| `price` | REAL | | |
| `cover_image_path` | TEXT | | relative path under DATA_DIR/covers/ |
| `owner_id` | INTEGER | FK → players.id, nullable | SET NULL only during hard reset; soft-deleted players remain referenced |
| `created_at` | TEXT | NOT NULL, DEFAULT datetime('now') | |
| `updated_at` | TEXT | NOT NULL, DEFAULT datetime('now') | |
| `deleted_at` | TEXT | | NULL = active |

---

### `game_attachments`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | INTEGER | PK AUTOINCREMENT | |
| `game_id` | INTEGER | NOT NULL, FK → games.id | |
| `label` | TEXT | NOT NULL | |
| `file_path` | TEXT | NOT NULL | relative path under DATA_DIR/attachments/ |
| `created_at` | TEXT | NOT NULL, DEFAULT datetime('now') | |
| `deleted_at` | TEXT | | NULL = active |

---

### `players`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | INTEGER | PK AUTOINCREMENT | |
| `name` | TEXT | NOT NULL, UNIQUE | |
| `avatar_path` | TEXT | | relative path under DATA_DIR/avatars/ |
| `created_at` | TEXT | NOT NULL, DEFAULT datetime('now') | |
| `deleted_at` | TEXT | | NULL = active |

---

### `sessions`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | INTEGER | PK AUTOINCREMENT | |
| `game_id` | INTEGER | NOT NULL, FK → games.id | |
| `played_at` | TEXT | NOT NULL | ISO-8601 datetime |
| `notes` | TEXT | | |
| `created_at` | TEXT | NOT NULL, DEFAULT datetime('now') | |
| `deleted_at` | TEXT | | NULL = active |

---

### `session_results`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | INTEGER | PK AUTOINCREMENT | |
| `session_id` | INTEGER | NOT NULL, FK → sessions.id | |
| `player_id` | INTEGER | NOT NULL, FK → players.id | |
| `rank` | INTEGER | NOT NULL | 1 = first place |
| `points_awarded` | INTEGER | NOT NULL | |
| `deleted_at` | TEXT | | NULL = active |

---

### `settings` *(new)*

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | INTEGER | PK, CHECK (id = 1) | Single-row sentinel |
| `currency` | TEXT | NOT NULL, DEFAULT 'USD' | 'USD' or 'BRL' |
| `language` | TEXT | NOT NULL, DEFAULT 'en' | 'en' or 'pt' |
| `default_owner_id` | INTEGER | FK → players.id, nullable | SET NULL only during hard reset; UI prevents soft-deleting this player |
| `theme` | TEXT | NOT NULL, DEFAULT 'system' | 'light', 'dark', or 'system' |
| `updated_at` | TEXT | NOT NULL, DEFAULT datetime('now') | Updated by app on every PUT |

---

## Relationships

| From | Column | To | Cardinality | On hard delete |
|---|---|---|---|---|
| `game_attachments` | `game_id` | `games.id` | Many-to-one | Attachments deleted before games in reset |
| `sessions` | `game_id` | `games.id` | Many-to-one | Sessions deleted before games in reset |
| `session_results` | `session_id` | `sessions.id` | Many-to-one | Results deleted before sessions in reset |
| `session_results` | `player_id` | `players.id` | Many-to-one | Results deleted before players in reset |
| `games` | `owner_id` | `players.id` | Many-to-one (nullable) | Games deleted before players in reset; soft-delete leaves reference intact |
| `settings` | `default_owner_id` | `players.id` | One-to-one (nullable) | Settings deleted **first** in reset so players can be deleted cleanly |

---

## Indexes

| Index name | Table | Column(s) | Purpose |
|---|---|---|---|
| `idx_games_deleted_at` | `games` | `deleted_at` | Active-game filter |
| `idx_attachments_game_id` | `game_attachments` | `game_id` | Attachment lookup by game |
| `idx_sessions_game_id` | `sessions` | `game_id` | Session lookup by game |
| `idx_results_session_id` | `session_results` | `session_id` | Result lookup by session |
| `idx_results_player_id` | `session_results` | `player_id` | Result lookup by player |
| `idx_games_owner_id` *(new)* | `games` | `owner_id` | Owner-scoped game queries |

---

## Migration: `0002_settings_and_owner.sql`

```sql
-- Add owner to games
ALTER TABLE games ADD COLUMN owner_id INTEGER REFERENCES players(id);
CREATE INDEX IF NOT EXISTS idx_games_owner_id ON games(owner_id);

-- Create settings table (single row)
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  currency TEXT NOT NULL DEFAULT 'USD',
  language TEXT NOT NULL DEFAULT 'en',
  default_owner_id INTEGER REFERENCES players(id),
  theme TEXT NOT NULL DEFAULT 'system',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Seed default row (INSERT OR IGNORE so server restarts never overwrite)
INSERT OR IGNORE INTO settings (id) VALUES (1);
```

---

## Hard Reset — Delete Order

Revised from PRD (settings deleted **first** to avoid FK conflict when deleting players):

1. `settings` — clears `default_owner_id` FK reference before players are removed
2. `session_results`
3. `sessions`
4. `game_attachments`
5. `games`
6. `players`
7. Re-seed `settings` with defaults

---

## Soft Delete — Owner Display Rules

| Scenario | `games.owner_id` | UI display |
|---|---|---|
| Player is active | Points to valid player | Player name |
| Player is soft-deleted | Still points to deleted player | "Deleted player" (greyed) |
| No owner set | NULL | — (empty) |
| `default_owner_id` player | Active (UI prevents delete) | Player name in Settings |
