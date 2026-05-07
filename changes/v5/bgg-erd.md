# Engineering Requirements Document
## BGG Data Import & Game Autocomplete

**Version:** v5
**Status:** Draft
**Last Updated:** 2026-05-06
**PRD Reference:** `changes/v5/bgg-prd.md`

---

## 1. Overview

This document covers the full technical implementation for v5 — BGG catalog import via CSV, name autocomplete on the game form, and the year_published field. It is scoped to files that must be created or modified and specifies the exact shape of each change so implementation can proceed without ambiguity.

---

## 2. Decisions Log

| Decision | Choice | Reason |
|---|---|---|
| CSV parsing library | `csv-parse` (new server dep) | Handles quoted commas/newlines in game names; BGG dump has well-formed CSV but game names may contain commas |
| Autocomplete UI | shadcn Combobox component (`@base-ui/react`) | `@base-ui/react` Combobox installed at `@/shadcn/components/ui/combobox`; provides native keyboard navigation, accessible popup, and server-side filtering via `filterFn` override |
| BGG delete confirmation | Text-confirmation dialog — user types `DELETE` | Consistent with the existing "Delete all data" Danger Zone pattern in `Settings.tsx` |
| Full reset includes BGG | Yes — `DELETE /api/v1/settings/reset` also truncates `bgg_games` | bgg_games is a lookup table, not user library data; a factory reset should leave the DB completely empty |
| Multer storage for CSV | `memoryStorage` | The CSV is parsed immediately and discarded; no reason to write it to disk |
| Bulk insert strategy | `sqlite.prepare().run()` in a transaction loop | Avoids building a 100k-element array in memory that Drizzle's `.values([])` would require |
| WAL mode | Already enabled in `db/index.ts:15` — no additional tuning needed | Resolves PRD open question #1: WAL + name index is sufficient for ~100k rows |

---

## 3. Database

### 3.1 New Migration: `0005_bgg.sql`

**File:** `server/src/db/migrations/0005_bgg.sql`

```sql
-- ============================================================
-- 0005_bgg.sql
-- Changes:
--   1. New bgg_games table (lookup only, no FK to games)
--   2. Add bgg_id and year_published to games
--   3. Add bgg_last_updated to settings
-- ============================================================

BEGIN;

-- 1. BGG catalog lookup table
CREATE TABLE IF NOT EXISTS bgg_games (
    bgg_id         INTEGER PRIMARY KEY,
    name           TEXT    NOT NULL,
    year_published INTEGER
);

CREATE INDEX IF NOT EXISTS idx_bgg_games_name ON bgg_games (name);

-- 2. games: two new nullable columns
ALTER TABLE games ADD COLUMN bgg_id         INTEGER;
ALTER TABLE games ADD COLUMN year_published INTEGER;

-- 3. settings: last import timestamp
ALTER TABLE settings ADD COLUMN bgg_last_updated TEXT;

COMMIT;
```

No data backfill needed — all three new columns are nullable and have no defaults.

### 3.2 Schema Changes: `schema.ts`

**File:** `server/src/db/schema.ts`

Add to `games` table definition (after `owner_id`):
```ts
bgg_id: integer('bgg_id'),
year_published: integer('year_published'),
```

Add to `settings` table definition (after `theme`):
```ts
bgg_last_updated: text('bgg_last_updated'),
```

Add new exported table after `settings`:
```ts
export const bgg_games = sqliteTable('bgg_games', {
  bgg_id: integer('bgg_id').primaryKey(),
  name: text('name').notNull(),
  year_published: integer('year_published'),
})
```

---

## 4. Backend

### 4.1 New Dependency

Add to `server/package.json` → `dependencies`:
```json
"csv-parse": "^5.6.0"
```

Install: `npm install csv-parse` inside `server/`.

### 4.2 Multer: CSV Upload Config

**File:** `server/src/middleware/upload.ts`

Add after the existing `avatarUpload` export:

```ts
const csvFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (file.mimetype === 'text/csv' || file.originalname.toLowerCase().endsWith('.csv')) {
    cb(null, true)
  } else {
    cb(new Error('Only CSV files are allowed'))
  }
}

export const csvUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: csvFilter,
})
```

Note: BGG sometimes serves the dump with `application/octet-stream` MIME type, so the extension fallback in `csvFilter` is intentional.

### 4.3 New Router: `bgg.ts`

**File:** `server/src/routes/bgg.ts` (new file)

