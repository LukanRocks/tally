/**
 * Documentation links surfaced to operators, in one place.
 *
 * These appear in the console banner and in API payloads, so they must not drift
 * apart. Phase 6 writes the README sections these anchors point at — if an anchor
 * is renamed there, it is renamed here.
 */
const DOCS_BASE = 'https://github.com/LukanRocks/tally'

export const HELP_ANCHORS = {
  database: '#database-configuration',
  ssl: '#database-ssl',
  migration: '#migrating-from-sqlite-to-postgres',
} as const

export type HelpAnchor = keyof typeof HELP_ANCHORS

export const helpUrl = (anchor: HelpAnchor = 'database'): string => `${DOCS_BASE}${HELP_ANCHORS[anchor]}`
