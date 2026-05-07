-- ============================================================
-- 0004_player_type.sql
-- Changes:
--   1. Remove UNIQUE(name) from players
--   2. Add player_type TEXT NOT NULL DEFAULT 'person'
--      CHECK (player_type IN ('person','shop'))
-- ============================================================

-- Must disable FK enforcement before dropping the old table.
-- Other tables (games, session_results, settings) reference players.id.
-- SQLite enforces FKs at statement level, not transaction level,
-- so this pragma must come BEFORE the transaction.
PRAGMA foreign_keys = OFF;

BEGIN;

-- Step 1: Create the replacement table.
CREATE TABLE players_new (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    avatar_path TEXT,
    player_type TEXT    NOT NULL
                        DEFAULT 'person'
                        CHECK (player_type IN ('person', 'shop')),
    created_at  TEXT    NOT NULL
                        DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    deleted_at  TEXT
);

-- Step 2: Copy every row; all existing players backfilled as 'person'.
INSERT INTO players_new (id, name, avatar_path, player_type, created_at, deleted_at)
SELECT                   id, name, avatar_path, 'person',    created_at, deleted_at
FROM players;

-- Step 3: Drop the old table.
DROP TABLE players;

-- Step 5: Rename the new table into place.
ALTER TABLE players_new RENAME TO players;

-- Step 6: Fix sqlite_sequence so AUTOINCREMENT continues from the correct value.
UPDATE sqlite_sequence SET name = 'players' WHERE name = 'players_new';

-- Step 7: Recreate indexes.
CREATE INDEX IF NOT EXISTS idx_players_deleted_at ON players (deleted_at);

COMMIT;

-- Re-enable FK enforcement.
PRAGMA foreign_keys = ON;
