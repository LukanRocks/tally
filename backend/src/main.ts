import { formatStartupError } from './startup-error'
import { DatabaseConfigError } from './db/config'
import { createDegradedApp } from './degraded-app'

const PORT = Number(process.env.PORT ?? 3001)

/**
 * `./db` resolves configuration and opens a driver connection at module load, so
 * importing it can throw. These imports are therefore deliberately deferred into
 * main() rather than hoisted to the top of the file — a top-level import would
 * throw during require(), before this function exists, and Node would dump a raw
 * stack trace instead of the message the operator needs.
 */
async function main(): Promise<void> {
  const { runMigrations, config, describeConfig } = await import('./db')
  const { determineState, getSourceCounts } = await import('./db/state')
  const { createApp } = await import('./app')

  console.log(`Database: ${describeConfig(config)}`)

  await runMigrations()

  if ((await determineState()) === 'PENDING_IMPORT') {
    const counts = getSourceCounts()
    console.warn(
      [
        '',
        'Tally is configured for Postgres, but found existing SQLite data.',
        '',
        `  Found    ${counts?.games ?? 0} games, ${counts?.players ?? 0} players, ${counts?.sessions ?? 0} sessions in the SQLite database`,
        '  Paused   The API is paused until you choose whether to import it',
        '  Next     Open Tally in a browser to import the data, or remove the Postgres',
        '           variables and restart to go back to SQLite',
        '',
      ].join('\n'),
    )
  }

  createApp().listen(PORT, () => {
    console.log(`Tally server running on http://localhost:${PORT}`)
  })
}

main().catch((err) => {
  console.error(formatStartupError(err))

  // Configuration errors are served rather than crashed on. They are thrown
  // before any connection attempt, restarting never resolves them, and the user
  // who just edited a compose file is probably looking at a browser tab first, not a log.
  // See degraded-app.ts for why this is the only class treated this way.
  if (err instanceof DatabaseConfigError) {
    createDegradedApp(err).listen(PORT, () => {
      console.error(
        `Tally is staying up at http://localhost:${PORT} to report this in the browser as well. Restarting will not clear a configuration error. No data is served until it is fixed.`,
      )
    })
    return
  }

  // Everything else exits: connection failures recover through the restart
  // policy once the database appears, and an unrecognised error is safer as a
  // crash than as a server running in an unknown state.
  process.exit(1)
})
