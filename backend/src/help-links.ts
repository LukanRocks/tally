/**
 * Documentation links surfaced to operators, in one place.
 *
 * These appear in the console banner and in API payloads, so they must not drift
 * apart. Each one points at a README heading; help-links.test.ts asserts those
 * headings still exist, because renaming one breaks every surface at once and
 * GitHub gives no error when an anchor misses — it just serves the page.
 */
const DOCS_BASE = 'https://github.com/LukanRocks/tally'

export const HELP_ANCHORS = {
  database: '#database-configuration',
  ssl: '#database-ssl',
  migration: '#migrating-from-sqlite-to-postgres',
} as const

export type HelpAnchor = keyof typeof HELP_ANCHORS

export const helpUrl = (anchor: HelpAnchor = 'database'): string => `${DOCS_BASE}${HELP_ANCHORS[anchor]}`