```ts
import { Router, Request, Response, NextFunction } from 'express'
import { parse } from 'csv-parse/sync'
import { eq } from 'drizzle-orm'
import { db, sqlite } from '../db'
import { bgg_games as bggTable, settings as settingsTable } from '../db/schema'
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
      for (const g of valid) {
        stmt.run(g.bgg_id, g.name, g.year_published)
      }
      sqlite
        .prepare("UPDATE settings SET bgg_last_updated = ? WHERE id = 1")
        .run(new Date().toISOString())
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
    const q = String(req.query.q ?? '').trim()
    if (q.length < 2) return res.json([])

    const rows = db
      .select({
        bgg_id: bggTable.bgg_id,
        name: bggTable.name,
        year_published: bggTable.year_published,
      })
      .from(bggTable)
      .where(like(bggTable.name, `%${q}%`))
      .limit(10)
      .all()

    res.json(rows)
  } catch (err) {
    next(err)
  }
})

export default router
```

Import `like` from `drizzle-orm` at the top.

**Column name note:** The BGG data dump uses `id` as the game ID column header. Some older dump versions use `objectid`. The import handler checks both (`row['id'] ?? row['objectid']`) to be safe.

### 4.4 Register BGG Router

**File:** `server/src/index.ts`

Add import:
```ts
import bggRouter from './routes/bgg'
```

Add after the existing route registrations (before `app.use(errorHandler)`):
```ts
app.use('/api/v1/bgg', bggRouter)
```

### 4.5 Update Games Route

**File:** `server/src/routes/games.ts`

**POST /api/v1/games** — add `bgg_id` and `year_published` to destructuring and `.values()`:
```ts
const { name, description, quick_rules, min_players, max_players, purchase_at, price, owner_id, bgg_id, year_published } = req.body
// ...
.values({
  // ...existing fields...
  bgg_id: bgg_id ? Number(bgg_id) : null,
  year_published: year_published ? Number(year_published) : null,
})
```

**PUT /api/v1/games/:id** — add to patch building block:
```ts
if (body.bgg_id !== undefined) patch.bgg_id = body.bgg_id ? Number(body.bgg_id) : null
if (body.year_published !== undefined) patch.year_published = body.year_published ? Number(body.year_published) : null
```

### 4.6 Update Settings Reset

**File:** `server/src/routes/settings.ts`

In the `DELETE /api/v1/settings/reset` transaction, add after the existing `DELETE FROM settings` line:
```ts
sqlite.prepare('DELETE FROM bgg_games').run()
```

The `bgg_last_updated` column will be reset implicitly when settings is re-seeded with `INSERT INTO settings (id) VALUES (1)`.

---

## 5. Frontend

### 5.1 Type Updates: `api.ts`

**File:** `client/src/lib/api.ts`

**Update `Game` interface** — add two fields:
```ts
bgg_id: number | null
year_published: number | null
```

**Update `Settings` interface** — add one field:
```ts
bgg_last_updated: string | null
```

**New `BggGame` interface:**
```ts
export interface BggGame {
  bgg_id: number
  name: string
  year_published: number | null
}

export interface BggImportResult {
  imported: number
}
```

**New `api.bgg` namespace** (add inside the `api` object):
```ts
bgg: {
  import: (file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    return req<BggImportResult>('/bgg/import', { method: 'POST', body: fd })
  },
  delete: () => req<void>('/bgg', { method: 'DELETE' }),
  search: (q: string) => req<BggGame[]>(`/bgg/search?q=${encodeURIComponent(q)}`),
},
```

### 5.2 Settings Page Updates

**File:** `client/src/pages/Settings.tsx`

#### New state variables
```ts
const [bggLastUpdated, setBggLastUpdated] = useState<string | null>(null)
const [bggFile, setBggFile] = useState<File | null>(null)
const [bggImporting, setBggImporting] = useState(false)
const [showBggDeleteConfirm, setShowBggDeleteConfirm] = useState(false)
const [bggDeleteText, setBggDeleteText] = useState('')
const [bggDeleting, setBggDeleting] = useState(false)
```

#### Initialise from settings
In the existing `useEffect` that reads `ctxSettings` (around line 33), add:
```ts
setBggLastUpdated(ctxSettings.bgg_last_updated ?? null)
```

#### Import handler
```ts
async function handleBggImport() {
  if (!bggFile) return
  setBggImporting(true)
  try {
    const result = await api.bgg.import(bggFile)
    setBggLastUpdated(new Date().toISOString())
    setBggFile(null)
    toast.success(`BGG data updated — ${result.imported} games imported`)
  } catch (err: any) {
    toast.error(err.message)
  } finally {
    setBggImporting(false)
  }
}
```

