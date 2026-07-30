import { createApp } from './app'
import { runMigrations, config, describeConfig } from './db'

const PORT = Number(process.env.PORT ?? 3001)

async function main(): Promise<void> {
  console.log(`Database: ${describeConfig(config)}`)

  await runMigrations()

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
