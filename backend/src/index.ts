import { createApp } from './app'
import { runMigrations, config, describeConfig } from './db'
import { determineState, getSourceCounts } from './db/state'

const PORT = Number(process.env.PORT ?? 3001)

async function main(): Promise<void> {
  console.log(`Database: ${describeConfig(config)}`)

  await runMigrations()

  const state = await determineState()

  if (state === 'PENDING_IMPORT') {
    const counts = getSourceCounts()
    console.warn(
      `Existing SQLite data found (${counts?.games ?? 0} games, ${counts?.players ?? 0} players, ${counts?.sessions ?? 0} sessions) ` +
        `but Tally is configured for Postgres. The API is paused until you choose whether to import it.`,
    )
  }

  const app = createApp()

  app.listen(PORT, () => {
    console.log(`Tally server running on http://localhost:${PORT}`)
  })
}

main().catch((err) => {
  // Covers unreachable Postgres and invalid configuration alike. Exiting non-zero
  // makes the container restart loop visible instead of serving a broken app.
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
