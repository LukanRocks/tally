import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'
import { HELP_ANCHORS, helpUrl, type HelpAnchor } from './help-links'

const README = readFileSync(join(__dirname, '..', '..', 'README.md'), 'utf-8')

/** GitHub's heading slug: lowercase, drop punctuation, spaces become hyphens. */
function slug(heading: string): string {
  return heading
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s/g, '-')
}

/**
 * Headings outside fenced code. The README's shell examples contain `# comment`
 * lines that look exactly like headings; counting those would let a comment in a
 * code block satisfy an anchor that has no real section behind it.
 */
function readmeHeadings(markdown: string): string[] {
  let fenced = false

  return markdown.split('\n').reduce<string[]>((found, line) => {
    if (/^\s*```/.test(line)) {
      fenced = !fenced
      return found
    }
    if (!fenced && /^#{1,6}\s/.test(line)) found.push(slug(line.replace(/^#{1,6}\s+/, '')))
    return found
  }, [])
}

const headings = readmeHeadings(README)

describe('help links', () => {
  // These anchors are the only route from a failed startup to an explanation:
  // the console banner, the API payload and the browser screen all point here.
  // A renamed README heading breaks every one of them at once, and silently —
  // GitHub serves the page, just scrolled to the top.
  it.each(Object.entries(HELP_ANCHORS))('%s points at a heading that exists in the README', (_name, anchor) => {
    expect(headings).toContain(anchor.replace(/^#/, ''))
  })

  // Two identical headings make GitHub suffix the second one `-1`, so a link to
  // the bare slug lands on whichever came first — rarely the one intended.
  it('has no duplicate headings for the linked sections', () => {
    for (const anchor of Object.values(HELP_ANCHORS)) {
      const target = anchor.replace(/^#/, '')
      expect(headings.filter((h) => h === target)).toHaveLength(1)
    }
  })

  it('builds an absolute url', () => {
    expect(helpUrl('ssl')).toBe('https://github.com/LukanRocks/tally#database-ssl')
  })

  it('defaults to the general database section', () => {
    expect(helpUrl()).toBe(helpUrl('database' as HelpAnchor))
  })
})
