import express from 'express'
import path from 'path'
import { runMigrations, DATA_DIR } from './db'
import { errorHandler } from './middleware/errorHandler'
import gamesRouter from './routes/games'
import playersRouter from './routes/players'
import sessionsRouter from './routes/sessions'
import statsRouter from './routes/stats'
import settingsRouter from './routes/settings'

const app = express()
const PORT = Number(process.env.PORT ?? 3001)

app.use(express.json())

// Serve uploaded files
app.use('/files/covers', express.static(path.join(DATA_DIR, 'covers')))
app.use('/files/attachments', express.static(path.join(DATA_DIR, 'attachments')))
app.use('/files/avatars', express.static(path.join(DATA_DIR, 'avatars')))

// API routes
app.use('/api/v1/games', gamesRouter)
app.use('/api/v1/players', playersRouter)
app.use('/api/v1/sessions', sessionsRouter)
app.use('/api/v1/stats', statsRouter)
app.use('/api/v1/settings', settingsRouter)

// Serve React app in production
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '..', 'public')
  app.use(express.static(clientDist))
  app.get('*', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')))
}

app.use(errorHandler)

runMigrations()

app.listen(PORT, () => {
  console.log(`Tally server running on http://localhost:${PORT}`)
})
