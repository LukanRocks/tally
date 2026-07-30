import { Request, Response, NextFunction } from 'express'
import { getState } from '../db/state'

/**
 * Blocks the data API while an import is pending.
 *
 * This is a hard gate, not a dismissible banner. If the app served normally in
 * PENDING_IMPORT, a user could add a game into the empty Postgres database while
 * their real data sat in the SQLite file — and neither store would be
 * authoritative. Refusing to serve is the only way to keep that from happening.
 *
 * The /system endpoints stay reachable; they are how the user resolves the
 * state, so gating them would deadlock the app.
 */
export function pendingImportGate(req: Request, res: Response, next: NextFunction): void {
  if (getState() !== 'PENDING_IMPORT' || req.path.startsWith('/system/')) {
    next()
    return
  }

  res.status(503).json({
    error: 'Tally found existing SQLite data but is configured for Postgres. Choose whether to import it before continuing.',
    state: 'PENDING_IMPORT',
  })
}
