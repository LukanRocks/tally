import { Router, Request, Response, NextFunction } from 'express'
import { parse } from 'csv-parse/sync'
import { like } from 'drizzle-orm'
import { db, sqlite } from '../db'
import { bgg_games as bggTable } from '../db/schema'
import { csvUpload } from '../middleware/upload'

const router = Router()

// POST /api/v1/bgg/import
router.post('/import', csvUpload.single('file'), (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

    const records: Record<string, string>[] = parse(req.file.buffer, {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
    })

    const valid: { bgg_id: number; name: string; year_published: number | null }[] = []

    for (const row of records) {
      const id = parseInt(row['id'] ?? row['objectid'] ?? '', 10)
      const name = (row['name'] ?? '').trim()

      if (!name || isNaN(id)) continue

      const year = parseInt(row['yearpublished'] ?? '', 10)

      valid.push({ bgg_id: id, name, year_published: isNaN(year) ? null : year })
    }

    const importFn = sqlite.transaction(() => {
      sqlite.prepare('DELETE FROM bgg_games').run()

      const stmt = sqlite.prepare('INSERT INTO bgg_games (bgg_id, name, year_published) VALUES (?, ?, ?)')

      for (const game of valid) {
        stmt.run(game.bgg_id, game.name, game.year_published)
      }

      sqlite.prepare('UPDATE settings SET bgg_last_updated = ? WHERE id = 1').run(new Date().toISOString())
    })

    importFn()

    res.json({ imported: valid.length })
  } catch (err) {
    next(err)
  }
})

// DELETE /api/v1/bgg
router.delete('/', (_req: Request, res: Response, next: NextFunction) => {
  try {
    const deleteFn = sqlite.transaction(() => {
      sqlite.prepare('DELETE FROM bgg_games').run()
      sqlite.prepare('UPDATE settings SET bgg_last_updated = NULL WHERE id = 1').run()
    })

    deleteFn()

    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

// GET /api/v1/bgg/search?q=
router.get('/search', (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = String(req.query.q ?? '').trim()

    if (query.length < 2) return res.json([])

    const rows = db
      .select({
        bgg_id: bggTable.bgg_id,
        name: bggTable.name,
        year_published: bggTable.year_published,
      })
      .from(bggTable)
      .where(like(bggTable.name, `%${query}%`))
      .limit(10)
      .all()

    res.json(rows)
  } catch (err) {
    next(err)
  }
})

export default router
