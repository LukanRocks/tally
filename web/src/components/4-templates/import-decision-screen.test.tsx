import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ImportDecisionScreen } from './import-decision-screen'

import type { DbStatus, ImportResult } from '@/lib/http-transport/private/system'

const status: DbStatus = {
  state: 'PENDING_IMPORT',
  dialect: 'postgres',
  source: { games: 34, players: 7, sessions: 152 },
  docsUrl: 'https://github.com/LukanRocks/tally#migrating-from-sqlite-to-postgres',
}

const result: ImportResult = {
  imported: { games: 34, players: 7, sessions: 152, bgg_games: 34, settings: 1 },
  archivedTo: '/app/data/tally.db.migrated-2026-07-31T01-22-04-118Z',
}

const setup = (overrides: Partial<Parameters<typeof ImportDecisionScreen>[0]> = {}) => {
  const onImport = overrides.onImport ?? vi.fn<() => Promise<ImportResult>>().mockResolvedValue(result)
  const onDone = overrides.onDone ?? vi.fn()

  render(<ImportDecisionScreen status={overrides.status ?? status} onImport={onImport} onDone={onDone} />)

  return { onImport, onDone, user: userEvent.setup() }
}

const importButton = () => screen.getByRole('button')

describe('ImportDecisionScreen', () => {
  // The counts are the whole reason this screen makes a second request. Someone
  // deciding whether to migrate needs to see how much is at stake.
  it('shows what is waiting to be imported', () => {
    setup()

    expect(screen.getByText('34')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
    expect(screen.getByText('152')).toBeInTheDocument()
  })

  // Reachable when /system/db-status itself failed. Losing the counts must not
  // cost the user the button — it is the only way out of this state.
  it('still offers the import when counts are unavailable', () => {
    setup({ status: { state: 'PENDING_IMPORT' } })

    expect(importButton()).toBeEnabled()
    expect(screen.queryByText('games')).not.toBeInTheDocument()
  })

  it('tells the user how to decline without touching anything', () => {
    setup()

    expect(screen.getByText(/Remove the database variables from your compose file and restart/)).toBeInTheDocument()
  })

  // The single most important assertion here: this button moves someone's
  // database, and a double-click must not start two imports.
  it('imports once, and locks the button while it runs', async () => {
    let release: (value: ImportResult) => void = () => {}
    const onImport = vi.fn<() => Promise<ImportResult>>().mockReturnValue(new Promise<ImportResult>((resolve) => (release = resolve)))
    const { user } = setup({ onImport })

    await user.click(importButton())

    expect(onImport).toHaveBeenCalledTimes(1)
    expect(importButton()).toBeDisabled()

    await user.click(importButton())
    expect(onImport).toHaveBeenCalledTimes(1)

    release(result)
    await waitFor(() => expect(screen.getByText(/Moved/)).toBeInTheDocument())
  })

  it('reports what was imported and where the backup went', async () => {
    const { user } = setup()

    await user.click(importButton())

    expect(await screen.findByText(result.archivedTo)).toBeInTheDocument()
    expect(screen.getByText('34')).toBeInTheDocument()
  })

  it('does not re-enter the app until the user asks', async () => {
    const { user, onDone } = setup()

    await user.click(importButton())
    await screen.findByText(result.archivedTo)
    expect(onDone).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: /start playing/i }))
    expect(onDone).toHaveBeenCalledTimes(1)
  })

  // A failed import leaves both databases untouched, so the screen has to say
  // what happened and stay usable. Silently returning to idle would look like
  // the click never registered.
  it('surfaces a failed import and allows a retry', async () => {
    const onImport = vi
      .fn<() => Promise<ImportResult>>()
      .mockRejectedValueOnce(new Error('duplicate key value violates unique constraint "players_pkey"'))
      .mockResolvedValueOnce(result)
    const { user } = setup({ onImport })

    await user.click(importButton())

    expect(await screen.findByRole('alert')).toHaveTextContent(/players_pkey/)
    expect(importButton()).toBeEnabled()
    expect(importButton()).toHaveTextContent(/try again/i)

    await user.click(importButton())
    expect(await screen.findByText(result.archivedTo)).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('links to the docs when the server sent somewhere to go', () => {
    setup()

    expect(screen.getByRole('link', { name: /read the docs/i })).toHaveAttribute('href', status.docsUrl)
  })

  it('renders no link when it has no url', () => {
    setup({ status: { state: 'PENDING_IMPORT', source: status.source } })

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
