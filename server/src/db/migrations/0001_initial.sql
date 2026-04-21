CREATE TABLE IF NOT EXISTS games (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  quick_rules TEXT,
  min_players INTEGER,
  max_players INTEGER,
  purchase_at TEXT,
  price REAL,
  cover_image_path TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS game_attachments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id INTEGER NOT NULL REFERENCES games(id),
  label TEXT NOT NULL,
  file_path TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  avatar_path TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id INTEGER NOT NULL REFERENCES games(id),
  played_at TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS session_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL REFERENCES sessions(id),
  player_id INTEGER NOT NULL REFERENCES players(id),
  rank INTEGER NOT NULL,
  points_awarded INTEGER NOT NULL,
  deleted_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_games_deleted_at ON games(deleted_at);
CREATE INDEX IF NOT EXISTS idx_attachments_game_id ON game_attachments(game_id);
CREATE INDEX IF NOT EXISTS idx_sessions_game_id ON sessions(game_id);
CREATE INDEX IF NOT EXISTS idx_results_session_id ON session_results(session_id);
CREATE INDEX IF NOT EXISTS idx_results_player_id ON session_results(player_id);
