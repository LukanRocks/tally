-- ============================================================
-- 0005_bgg.sql
-- Changes:
--   1. New bgg_games table (lookup only, no FK to games)
--   2. Add bgg_id and year_published to games
--   3. Add bgg_last_updated to settings
-- ============================================================

BEGIN;

-- 1. BGG catalog lookup table
CREATE TABLE IF NOT EXISTS bgg_games (
    bgg_id         INTEGER PRIMARY KEY,
    name           TEXT    NOT NULL,
    year_published INTEGER
);

CREATE INDEX IF NOT EXISTS idx_bgg_games_name ON bgg_games (name);

-- 2. games: two new nullable columns
ALTER TABLE games ADD COLUMN bgg_id         INTEGER;
ALTER TABLE games ADD COLUMN year_published INTEGER;

-- 3. settings: last import timestamp
ALTER TABLE settings ADD COLUMN bgg_last_updated TEXT;

COMMIT;
