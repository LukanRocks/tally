import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { readFileSync, readdirSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'
import * as schema from './schema'

export const DATA_DIR = process.env.DATA_DIR ?? join(process.cwd(), 'data')

if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true })
}

export const sqlite = new Database(join(DATA_DIR, 'tally.db'))
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('foreign_keys = ON')

export const db = drizzle(sqlite, { schema })

export function runMigrations(): void {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)

  const applied = new Set<string>((sqlite.prepare('SELECT name FROM _migrations').all() as { name: string }[]).map((row) => row.name))

  const migrationsDir = join(__dirname, 'migrations')

  const files = readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort()

  for (const file of files) {
    if (!applied.has(file)) {
      const sql = readFileSync(join(migrationsDir, file), 'utf-8')

      sqlite.exec(sql)
      sqlite.prepare('INSERT INTO _migrations (name) VALUES (?)').run(file)

      console.log(`Applied migration: ${file}`)
    }
  }
}
