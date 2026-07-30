import { createApp } from './app'
import { runMigrations } from './db'

const PORT = Number(process.env.PORT ?? 3001)

runMigrations()

const app = createApp()

app.listen(PORT, () => {
  console.log(`Tally server running on http://localhost:${PORT}`)
})
