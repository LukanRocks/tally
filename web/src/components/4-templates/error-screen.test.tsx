import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorScreen } from './error-screen'

import type { HttpError } from '@/lib/http-transport/helpers'

const misconfigured = (): HttpError =>
  Object.assign(new Error('Postgres is only partly configured'), {
    code: 503,
    state: 'MISCONFIGURED' as const,
    problem: 'Postgres is only partly configured — DB_HOST is set, but DB_NAME, DB_USER, DB_PASSWORD are missing.',
    docsUrl: 'https://github.com/LukanRocks/tally#database-configuration',
  })

const setup = (error?: HttpError) => {
  const onRetry = vi.fn()
  render(<ErrorScreen error={error} onRetry={onRetry} />)
  return { onRetry, user: userEvent.setup() }
}

describe('ErrorScreen', () => {
  it('shows the server explanation rather than the generic copy', () => {
    setup(misconfigured())

    expect(screen.getByText(/DB_NAME, DB_USER, DB_PASSWORD are missing/)).toBeInTheDocument()
    expect(screen.queryByText(/Your browser can see the table/)).not.toBeInTheDocument()
  })

  it('falls back to the offline copy when the server said nothing', () => {
    setup(Object.assign(new Error('Failed to fetch')))

    expect(screen.getByText(/Your browser can see the table/)).toBeInTheDocument()
  })

  // Retrying a typo in a compose file never succeeds, so the countdown is noise.
  // Worse, it implies the app is waiting for something that might fix itself.
  it('offers no auto-retry when the problem is configuration', () => {
    setup(misconfigured())

    expect(screen.getByText('TALLY · NOT CONFIGURED')).toBeInTheDocument()
    expect(screen.queryByText(/AUTO ·/)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /check again/i })).toBeInTheDocument()
  })

  it('keeps auto-retry for an ordinary outage', () => {
    setup()

    expect(screen.getByText('TALLY · OFFLINE')).toBeInTheDocument()
    expect(screen.getByText(/AUTO ·/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /roll again/i })).toBeInTheDocument()
  })

  it('links to the section explaining this specific problem', () => {
    setup(misconfigured())

    expect(screen.getByRole('link', { name: /read the docs/i })).toHaveAttribute('href', 'https://github.com/LukanRocks/tally#database-configuration')
  })

  it('shows no docs link when the failure came with none', () => {
    setup()

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('retries on demand', async () => {
    const { user, onRetry } = setup(misconfigured())

    await user.click(screen.getByRole('button', { name: /check again/i }))

    expect(onRetry).toHaveBeenCalledTimes(1)
  })
})
