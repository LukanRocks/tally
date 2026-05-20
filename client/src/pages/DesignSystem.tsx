import React, { useState } from 'react'

import { Page } from '../components/page'
import { Badge, badgeColorKeys, badgeVariantKeys } from '../components/badge'
import { Checkbox } from '../components/checkbox'
import { toast } from 'sonner'
import { cn } from '../lib/utils'
import { ThemeToggle } from '../components/theme-toggle'

const COLORS = badgeColorKeys
const VARIANTS = badgeVariantKeys

function CheckboxRow({ label, ...props }: { label: string } & React.ComponentProps<typeof Checkbox>) {
  const [checked, setChecked] = useState(!!props.defaultChecked)
  return (
    <label className='flex cursor-pointer items-center gap-2 text-sm'>
      <Checkbox checked={checked} onCheckedChange={(v) => setChecked(v === true)} {...props} />
      {label}
    </label>
  )
}

export default function DesignSystem() {
  return (
    <Page className='space-y-8'>
      <header className='flx flex-col gap-2'>
        <span className='eyebrow text-ink-muted'>v1 · foundations · patterns · components</span>
        <div className='flex w-full items-center justify-between'>
          <h1 className='text-5xl font-bold'>Design system</h1>
          <ThemeToggle />
        </div>
      </header>

      {/* Brand */}
      <section>
        <div>
          <span className='eyebrow text-ink-muted'>01 — Foundations</span>
          <h2 className='mt-1 text-2xl font-bold'>Brand</h2>
          <p className='mt-1 text-sm text-ink-secondary'>
            Tally is a board-game session tracker. The voice is <strong>warm, sharp, a little smug after a win</strong>. Surfaces are calm and paper-coloured; the yellow only shows
            up where something is happening.
          </p>
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div className='rounded-xl border border-border bg-card p-5'>
            <p className='eyebrow mb-4 text-ink-muted'>Primary lockup</p>
            <div className='flex items-center gap-4 py-4'>
              <svg width='80' height='80' viewBox='0 0 64 64'>
                <rect width='64' height='64' rx='14' style={{ fill: 'var(--ink-primary)' }} />
                <rect x='13' y='16' width='5' height='32' rx='1.5' style={{ fill: 'var(--paper-primary)' }} />
                <rect x='22' y='16' width='5' height='32' rx='1.5' style={{ fill: 'var(--paper-primary)' }} />
                <rect x='31' y='16' width='5' height='32' rx='1.5' style={{ fill: 'var(--paper-primary)' }} />
                <rect x='40' y='16' width='5' height='32' rx='1.5' style={{ fill: 'var(--paper-primary)' }} />
                <path d='M9 49 L52 15' strokeWidth='6' strokeLinecap='round' fill='none' style={{ stroke: 'var(--yellow-primary)' }} />
              </svg>
              <span className='text-5xl font-extrabold tracking-tight'>Tally</span>
            </div>
            <p className='text-xs text-ink-muted'>Four bars + a yellow slash. Reads as a scoreboard.</p>
          </div>

          <div className='rounded-xl border border-border bg-card p-5'>
            <p className='eyebrow mb-4 text-ink-muted'>Voice — three rules</p>
            <ol className='list-decimal space-y-2 pl-5 text-sm text-ink-secondary'>
              <li>
                <strong>Short and crisp.</strong> "Log a session", not "Record gameplay activity".
              </li>
              <li>
                <strong>Stats with a wink.</strong> "Alyne wins again" beats "Alyne: 4 victories".
              </li>
              <li>
                <strong>Verbs, not nouns.</strong> Buttons say <span className='text-yellow-tertiary font-semibold'>Play tonight</span>,{' '}
                <span className='text-yellow-tertiary font-semibold'>Log</span>, <span className='text-yellow-tertiary font-semibold'>Add player</span> — never "Submit".
              </li>
            </ol>
          </div>
        </div>

        <div className='grid grid-cols-3 gap-4'>
          <div className='flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-5'>
            <div className='flex h-24 w-24 items-center justify-center rounded-xl' style={{ background: 'var(--ink-primary)' }}>
              <svg width='56' height='56' viewBox='0 0 64 64'>
                <rect x='13' y='16' width='5' height='32' rx='1.5' style={{ fill: 'var(--paper-primary)' }} />
                <rect x='22' y='16' width='5' height='32' rx='1.5' style={{ fill: 'var(--paper-primary)' }} />
                <rect x='31' y='16' width='5' height='32' rx='1.5' style={{ fill: 'var(--paper-primary)' }} />
                <rect x='40' y='16' width='5' height='32' rx='1.5' style={{ fill: 'var(--paper-primary)' }} />
                <path d='M9 49 L52 15' strokeWidth='6' strokeLinecap='round' fill='none' style={{ stroke: 'var(--yellow-primary)' }} />
              </svg>
            </div>
            <p className='eyebrow text-center text-ink-muted'>Ink ground · default</p>
          </div>

          <div className='flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-5'>
            <div className='flex h-24 w-24 items-center justify-center rounded-xl bg-yellow-primary' style={{ color: 'var(--ink-primary)' }}>
              <svg width='56' height='56' viewBox='0 0 64 64'>
                <rect x='13' y='16' width='5' height='32' rx='1.5' fill='currentColor' />
                <rect x='22' y='16' width='5' height='32' rx='1.5' fill='currentColor' />
                <rect x='31' y='16' width='5' height='32' rx='1.5' fill='currentColor' />
                <rect x='40' y='16' width='5' height='32' rx='1.5' fill='currentColor' />
                <path d='M9 49 L52 15' stroke='currentColor' strokeWidth='6' strokeLinecap='round' fill='none' />
              </svg>
            </div>
            <p className='eyebrow text-center text-ink-muted'>Yellow ground · home tile</p>
          </div>

          <div className='flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-5'>
            <div className='flex h-24 w-24 items-center justify-center rounded-xl border border-border bg-paper-secondary text-ink-primary'>
              <svg width='56' height='56' viewBox='0 0 64 64'>
                <rect x='13' y='16' width='5' height='32' rx='1.5' fill='currentColor' />
                <rect x='22' y='16' width='5' height='32' rx='1.5' fill='currentColor' />
                <rect x='31' y='16' width='5' height='32' rx='1.5' fill='currentColor' />
                <rect x='40' y='16' width='5' height='32' rx='1.5' fill='currentColor' />
                <path d='M9 49 L52 15' stroke='currentColor' strokeWidth='6' strokeLinecap='round' fill='none' />
              </svg>
            </div>
            <p className='eyebrow text-center text-ink-muted'>Mono · footer / emboss</p>
          </div>
        </div>
      </section>

      {/* Color */}
      <section className='space-y-6'>
        <div>
          <h2 className='text-2xl font-bold'>Color</h2>
          <p className='mt-1 text-sm text-ink-secondary'>
            A two-tone system: warm paper and ink, with yellow as the single accent. Player-identity colors live <em>only</em> on avatars and rivalry callouts — not on chrome.
          </p>
        </div>

        <div className='space-y-3'>
          <p className='eyebrow text-ink-muted'>Core palette</p>
          <div className='grid grid-cols-3 gap-3 sm:grid-cols-6'>
            {[
              { v: '--paper-primary', name: 'paper-primary', desc: 'app background' },
              { v: '--paper-secondary', name: 'paper-secondary', desc: 'panels, lifted surfaces' },
              { v: '--paper-muted', name: 'paper-muted', desc: 'borders & dividers' },
              { v: '--ink-primary', name: 'ink-primary', desc: 'headings · key UI' },
              { v: '--ink-secondary', name: 'ink-secondary', desc: 'body text' },
              { v: '--ink-muted', name: 'ink-muted', desc: 'secondary text' },
            ].map((s) => (
              <div key={s.v} className='flex flex-col gap-1.5 rounded-xl border border-border bg-card p-3'>
                <div className='h-14 rounded-lg border border-black/10' style={{ background: `var(${s.v})` }} />
                <span className='font-mono text-[11px] font-semibold text-ink-primary'>{s.name}</span>
                <span className='text-[11px] text-ink-muted'>{s.desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className='space-y-3'>
          <p className='eyebrow text-ink-muted'>Accent — the one and only yellow</p>
          <div className='grid grid-cols-3 gap-3'>
            {[
              { v: '--yellow-primary', name: 'yellow-primary', desc: 'primary CTA · slash' },
              { v: '--yellow-secondary', name: 'yellow-secondary', desc: 'highlight backgrounds' },
            ].map((s) => (
              <div key={s.v} className='flex flex-col gap-1.5 rounded-xl border border-border bg-card p-3'>
                <div className='h-14 rounded-lg border border-black/10' style={{ background: `var(${s.v})` }} />
                <span className='font-mono text-[11px] font-semibold text-ink-primary'>{s.name}</span>
                <span className='text-[11px] text-ink-muted'>{s.desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className='space-y-3'>
          <p className='eyebrow text-ink-muted'>Player & status colors</p>
          <p className='text-xs text-ink-muted'>Use sparingly — these belong to people and outcomes, not buttons.</p>
          <div className='flex flex-wrap gap-3'>
            {(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'] as const).map((p) => (
              <div key={p} className='flex flex-col items-center gap-1'>
                <div className='h-10 w-10 rounded-full border border-black/10' style={{ background: `var(--player-${p})` }} />
                <span className='font-mono text-[10px] text-ink-muted'>{p}</span>
              </div>
            ))}
          </div>
          <div className='grid grid-cols-3 gap-3'>
            {[
              { v: '--win', name: 'win', desc: 'victory / positive' },
              { v: '--loss', name: 'loss', desc: 'destructive / loss' },
              { v: '--tie', name: 'tie', desc: 'draw' },
            ].map((s) => (
              <div key={s.v} className='flex flex-col gap-1.5 rounded-xl border border-border bg-card p-3'>
                <div className='h-14 rounded-lg border border-black/10' style={{ background: `var(${s.v})` }} />
                <span className='font-mono text-[11px] font-semibold text-ink-primary'>{s.name}</span>
                <span className='text-[11px] text-ink-muted'>{s.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Typography */}
      <section className='space-y-6'>
        <div>
          <h2 className='text-2xl font-bold'>Typography</h2>
          <p className='mt-1 text-sm text-ink-secondary'>
            Three families with strict jobs. <strong>Inter</strong> is the workhorse. <strong>JetBrains Mono</strong> is the labeler. <strong>Kalam</strong> is the wink — used once
            or twice per screen, never for body.
          </p>
        </div>

        <div className='divide-y divide-dashed divide-border rounded-xl border border-border bg-card'>
          <div className='grid grid-cols-[180px_1fr] items-center gap-6 px-5 py-4'>
            <div>
              <p className='eyebrow text-ink-muted'>Inter · UI & body</p>
              <p className='text-xs text-ink-muted'>400 / 500 / 600 / 700 / 800</p>
            </div>
            <span className='font-sans text-2xl text-ink-primary'>The quick brown fox plays Rumikubi</span>
          </div>
          <div className='grid grid-cols-[180px_1fr] items-center gap-6 px-5 py-4'>
            <div>
              <p className='eyebrow text-ink-muted'>Kalam · display accent</p>
              <p className='text-xs text-ink-muted'>700 · −3° rotation looks best</p>
            </div>
            <span className='callout'>A mark made.</span>
          </div>
          <div className='grid grid-cols-[180px_1fr] items-center gap-6 px-5 py-4'>
            <div>
              <p className='eyebrow text-ink-muted'>JetBrains Mono · metadata</p>
              <p className='text-xs text-ink-muted'>500 · uppercase · 1.5px tracking</p>
            </div>
            <span className='eyebrow text-sm text-ink-muted'>PLAY TONIGHT · 3 PLAYERS · ~45 MIN</span>
          </div>
        </div>

        <div>
          <p className='eyebrow mb-3 text-ink-muted'>Scale</p>
          <div className='overflow-auto rounded-xl border border-border bg-card'>
            <table className='w-full'>
              <thead>
                <tr className='border-b border-border'>
                  <th className='eyebrow px-4 py-3 text-left text-ink-muted'>token</th>
                  <th className='eyebrow px-4 py-3 text-left text-ink-muted'>size / line</th>
                  <th className='eyebrow px-4 py-3 text-left text-ink-muted'>weight</th>
                  <th className='eyebrow px-4 py-3 text-left text-ink-muted'>preview</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-dashed divide-border'>
                {[
                  {
                    token: 'display',
                    size: '56 / 60',
                    weight: '800',
                    preview: 'Tally',
                    style: { fontFamily: 'Inter', fontSize: 40, fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1 },
                  },
                  {
                    token: 'h1',
                    size: '40 / 44',
                    weight: '800',
                    preview: 'Leaderboard',
                    style: { fontFamily: 'Inter', fontSize: 32, fontWeight: 800, letterSpacing: '-1px', lineHeight: 1 },
                  },
                  {
                    token: 'h2',
                    size: '28 / 32',
                    weight: '700',
                    preview: 'Tonight focus',
                    style: { fontFamily: 'Inter', fontSize: 24, fontWeight: 700, letterSpacing: '-0.5px', lineHeight: 1 },
                  },
                  {
                    token: 'h3',
                    size: '20 / 26',
                    weight: '700',
                    preview: 'Rumikubi',
                    style: { fontFamily: 'Inter', fontSize: 18, fontWeight: 700, letterSpacing: '-0.25px', lineHeight: 1 },
                  },
                  { token: 'body', size: '16 / 25', weight: '400', preview: 'Alyne won three in a row.', style: { fontFamily: 'Inter', fontSize: 16, fontWeight: 400 } },
                  {
                    token: 'small',
                    size: '14 / 22',
                    weight: '400',
                    preview: '2 sessions · last on May 6',
                    style: { fontFamily: 'Inter', fontSize: 14, fontWeight: 400, color: 'var(--ink-muted)' },
                  },
                  {
                    token: 'label',
                    size: '11 / 16',
                    weight: '600 mono',
                    preview: 'PLAY TONIGHT',
                    style: { fontFamily: 'JetBrains Mono', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '1.5px', color: 'var(--ink-muted)' },
                  },
                  {
                    token: 'accent',
                    size: '32 / 36',
                    weight: '700 kalam',
                    preview: 'a mark made.',
                    style: { fontFamily: 'Kalam', fontSize: 28, fontWeight: 700, transform: 'rotate(-2deg)', display: 'inline-block', color: 'var(--yellow-tertiary)' },
                  },
                ].map((row) => (
                  <tr key={row.token}>
                    <td className='px-4 py-3'>
                      <code className='font-mono text-xs'>{row.token}</code>
                    </td>
                    <td className='px-4 py-3 text-xs text-ink-muted'>{row.size}</td>
                    <td className='px-4 py-3 text-xs text-ink-muted'>{row.weight}</td>
                    <td className='px-4 py-3'>
                      <span style={row.style}>{row.preview}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Spacing & Radius */}
      <section className='space-y-6'>
        <div>
          <h2 className='text-2xl font-bold'>Radius</h2>
          <p className='mt-1 text-sm text-ink-secondary'>4px base. Use the named tokens, not raw pixels.</p>
        </div>

        <div>
          <p className='eyebrow mb-3 text-ink-muted'>Radius</p>
          <div className='grid grid-cols-5 gap-3'>
            {(
              [
                { name: 'sm · 4', desc: 'chips, dense rows', cls: 'rounded-sm' },
                { name: 'md · 8', desc: 'inputs, small cards', cls: 'rounded-md' },
                { name: 'lg · 12', desc: 'cards, panels', cls: 'rounded-lg' },
                { name: 'xl · 16', desc: 'sheets, dialogs', cls: 'rounded-xl' },
                { name: 'full', desc: 'pills, avatars, FAB', cls: 'rounded-full' },
              ] as const
            ).map(({ name, desc, cls }) => (
              <div key={name} className='flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4'>
                <div className={`h-14 w-[72px] border-[1.5px] border-ink-primary bg-yellow-secondary ${cls}`} />
                <code className='font-mono text-[11px] text-ink-primary'>{name}</code>
                <span className='text-center text-[11px] text-ink-muted'>{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Elevation */}
      <section className='space-y-6'>
        <div>
          <h2 className='text-2xl font-bold'>Elevation</h2>
          <p className='mt-1 text-sm text-ink-secondary'>Shadows stay soft and warm. Reserve the hard "ink stamp" shadow for moments of personality — never for default chrome.</p>
        </div>

        <div className='grid grid-cols-5 gap-3'>
          {(
            [
              { name: 'xs', desc: 'borders with a hint of depth', cls: 'shadow-xs', stamp: false },
              { name: 'sm', desc: 'resting cards', cls: 'shadow-sm', stamp: false },
              { name: 'md', desc: 'hover, popovers', cls: 'shadow-md', stamp: false },
              { name: 'lg', desc: 'dialogs, sheets', cls: 'shadow-lg', stamp: false },
              { name: 'stamp', desc: 'signature moment · use rarely', cls: 'shadow-stamp', stamp: true },
            ] as const
          ).map(({ name, desc, cls, stamp }) => (
            <div key={name} className={cn('flex min-h-32 flex-col gap-2 rounded-xl bg-card p-4', cls, stamp ? 'border-[1.5px] border-ink-primary' : 'border border-border')}>
              <span className='text-sm font-bold text-ink-primary'>{name}</span>
              <span className='mt-auto text-[11px] text-ink-muted'>{desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ----- */}

      {/* Checkboxes */}
      <section className='space-y-4'>
        <h2 className='text-lg font-semibold'>Checkbox</h2>
        <div className='bg-surface-elevated flex flex-wrap gap-6 rounded-xl border border-border px-6 py-5'>
          <CheckboxRow label='Unchecked' />
          <CheckboxRow label='Checked' defaultChecked />
          <CheckboxRow label='Disabled' disabled />
          <CheckboxRow label='Disabled checked' disabled defaultChecked />
        </div>
      </section>

      {/* Badges */}
      <section className='space-y-4'>
        <h2 className='text-lg font-semibold'>Badges</h2>

        <div className='bg-surface-elevated overflow-auto rounded-xl border border-border'>
          <table className='w-full text-sm'>
            <thead className='bg-muted/50'>
              <tr>
                <th className='eyebrow px-4 py-3 text-left text-muted-foreground'>Variant</th>
                {COLORS.map((c) => (
                  <th key={c} className='eyebrow px-3 py-3 text-center text-muted-foreground'>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className='divide-y divide-border'>
              {VARIANTS.map((variant) => (
                <tr key={variant} className='hover:bg-muted/30'>
                  <td className='eyebrow px-4 py-3 text-muted-foreground'>{variant}</td>
                  {COLORS.map((color) => (
                    <td key={color} className='px-3 py-3 text-center'>
                      <Badge variant={variant} color={color}>
                        {color}
                      </Badge>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Toaster */}
      <section className='space-y-4'>
        <h2 className='text-lg font-semibold'>Toaster</h2>
        <div className='bg-surface-elevated flex flex-wrap gap-3 rounded-xl border border-border px-6 py-5'>
          <button className='rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground' onClick={() => toast('Default toast')}>
            Default
          </button>
          <button className='rounded-md bg-success px-3 py-1.5 text-sm text-white' onClick={() => toast.success('Success toast')}>
            Success
          </button>
          <button className='rounded-md bg-warning px-3 py-1.5 text-sm text-white' onClick={() => toast.warning('Warning toast')}>
            Warning
          </button>
          <button className='rounded-md bg-destructive px-3 py-1.5 text-sm text-white' onClick={() => toast.error('Error toast')}>
            Error
          </button>
          <button className='rounded-md bg-info px-3 py-1.5 text-sm text-white' onClick={() => toast.info('Info toast')}>
            Info
          </button>
          <button className='rounded-md bg-muted px-3 py-1.5 text-sm text-foreground' onClick={() => toast.loading('Loading…')}>
            Loading
          </button>
        </div>
      </section>
    </Page>
  )
}