#### Delete handler
```ts
async function handleBggDelete() {
  setBggDeleting(true)
  try {
    await api.bgg.delete()
    setBggLastUpdated(null)
    setShowBggDeleteConfirm(false)
    setBggDeleteText('')
    toast.success('BGG data deleted')
  } catch (err: any) {
    toast.error(err.message)
  } finally {
    setBggDeleting(false)
  }
}
```

#### BGG section markup

Insert between the closing `</div>` of the settings fields block and the `<div className='mt-12 border-t ...'>` Danger Zone section:

```tsx
{/* BGG Data section */}
<div className='mt-12 border-t border-border pt-8'>
  <div className='mb-4 flex items-center gap-3'>
    <h2 className='text-sm font-semibold text-foreground'>BGG Data</h2>
    <a href='https://boardgamegeek.com' target='_blank' rel='noopener noreferrer'>
      {/* BGG logo — bundled at client/public/bgg-logo.png */}
      <img src='/bgg-logo.png' alt='BoardGameGeek' className='h-6' />
    </a>
  </div>

  <p className='mb-1 text-xs text-muted-foreground'>
    Game data provided by{' '}
    <a href='https://boardgamegeek.com' target='_blank' rel='noopener noreferrer' className='underline hover:text-foreground'>
      BoardGameGeek
    </a>
    . Download the data dump from the BGG website and import it here.
  </p>

  <p className='mb-4 text-xs text-muted-foreground'>
    {bggLastUpdated
      ? `Last updated: ${new Date(bggLastUpdated).toLocaleString(ctxSettings?.language === 'pt' ? 'pt-BR' : 'en-US')}`
      : 'No BGG data loaded.'}
  </p>

  <div className='flex items-center gap-2'>
    <input
      type='file'
      accept='.csv'
      onChange={(e) => setBggFile(e.target.files?.[0] ?? null)}
      className='text-sm text-muted-foreground file:mr-2 file:rounded file:border-0 file:bg-accent file:px-3 file:py-1 file:text-sm file:font-medium'
    />
    <button
      onClick={handleBggImport}
      disabled={!bggFile || bggImporting}
      className='rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50'
    >
      {bggImporting ? 'Importing…' : 'Import'}
    </button>
  </div>

  <div className='mt-4'>
    <button
      onClick={() => { setShowBggDeleteConfirm(true); setBggDeleteText('') }}
      className='rounded-lg border border-destructive/40 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10'
    >
      Delete BGG data
    </button>
  </div>
</div>
```

#### BGG delete confirmation modal

Add alongside the existing `showResetConfirm` modal (before the closing `</div>` of the page):

```tsx
{showBggDeleteConfirm && (
  <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
    <div className='w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl'>
      <h3 className='mb-2 text-lg font-semibold text-foreground'>Delete BGG data?</h3>
      <p className='mb-4 text-sm text-muted-foreground'>
        All BoardGameGeek catalog data will be removed. Your library games are not affected.
      </p>
      <p className='mb-2 text-sm font-medium text-foreground'>
        Type <span className='font-mono text-destructive'>DELETE</span> to confirm
      </p>
      <input
        type='text'
        value={bggDeleteText}
        onChange={(e) => setBggDeleteText(e.target.value)}
        placeholder='DELETE'
        className='input mb-6'
        autoFocus
      />
      <div className='flex justify-end gap-3'>
        <button
          onClick={() => { setShowBggDeleteConfirm(false); setBggDeleteText('') }}
          disabled={bggDeleting}
          className='rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50'
        >
          Cancel
        </button>
        <button
          onClick={handleBggDelete}
          disabled={bggDeleting || bggDeleteText !== 'DELETE'}
          className='rounded-lg bg-destructive px-4 py-2 text-sm text-white hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-50'
        >
          {bggDeleting ? 'Deleting…' : 'Delete BGG data'}
        </button>
      </div>
    </div>
  </div>
)}
```

### 5.3 GameForm Updates

**File:** `client/src/pages/GameForm.tsx`

#### FormData type additions
```ts
type FormData = {
  // ...existing fields...
  year_published: string
  bgg_id: number | null
}

const empty: FormData = {
  // ...existing fields...
  year_published: '',
  bgg_id: null,
}
```

#### New state and imports for autocomplete
```ts
const [bggResults, setBggResults] = useState<BggGame[]>([])
const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
```

