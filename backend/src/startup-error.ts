import { DatabaseConfigError } from './db/config'
import { helpUrl, type HelpAnchor } from './help-links'

/**
 * Turns any startup failure into something an operator can act on.
 *
 * Tally is self-hosted: the person reading this is looking at `docker logs`
 * after editing a compose file, not at a debugger. A stack trace tells them
 * nothing they can use, so every known failure gets a plain statement of what is
 * wrong and what to change. Unknown failures still print their message and stack
 * — hiding those would trade one bad experience for a worse one.
 */

interface Explained {
  problem: string
  note?: string
  docs: HelpAnchor
}

/** Postgres/driver error codes we can explain better than the driver does. */
function explainConnectionError(err: NodeJS.ErrnoException & { code?: string; address?: string; port?: number }): Explained | null {
  switch (err.code) {
    case 'ENOTFOUND':
      return {
        problem: `The database host could not be found (${err.message.replace(/^getaddrinfo ENOTFOUND /, '')}).`,
        docs: 'database',
      }
    case 'ECONNREFUSED':
      return {
        problem: `The database refused the connection${err.address ? ` at ${err.address}:${err.port}` : ''}.`,
        docs: 'database',
      }
    case 'ETIMEDOUT':
      return {
        problem: 'Connecting to the database timed out.',
        docs: 'database',
      }
    case '28P01':
      return {
        problem: 'The database rejected the username or password.',
        docs: 'database',
      }
    case '3D000':
      return {
        problem: `The database named in your configuration does not exist${err.message ? ` — ${err.message}` : ''}.`,
        docs: 'database',
      }
    case '28000':
      return {
        problem: `The database rejected the connection${err.message ? ` — ${err.message}` : ''}.`,
        docs: 'database',
      }
    case 'SELF_SIGNED_CERT_IN_CHAIN':
    case 'DEPTH_ZERO_SELF_SIGNED_CERT':
      return {
        problem: `The database TLS certificate could not be verified (DB_SSL is currently "verify-full").`,
        docs: 'ssl',
      }
    default:
      return null
  }
}

export function explainStartupError(err: unknown): Explained | null {
  if (err instanceof DatabaseConfigError) {
    return { problem: err.problem, note: err.note, docs: err.docs }
  }

  if (err instanceof Error) {
    return explainConnectionError(err as NodeJS.ErrnoException)
  }

  return null
}

/** Renders the banner printed to stderr before exiting. */
export function formatStartupError(err: unknown): string {
  const explained = explainStartupError(err)
  const lines: string[] = ['', 'Tally could not start.', '']

  if (explained) {
    lines.push(`  ${explained.problem}`)
    if (explained.note) lines.push('', `  ${explained.note}`)
    lines.push('', `  Reference: ${helpUrl(explained.docs)}`)
  } else {
    // Unrecognised — surface everything rather than swallow a real bug.
    lines.push(`  ${err instanceof Error ? err.message : String(err)}`)
    if (err instanceof Error && err.stack) lines.push('', err.stack)
  }

  lines.push('')
  return lines.join('\n')
}
