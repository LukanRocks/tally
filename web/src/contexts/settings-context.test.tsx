import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

import type { HttpError } from '@/lib/http-transport/helpers'

const settingsGet = vi.fn()
const systemStatus = vi.fn()

vi.mock('@/lib/http-transport/private/settings', () => ({
  settingsTransport: { get: () => settingsGet(), update: vi.fn(), reset: vi.fn() },
}))

vi.mock('@/lib/http-transport/private/system', () => ({
  systemTransport: { status: () => systemStatus(), importFromSqlite: vi.fn() },
}))

const { SettingsProvider } = await import('./settings-context')

const gateRejection = (state: HttpError['state']): HttpError =>
  Object.assign(new Error('Service unavailable'), {
    code: 503,
    state,
    problem: 'Tally is configured for Postgres, but found existing data in the built-in SQLite database.',
    docsUrl: 'https://github.com/LukanRocks/tally#migrating-from-sqlite-to-postgres',
  })

const renderApp = () =>
  render(
    <SettingsProvider>
      <p>the app</p>
    </SettingsProvider>,
  )

beforeEach(() => {
  settingsGet.mockReset()
  systemStatus.mockReset()
})

describe('SettingsProvider as the mount-time gate', () => {
  it('renders the app when the database is healthy', async () => {
    settingsGet.mockResolvedValue({ onboarded: true, currency: 'USD', language: 'en', theme: 'system', updated_at: '' })

    renderApp()

    expect(await screen.findByText('the app')).toBeInTheDocument()
  })

  // A healthy boot is the overwhelmingly common case, and it must not pay for
  // the migration path with an extra round trip on every load.
  it('does not ask for database status when nothing is wrong', async () => {
    settingsGet.mockResolvedValue({ onboarded: true, currency: 'USD', language: 'en', theme: 'system', updated_at: '' })

    renderApp()
    await screen.findByText('the app')

    expect(systemStatus).not.toHaveBeenCalled()
  })

  it('shows the decision screen with row counts when an import is pending', async () => {
    settingsGet.mockRejectedValue(gateRejection('PENDING_IMPORT'))
    systemStatus.mockResolvedValue({ state: 'PENDING_IMPORT', dialect: 'postgres', source: { games: 34, players: 7, sessions: 152 } })

    renderApp()

    expect(await screen.findByText(/shall we move it/)).toBeInTheDocument()
    expect(screen.getByText('152')).toBeInTheDocument()
    expect(screen.queryByText('the app')).not.toBeInTheDocument()
  })

  // Regression: the status response was taken wholesale, so when it carried no
  // link the screen rendered without one — on the single screen where "what
  // does this actually do?" is the likeliest question.
  it('keeps the docs link the gate supplied when the status response has none', async () => {
    settingsGet.mockRejectedValue(gateRejection('PENDING_IMPORT'))
    systemStatus.mockResolvedValue({ state: 'PENDING_IMPORT', dialect: 'postgres', source: { games: 34, players: 7, sessions: 152 } })

    renderApp()

    expect(await screen.findByRole('link', { name: /read the docs/i })).toHaveAttribute('href', expect.stringContaining('#migrating-from-sqlite-to-postgres'))
  })

  // If the counts request fails too, the decision screen still has to appear —
  // its button is the only way out of PENDING_IMPORT. Falling through to the
  // error screen would leave the user stuck with a retry that never clears.
  it('still shows the decision screen when the status request fails', async () => {
    settingsGet.mockRejectedValue(gateRejection('PENDING_IMPORT'))
    systemStatus.mockRejectedValue(new Error('gateway timeout'))

    renderApp()

    expect(await screen.findByText(/shall we move it/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /read the docs/i })).toBeInTheDocument()
  })

  it('shows the error screen for a misconfigured database', async () => {
    settingsGet.mockRejectedValue(
      Object.assign(new Error('not configured'), {
        code: 503,
        state: 'MISCONFIGURED' as const,
        problem: 'DB_HOST is set, but DB_NAME, DB_USER, DB_PASSWORD are missing.',
        docsUrl: 'https://github.com/LukanRocks/tally#database-configuration',
      }),
    )

    renderApp()

    expect(await screen.findByText(/DB_NAME, DB_USER, DB_PASSWORD are missing/)).toBeInTheDocument()
    expect(systemStatus).not.toHaveBeenCalled()
  })

  it('shows the error screen when the server is simply unreachable', async () => {
    settingsGet.mockRejectedValue(new Error('Failed to fetch'))

    renderApp()

    await waitFor(() => expect(screen.getByText(/Your browser can see the table/)).toBeInTheDocument())
  })
})
