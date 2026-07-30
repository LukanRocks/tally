import express from 'express'
import path from 'path'
import rateLimit from 'express-rate-limit'
import { DATA_DIR } from './db'
import { errorHandler } from './middleware/errorHandler'
import gamesRouter from './routes/games'
import playersRouter from './routes/players'
import sessionsRouter from './routes/sessions'
import statsRouter from './routes/stats'
import settingsRouter from './routes/settings'
import bggRouter from './routes/bgg'

// Builds the fully-configured Express app without binding a port, so tests can
// mount it directly. index.ts owns migrations and listen().
export function createApp(): express.Express {
  const app = express()

  app.set('trust proxy', 1)
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }))
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
  app.use('/api/v1/bgg', bggRouter)

  // Serve React app in production
  if (process.env.NODE_ENV === 'production') {
    const clientDist = path.join(__dirname, '..', 'public')
    app.use(express.static(clientDist))
    app.get('/{*path}', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')))
  }

  app.use(errorHandler)

  return app
}
