import { Request, Response, NextFunction } from 'express'
import { getState } from '../db/state'
import { helpUrl } from '../help-links'

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

  // Same shape as the degraded app's payload: the frontend should not need to
  // know which part of the backend refused it, only what is wrong and what to do.
  res.status(503).json({
    state: 'PENDING_IMPORT',
    problem: 'Tally is configured for Postgres, but found existing data in the built-in SQLite database. Choose whether to import it before continuing.',
    docsUrl: helpUrl('migration'),
  })
}