Import at the top of `GameForm.tsx`:
```ts
import { BggGame } from '../lib/api'
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from '@/shadcn/components/ui/combobox'
```

#### Populate year_published when editing
In the `isEdit` branch of the `useEffect`, add to the `setForm` call:
```ts
year_published: g.year_published != null ? String(g.year_published) : '',
bgg_id: g.bgg_id ?? null,
```

#### Input change handler
Called by `ComboboxPrimitive.Input`'s `onInputValueChange` — receives the string value directly (not an event).

```ts
function handleNameChange(value: string) {
  setForm((f) => ({ ...f, name: value, bgg_id: null }))

  if (debounceRef.current) clearTimeout(debounceRef.current)
  if (value.length < 2) {
    setBggResults([])
    return
  }
  debounceRef.current = setTimeout(async () => {
    try {
      const results = await api.bgg.search(value)
      setBggResults(results)
    } catch {
      // silently ignore — autocomplete failure must not block the form
    }
  }, 300)
}
```

Clearing `bgg_id` on each keystroke prevents a stale BGG ID from being submitted if the user selects a suggestion then edits the name.

#### BGG suggestion select handler
Called by `ComboboxItem`'s `onSelect` (or `Combobox.Root`'s `onValueChange`). The Combobox passes the item's `value` prop; map it back to the full `BggGame` object via `bggResults`.

```ts
function handleBggSelect(bggId: string) {
  const game = bggResults.find((g) => String(g.bgg_id) === bggId)
  if (!game) return
  setForm((f) => ({
    ...f,
    name: game.name,
    year_published: game.year_published != null ? String(game.year_published) : '',
    bgg_id: game.bgg_id,
  }))
  setBggResults([])
}
```

#### Submit payload additions
```ts
const payload = {
  // ...existing fields...
  year_published: form.year_published ? Number(form.year_published) : null,
  bgg_id: form.bgg_id ?? null,
}
```

#### Name field markup (replace existing `<Field label='Name *'>` block)

The Combobox is used in **free-text mode**: client-side filtering is disabled (`filterFn={() => true}` passes all items through so only the server-filtered `bggResults` are shown), and `inputValue` + `onInputValueChange` control the text independently from the selected value.

```tsx
<Field label='Name *' htmlFor='name'>
  <Combobox
    value={form.bgg_id != null ? String(form.bgg_id) : ''}
    onValueChange={handleBggSelect}
    inputValue={form.name}
    onInputValueChange={handleNameChange}
    filterFn={() => true}
  >
    <ComboboxInput
      id='name'
      placeholder='Wingspan'
      required
      showTrigger={false}
      showClear={false}
      autoComplete='off'
      className='w-full'
    />
    {bggResults.length > 0 && (
      <ComboboxContent>
        <ComboboxList>
          {bggResults.map((g) => (
            <ComboboxItem key={g.bgg_id} value={String(g.bgg_id)}>
              {g.name}
              {g.year_published != null && (
                <span className='ml-1 text-muted-foreground'>({g.year_published})</span>
              )}
            </ComboboxItem>
          ))}
        </ComboboxList>
      </ComboboxContent>
    )}
  </Combobox>
</Field>
```

**Implementation notes:**
- `filterFn={() => true}` disables Base UI's built-in client-side filtering — results are entirely controlled by `bggResults` from the server search.
- `showTrigger={false}` and `showClear={false}` on `ComboboxInput` remove the chevron and X buttons since this is a free-text field, not a select widget.
- `ComboboxContent` is only rendered when there are results, so no empty-state dropdown appears when BGG data is not loaded.
- Base UI's Combobox handles keyboard navigation (arrow keys, Enter, Escape) natively across `ComboboxItem`s.
- Verify exact prop names (`inputValue`, `onInputValueChange`, `filterFn`) against the installed `@base-ui/react` version's API — these match the Base UI v1 Combobox spec but confirm if the installed version differs.

#### Year Published field (add directly after the Name field)
```tsx
<Field label='Year Published' htmlFor='year_published'>
  <input
    id='year_published'
    type='number'
    min={1900}
    max={new Date().getFullYear() + 2}
    value={form.year_published}
    onChange={set('year_published')}
    className='input'
    placeholder='2019'
  />
</Field>
```

### 5.4 GameDetail Year Display

**File:** `client/src/pages/GameDetail.tsx`

