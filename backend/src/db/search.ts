import { like, ilike, type SQL, type Column } from 'drizzle-orm'
import { dialect } from './index'

/**
 * Case-insensitive substring match, on both dialects.
 *
 * SQLite's LIKE is case-insensitive for ASCII; Postgres's is case-sensitive.
 * A bare `like()` therefore *silently* changes search behaviour for Postgres
 * users — searching "catan" would stop matching "Catan" with no error anywhere.
 *
 * Verified against Postgres 17: `LIKE '%catan%'` matches 0 rows against 'Catan',
 * `ILIKE` matches 1.
 *
 * Always use this for user-facing text search. Never a bare `like()`.
 */
export function searchLike(column: Column, term: string): SQL {
  const pattern = `%${term}%`

  return dialect === 'postgres' ? ilike(column, pattern) : like(column, pattern)
}
