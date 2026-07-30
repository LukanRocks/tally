-- Postgres twin of sqlite/0006_tally_meta.sql.
--
-- Provenance marker for the SQLite -> Postgres import. Row-counting alone cannot
-- decide whether an import already happened: a user who migrates and then
-- deletes all their data would be re-prompted forever.
CREATE TABLE IF NOT EXISTS _tally_meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