Locate the section that renders game metadata (name, description, player counts, price, etc.) and add a `year_published` line wherever it fits in the existing layout. Example — alongside the existing metadata block:
```tsx
{game.year_published != null && (
  <p className='text-sm text-muted-foreground'>
    <span className='font-medium text-foreground'>Year Published: </span>
    {game.year_published}
  </p>
)}
```

Not shown on library grid cards (per PRD §3.6).

---

## 6. BGG Logo Asset

**Requirement from PRD §3.2:** The BGG logo must be downloaded from the BGG logos page and bundled with the client. The logo must be large enough for text to be legible.

**Action (manual prerequisite before implementing Settings UI):**
1. Download the BGG logo from [https://boardgamegeek.com/wiki/page/BGG_Logos](https://boardgamegeek.com/wiki/page/BGG_Logos).
2. Place the file at `client/public/bgg-logo.png` (or `.svg`).
3. Update the `<img src='/bgg-logo.png' ...>` in Settings.tsx if the extension differs.

The `client/public/` directory is served as static assets by Vite and included in the production build.

---

## 7. README Update

**File:** `README.md`

Add a section (or append to an existing "Data" section) noting:
- BGG data is optional and user-imported via CSV download from BoardGameGeek.
- It is subject to BGG's Terms of Use: https://boardgamegeek.com/terms
- The app makes no live calls to the BGG API.

---

## 8. Implementation Order

Work through this sequence to avoid blocked steps:

| Phase | Task | Files |
|---|---|---|
| 1 | Write migration SQL | `server/src/db/migrations/0005_bgg.sql` |
| 2 | Update Drizzle schema | `server/src/db/schema.ts` |
| 3 | Add csvUpload to upload middleware | `server/src/middleware/upload.ts` |
| 4 | Install csv-parse | `server/package.json` + `npm install` |
| 5 | Create BGG router | `server/src/routes/bgg.ts` |
| 6 | Register BGG router in index | `server/src/index.ts` |
| 7 | Update games route (bgg_id, year_published) | `server/src/routes/games.ts` |
| 8 | Update settings reset to wipe bgg_games | `server/src/routes/settings.ts` |
| 9 | Update api.ts types and wrappers | `client/src/lib/api.ts` |
| 10 | Download and place BGG logo asset | `client/public/bgg-logo.png` |
| 11 | Update Settings.tsx (BGG section) | `client/src/pages/Settings.tsx` |
| 12 | Update GameForm.tsx (autocomplete + year) | `client/src/pages/GameForm.tsx` |
| 13 | Update GameDetail.tsx (year display) | `client/src/pages/GameDetail.tsx` |
| 14 | Update README | `README.md` |

---

## 9. Acceptance Checklist

### Import
- [ ] Upload a BGG CSV → success toast shows count of games imported
- [ ] "Last updated" timestamp appears immediately without page reload
- [ ] Re-import replaces all data (row count changes correctly)
- [ ] Upload a non-CSV file → error toast, no data changed
- [ ] Upload a CSV with some invalid rows (empty name, non-integer id) → succeeds, invalid rows silently skipped

### Delete
- [ ] Click "Delete BGG data" → confirmation dialog appears
- [ ] Type `DELETE` → Delete button enables
- [ ] Confirm → BGG data wiped, "Last updated" reverts to "No BGG data loaded." without reload
- [ ] Library games retain their name, year_published, and bgg_id after BGG delete

### Autocomplete
- [ ] Type 1 character → no dropdown
- [ ] Type 2+ characters → dropdown appears with up to 10 results
- [ ] Each result shows "Name (Year)" format
- [ ] Selecting a result fills name, year_published; bgg_id stored in form state
- [ ] Name and year remain editable after selection
- [ ] Typing freely without selecting works — form submits with whatever is in the fields
- [ ] No BGG data loaded → no dropdown, name field behaves as plain text; no error shown
- [ ] Autocomplete active on both Add and Edit game forms

### Year Published
- [ ] year_published field visible on both Add and Edit forms
- [ ] Field is optional — submit with blank year succeeds
- [ ] BGG-autofilled year is pre-populated but editable
- [ ] year_published displayed on game detail page when set
- [ ] year_published not shown on library grid cards

### Attribution
- [ ] BGG logo visible in Settings BGG section at legible size
- [ ] Logo and "Game data provided by BoardGameGeek" text both link to https://boardgamegeek.com
- [ ] Attribution visible even when no BGG data is loaded

### Reset
- [ ] "Delete all data" also wipes bgg_games and clears bgg_last_updated

---

*End of Document*
