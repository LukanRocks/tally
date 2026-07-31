import { ImportDecisionScreen } from '@/components/4-templates/import-decision-screen'

import type { DbStatus, ImportResult } from '@/lib/http-transport/private/system'

const mockStatus: DbStatus = {
  state: 'PENDING_IMPORT',
  dialect: 'postgres',
  source: { games: 34, players: 7, sessions: 152 },
  docsUrl: 'https://github.com/LukanRocks/tally#migrating-from-sqlite-to-postgres',
}

// Resolves after a beat so the importing state is visible here, rather than
// flashing past on its way to the completed screen.
const mockImport = (): Promise<ImportResult> =>
  new Promise((resolve) =>
    setTimeout(
      () => resolve({ imported: { games: 34, players: 7, sessions: 152, bgg_games: 34, settings: 1 }, archivedTo: '/app/data/tally.db.migrated-2026-07-31T01-22-04-118Z' }),
      1200,
    ),
  )

export const ImportDecisionScreenSection = () => (
  <section className='space-y-6'>
    <div>
      <h2 className='text-2xl font-bold'>Import decision screen</h2>
      <p className='mt-1 text-sm text-ink-secondary'>
        Shown when Tally is pointed at an empty Postgres while SQLite data still exists. The whole app is gated behind it. Press the button to walk through the importing and
        completed states.
      </p>
    </div>

    <div className='overflow-hidden rounded-xl border border-border'>
      <ImportDecisionScreen status={mockStatus} onImport={mockImport} onDone={() => {}} />
    </div>
  </section>
)
