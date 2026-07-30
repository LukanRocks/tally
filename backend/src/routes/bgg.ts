import { Router, Request, Response, NextFunction } from 'express'
import { parse } from 'csv-parse/sync'
import { like, eq } from 'drizzle-orm'
import { db } from '../db'
import { withTransaction } from '../db/transaction'
import { bgg_games as bggTable, settings as settingsTable } from '../db/schema'
import { csvUpload } from '../middleware/upload'

// #DOCS: Migration 0002_settings_and_owner.sql seeds DB by default creating a singleton
const SETTINGS_SINGLETON = 1

// SQLite allows 999 bound variables per statement by default; bgg_games binds 3
// per row, so keep multi-row inserts well under that ceiling.
const BGG_INSERT_CHUNK = 300

const router = Router()

// POST /api/v1/bgg/import
router.post('/import', csvUpload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
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

    await withTransaction(async (tx) => {
      await tx.delete(bggTable)

      // Chunked: a single multi-row insert of a full BGG export would blow past
      // SQLite's variable limit (999 by default, 3 bindings per row).
      for (let i = 0; i < valid.length; i += BGG_INSERT_CHUNK) {
        await tx.insert(bggTable).values(valid.slice(i, i + BGG_INSERT_CHUNK))
      }

      await tx.update(settingsTable).set({ bgg_last_updated: new Date().toISOString() }).where(eq(settingsTable.id, SETTINGS_SINGLETON))
    })

    res.json({ imported: valid.length })
  } catch (err) {
    next(err)
  }
})

// DELETE /api/v1/bgg
router.delete('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    await withTransaction(async (tx) => {
      await tx.delete(bggTable)
      await tx.update(settingsTable).set({ bgg_last_updated: null }).where(eq(settingsTable.id, SETTINGS_SINGLETON))
    })

    res.status(204).send()
  } catch (err) {
    next(err)
  }
})

// GET /api/v1/bgg/search?q=
router.get('/search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = String(req.query.q ?? '').trim()

    if (query.length < 2) return res.json([])

    const rows = await db
      .select({
        bgg_id: bggTable.bgg_id,
        name: bggTable.name,
        year_published: bggTable.year_published,
      })
      .from(bggTable)
      .where(like(bggTable.name, `%${query}%`))
      .limit(10)

    res.json(rows)
  } catch (err) {
    next(err)
  }
})

export default router
