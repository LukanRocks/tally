import { db, sqlite } from './index'

/**
 * Dialect-portable transactions.
 *
 * Drizzle's `db.transaction()` is not portable: better-sqlite3 requires a
 * *synchronous* callback (an async one returns a promise before its body runs,
 * so the driver would COMMIT before the work happened — it refuses outright with
 * "Transaction function cannot return a promise"), while node-postgres requires
 * an *async* one because every query is real network I/O.
 *
 * Route code needs one shape. So for SQLite we drive BEGIN/COMMIT/ROLLBACK
 * ourselves instead of delegating to better-sqlite3's transaction() wrapper,
 * which lets the callback be async. Postgres will delegate to db.transaction()
 * directly once that dialect exists (Phase 3).
 */

// Drizzle's better-sqlite3 client. Phase 3 widens this to the resolved dialect.
type Db = typeof db

/**
 * Serializes SQLite transactions. Without this, two concurrent requests could
 * both issue BEGIN and SQLite would error on the nested one — better-sqlite3's
 * own transaction() gets this for free by blocking the thread, which we give up
 * the moment we allow awaits inside the callback.
 */
let tail: Promise<unknown> = Promise.resolve()

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  // Chain onto the tail, but never let a rejection break the chain for the
  // next caller — settle the link regardless of how this task ends.
  const result = tail.then(task, task)
  tail = result.then(
    () => undefined,
    () => undefined,
  )
  return result
}

/**
 * Runs `fn` inside a transaction, committing on resolve and rolling back on
 * throw. The callback receives the same query interface used outside a
 * transaction, so route code reads identically on both dialects.
 *
 * Caveat worth knowing: each `await` inside `fn` yields to the microtask queue,
 * so a non-transactional write issued by another in-flight request can land
 * between BEGIN and COMMIT and be rolled back along with a failing transaction.
 * Acceptable for a single-user deployment with short transactions; the queue
 * above prevents the far more likely case of two transactions colliding.
 */
export async function withTransaction<T>(fn: (tx: Db) => Promise<T>): Promise<T> {
  return enqueue(async () => {
    sqlite.exec('BEGIN')

    try {
      const result = await fn(db)
      sqlite.exec('COMMIT')
      return result
    } catch (err) {
      // A failed BEGIN leaves no transaction open, so guard the rollback rather
      // than masking the original error with "no transaction is active".
      if (sqlite.inTransaction) sqlite.exec('ROLLBACK')
      throw err
    }
  })
}
