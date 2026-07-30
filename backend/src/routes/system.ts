import { Router, Request, Response } from 'express'
import { dialect } from '../db'
import { getState, getSourceCounts, getLastError, setLastError } from '../db/state'
import { importFromSqlite } from '../db/import-sqlite'

const router = Router()

// GET /api/v1/system/db-status
router.get('/db-status', (_req: Request, res: Response) => {
  res.json({
    state: getState(),
    dialect,
    source: getSourceCounts(),
    lastError: getLastError(),
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
    const message = err instanceof Error ? err.message : String(err)
    setLastError(message)

    res.status(500).json({ error: message })
  }
})

export default router
