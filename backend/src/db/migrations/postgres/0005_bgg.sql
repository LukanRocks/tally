-- Postgres twin of sqlite/0005_bgg.sql.

CREATE TABLE IF NOT EXISTS bgg_games (
    bgg_id         INTEGER PRIMARY KEY,
    name           TEXT    NOT NULL,
    year_published INTEGER
);

CREATE INDEX IF NOT EXISTS idx_bgg_games_name ON bgg_games (name);

ALTER TABLE games ADD COLUMN IF NOT EXISTS bgg_id         INTEGER;
ALTER TABLE games ADD COLUMN IF NOT EXISTS year_published INTEGER;

ALTER TABLE settings ADD COLUMN IF NOT EXISTS bgg_last_updated TEXT;
