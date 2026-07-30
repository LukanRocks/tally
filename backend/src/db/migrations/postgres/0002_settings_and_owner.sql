-- Postgres twin of sqlite/0002_settings_and_owner.sql.

ALTER TABLE games ADD COLUMN IF NOT EXISTS owner_id INTEGER REFERENCES players(id);
CREATE INDEX IF NOT EXISTS idx_games_owner_id ON games(owner_id);

CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  currency TEXT NOT NULL DEFAULT 'USD',
  language TEXT NOT NULL DEFAULT 'en',
  default_owner_id INTEGER REFERENCES players(id),
  theme TEXT NOT NULL DEFAULT 'system',
  updated_at TEXT NOT NULL DEFAULT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS')
);

-- ON CONFLICT DO NOTHING is the Postgres form of INSERT OR IGNORE, so restarts
-- never overwrite an existing settings row.
INSERT INTO settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
