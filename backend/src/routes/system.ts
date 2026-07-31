import { Router, Request, Response } from 'express'
import { dialect } from '../db'
import { getState, getSourceCounts, getLastError, setLastError } from '../db/state'
import { importFromSqlite } from '../db/import-sqlite'
import { helpUrl } from '../help-links'

const router = Router()

// GET /api/v1/system/db-status
router.get('/db-status', (_req: Request, res: Response) => {
  const state = getState()

  res.json({
    state,
    dialect,
    source: getSourceCounts(),
    lastError: getLastError(),
    // Every other payload describing a blocked state carries its documentation
    // link; this one was the exception, so a client reading it directly had
    // nowhere to send the user. The gate's 503 says the same thing.
    ...(state === 'PENDING_IMPORT' ? { docsUrl: helpUrl('migration') } : {}),
  })
})

// POST /api/v1/system/import-from-sqlite
router.post('/import-from-sqlite', async (_req: Request, res: Response) => {
  if (getState() !== 'PENDING_IMPORT') {
    return res.status(409).json({ error: 'No import is pending.' })
  }

  try {
    const result = await importFromSqlite()
    setLastError(null)

    res.json(result)
  } catch (err) {
    // The transaction rolled back, so Postgres is untouched and the SQLite file
    // is still in place. Stay in PENDING_IMPORT and surface why, rather than
    // leaving the user with a blank screen and no explanation.
    const message = describeImportFailure(err)
    setLastError(message)

    // The browser gets one sentence; whoever is reading logs gets everything.
    // Without this the only record of a failed migration was a screen the user
    // could navigate away from.
    console.error('Import from SQLite failed. Nothing was changed.')
    console.error(err)

    res.status(500).json({ error: message })
  }
})

/**
 * One sentence about a failed import, safe to put on a screen.
 *
 * Drizzle's error message is the entire failed statement plus every bound
 * parameter — which, for an import, is the user's own data: player names,
 * session notes, everything in the chunk that failed. It rendered as a wall of
 * SQL where an explanation belonged. The driver's own error sits underneath as
 * `cause` and is both shorter and the part that says what actually went wrong.
 */
export function describeImportFailure(err: unknown): string {
  const cause = err instanceof Error && err.cause instanceof Error ? err.cause : err
  const detail = cause instanceof Error ? cause.message : String(cause)

  return `The import failed, so nothing was changed — ${detail}`
}

export default router
