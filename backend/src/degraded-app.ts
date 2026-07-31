import express from 'express'
import path from 'path'
import rateLimit from 'express-rate-limit'
import type { DatabaseConfigError } from './db/config'
import type { DatabaseState } from './db/state-types'
import { helpUrl } from './help-links'

const MISCONFIGURED: DatabaseState = 'MISCONFIGURED'

/**
 * A minimal app served when configuration is invalid.
 *
 * The payload is deliberately just the problem and a documentation link. The
 * `note` explaining *why* Tally refuses stays in the console: its audience is
 * someone already reading logs, and the browser is better served by one
 * sentence and somewhere to go.
 *
 * Configuration errors are the one failure class worth staying up for. They are
 * thrown before any connection is attempted, restarting never fixes them, and
 * they happen in a specific workflow: edit the compose file, start the
 * container, open the browser. Crash-looping there means the explanation only
 * exists in a log the user has not opened.
 *
 * Every other failure still exits. Connection errors in particular rely on the
 * restart policy to recover once the database appears, and an unrecognised error
 * is safer as a crash than as a server running in an unknown state.
 *
 * Deliberately does NOT import ./app or ./db — importing either would re-run the
 * configuration resolution that just failed.
 */
export function createDegradedApp(error: DatabaseConfigError): express.Express {
  const app = express()

  const payload = {
    state: MISCONFIGURED,
    problem: error.problem,
    docsUrl: helpUrl(error.docs),
  }

  app.set('trust proxy', 1)
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }))

  // The frontend polls this to decide what to render, so it must answer 200 even
  // though nothing else will.
  app.get('/api/v1/system/db-status', (_req, res) => {
    res.json(payload)
  })

  // Everything else under the API is unavailable, and says why.
  app.use('/api/v1', (_req, res) => {
    res.status(503).json(payload)
  })

  if (process.env.NODE_ENV === 'production') {
    const clientDist = path.join(__dirname, '..', 'public')
    app.use(express.static(clientDist))
    app.get('/{*path}', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')))
  }

  return app
}
