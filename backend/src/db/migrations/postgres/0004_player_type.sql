-- Postgres twin of sqlite/0004_player_type.sql.
--
-- Same net effect: drop UNIQUE(name) and add a checked player_type. SQLite had
-- to rebuild the whole table because it cannot drop a constraint; Postgres does
-- it directly, so this is deliberately not a line-by-line translation.

ALTER TABLE players DROP CONSTRAINT IF EXISTS players_name_key;

ALTER TABLE players ADD COLUMN IF NOT EXISTS player_type TEXT NOT NULL DEFAULT 'person';

ALTER TABLE players DROP CONSTRAINT IF EXISTS players_player_type_check;
ALTER TABLE players ADD CONSTRAINT players_player_type_check CHECK (player_type IN ('person', 'shop'));

-- SQLite's rebuild also switched created_at to ISO-8601 with milliseconds.
ALTER TABLE players ALTER COLUMN created_at SET DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"');

CREATE INDEX IF NOT EXISTS idx_players_deleted_at ON players (deleted_at);
