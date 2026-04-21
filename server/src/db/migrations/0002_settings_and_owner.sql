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
