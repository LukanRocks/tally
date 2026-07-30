-- Postgres twin of sqlite/0003_onboarding.sql.
-- SQLite stores this as INTEGER 0/1; Postgres uses a real boolean. The importer
-- coerces 0/1 -> false/true when migrating existing SQLite data.

ALTER TABLE settings ADD COLUMN IF NOT EXISTS onboarded BOOLEAN NOT NULL DEFAULT FALSE;
