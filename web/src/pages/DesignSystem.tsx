import { Page } from '@/components/page'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { GameCard } from '@/components/game-card'
import { Button } from '@/components/atoms/button'
import { componentColorKeys } from '@/lib/colors'

// import React, { useState } from 'react'
// import { Badge, badgeColorKeys, badgeVariantKeys } from '@/components/badge'
// import { Checkbox } from '@/components/checkbox'
// import { toast } from 'sonner'

// const COLORS = badgeColorKeys
// const VARIANTS = badgeVariantKeys

// function CheckboxRow({ label, ...props }: { label: string } & React.ComponentProps<typeof Checkbox>) {
//   const [checked, setChecked] = useState(!!props.defaultChecked)
//   return (
//     <label className='flex cursor-pointer items-center gap-2 text-sm'>
//       <Checkbox checked={checked} onCheckedChange={(v) => setChecked(v === true)} {...props} />
//       {label}
//     </label>
//   )
// }

export default () => (
  <Page className='space-y-8'>
    <header className='flx flex-col gap-2'>
      <span className='eyebrow text-ink-muted'>v1 · foundations · patterns · components</span>
      <div className='flex w-full items-center justify-between'>
        <h1 className='text-5xl font-bold'>Design system</h1>
        <ThemeToggle />
      </div>
    </header>

    {/* Brand */}
    <section className='space-y-6'>
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
            <img src='/logo-ink.svg' width={80} height={80} className='hidden dark:block rounded-xl' />
            <img src='/logo-paper.svg' width={80} height={80} className='dark:hidden rounded-xl' />
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
          <img src='/logo-ink.svg' className='h-24 w-24 rounded-xl' />
          <p className='eyebrow text-center text-ink-muted'>Ink ground · default</p>
        </div>

        <div className='flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-5'>
          <img src='/logo-yellow.svg' className='h-24 w-24 rounded-xl' />
          <p className='eyebrow text-center text-ink-muted'>Yellow ground · home tile</p>
        </div>

        <div className='flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-5'>
          <img src='/logo-paper.svg' className='h-24 w-24 rounded-xl' />
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
              <div className={`h-14 w-18 border-[1.5px] border-ink-primary bg-yellow-secondary ${cls}`} />
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

    {/* Iconography */}
    <section className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold'>Iconography</h2>
        <p className='mt-1 text-sm text-ink-secondary'>
          Lucide, 1.75 stroke, 20×20 by default. Brand glyphs (tally bars, dice, podium) are custom SVGs and live in <code className='font-mono text-xs'>/icons/brand</code>.
        </p>
      </div>

      <div className='grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-2'>
        {[
          {
            label: 'chart',
            brand: false,
            path: (
              <>
                <path d='M3 3v18h18' />
                <path d='M7 14l4-4 4 3 5-6' />
              </>
            ),
          },
          {
            label: 'dice',
            brand: false,
            path: (
              <>
                <rect x='3' y='3' width='18' height='18' rx='3' />
                <circle cx='8' cy='8' r='1.3' />
                <circle cx='16' cy='16' r='1.3' />
                <circle cx='16' cy='8' r='1.3' />
                <circle cx='8' cy='16' r='1.3' />
                <circle cx='12' cy='12' r='1.3' />
              </>
            ),
          },
          {
            label: 'trophy',
            brand: false,
            path: (
              <>
                <path d='M6 9h12l-1 9H7z' />
                <path d='M9 9V6a3 3 0 016 0v3' />
              </>
            ),
          },
          {
            label: 'player',
            brand: false,
            path: (
              <>
                <circle cx='12' cy='8' r='4' />
                <path d='M4 21a8 8 0 0116 0' />
              </>
            ),
          },
          {
            label: 'session',
            brand: false,
            path: (
              <>
                <rect x='3' y='6' width='18' height='14' rx='2' />
                <path d='M8 6V4M16 6V4M3 11h18' />
              </>
            ),
          },
          {
            label: 'list',
            brand: false,
            path: (
              <>
                <path d='M4 7h16M4 12h16M4 17h10' />
              </>
            ),
          },
          {
            label: 'grid',
            brand: false,
            path: (
              <>
                <rect x='3' y='3' width='7' height='7' rx='1.5' />
                <rect x='14' y='3' width='7' height='7' rx='1.5' />
                <rect x='3' y='14' width='7' height='7' rx='1.5' />
                <rect x='14' y='14' width='7' height='7' rx='1.5' />
              </>
            ),
          },
          {
            label: 'search',
            brand: false,
            path: (
              <>
                <circle cx='11' cy='11' r='7' />
                <path d='M21 21l-4.3-4.3' />
              </>
            ),
          },
          {
            label: 'plus',
            brand: false,
            path: (
              <>
                <path d='M12 5v14M5 12h14' />
              </>
            ),
          },
        ].map(({ label, brand, path }) => (
          <div
            key={label}
            className={cn(
              'flex flex-col items-center gap-2 rounded-lg border border-border p-3 text-ink-primary',
              brand && 'border-yellow-tertiary/40 text-yellow-tertiary bg-yellow-secondary/40',
            )}
          >
            <svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.75' strokeLinecap='round' strokeLinejoin='round'>
              {path}
            </svg>
            <span className='font-mono text-[10px] text-ink-muted'>{label}</span>
          </div>
        ))}
        <div className='border-yellow-tertiary/40 text-yellow-tertiary flex flex-col items-center gap-2 rounded-lg border bg-yellow-secondary/40 p-3'>
          <img src='/logo-ink.svg' width={22} height={22} className='rounded-sm' />
          <span className='font-mono text-[10px] text-ink-muted'>
            tally <em className='text-ink-muted/60 not-italic'>brand</em>
          </span>
        </div>
      </div>
    </section>

    {/* Buttons */}
    <section className='space-y-6'>
      <div>
        <p className='eyebrow text-ink-muted'>02 — Components</p>
        <h2 className='mt-1 text-2xl font-bold'>Buttons</h2>
        <p className='mt-1 text-sm text-ink-secondary'>
          One primary per surface. Yellow is loud; reserve it for the single most important action. Four variants × twelve colors × four sizes.
        </p>
      </div>

      {/* Sizes & states */}
      <div className='space-y-4 rounded-xl border border-border bg-card p-5'>
        <p className='eyebrow text-ink-muted'>Sizes</p>
        <div className='flex flex-wrap items-end gap-4'>
          {([
            { size: 'small', label: '+ Log' },
            { size: 'default', label: '+ Log session' },
            { size: 'big', label: '+ Log session tonight' },
          ] as const).map(({ size, label }) => (
            <div key={size} className='flex flex-col items-center gap-1.5'>
              <Button size={size}>{label}</Button>
              <span className='eyebrow text-[10px] text-ink-muted'>{size}</span>
            </div>
          ))}
          <div className='flex flex-col items-center gap-1.5'>
            <Button size='icon' aria-label='Add session'>
              <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round'>
                <path d='M12 5v14M5 12h14' />
              </svg>
            </Button>
            <span className='eyebrow text-[10px] text-ink-muted'>icon</span>
          </div>
        </div>

        <p className='eyebrow text-ink-muted'>States</p>
        <div className='flex flex-wrap items-center gap-2'>
          <Button>Active</Button>
          <Button disabled>Disabled</Button>
          <Button variant='outline' color='secondary'>Active</Button>
          <Button variant='outline' color='secondary' disabled>Disabled</Button>
          <Button variant='ghost' color='secondary'>Active</Button>
          <Button variant='ghost' color='secondary' disabled>Disabled</Button>
          <Button variant='link'>Active</Button>
          <Button variant='link' disabled>Disabled</Button>
        </div>
      </div>

      {/* Color × variant matrix */}
      <div className='overflow-auto rounded-xl border border-border bg-card'>
        <table className='w-full'>
          <thead>
            <tr className='border-b border-border'>
              <th className='eyebrow px-4 py-3 text-left text-ink-muted'>color</th>
              <th className='eyebrow px-4 py-3 text-center text-ink-muted'>default</th>
              <th className='eyebrow px-4 py-3 text-center text-ink-muted'>outline</th>
              <th className='eyebrow px-4 py-3 text-center text-ink-muted'>ghost</th>
              <th className='eyebrow px-4 py-3 text-center text-ink-muted'>link</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-dashed divide-border'>
            {componentColorKeys.map((color) => (
              <tr key={color} className='hover:bg-paper-secondary/40'>
                <td className='px-4 py-2.5'>
                  <code className='font-mono text-xs text-ink-muted'>{color}</code>
                </td>
                <td className='px-4 py-2.5 text-center'>
                  <Button color={color} size='small'>{color}</Button>
                </td>
                <td className='px-4 py-2.5 text-center'>
                  <Button variant='outline' color={color} size='small'>{color}</Button>
                </td>
                <td className='px-4 py-2.5 text-center'>
                  <Button variant='ghost' color={color} size='small'>{color}</Button>
                </td>
                <td className='px-4 py-2.5 text-center'>
                  <Button variant='link' color={color} size='small'>{color}</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>

    {/* Inputs */}
    <section className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold'>Inputs</h2>
        <p className='mt-1 text-sm text-ink-secondary'>1px line border, paper-tinted fill, yellow focus ring. Heights match button heights so they line up in forms.</p>
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <label className='flex flex-col gap-1.5'>
          <span className='eyebrow text-ink-muted'>Game</span>
          <input className='input' type='text' defaultValue='Rumikubi' />
        </label>

        <label className='flex flex-col gap-1.5'>
          <span className='eyebrow text-ink-muted'>Date</span>
          <input className='input' type='text' placeholder='May 6, 2024' />
        </label>

        <label className='flex flex-col gap-1.5'>
          <span className='eyebrow text-ink-muted'>Search</span>
          <div className='relative'>
            <svg
              className='pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-muted'
              width='16'
              height='16'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='1.75'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <circle cx='11' cy='11' r='7' />
              <path d='M21 21l-4.3-4.3' />
            </svg>
            <input className='input pl-9' type='text' placeholder='Find a game in your library' />
          </div>
        </label>

        <label className='flex flex-col gap-1.5'>
          <span className='eyebrow text-ink-muted'>Player count</span>
          <select className='input cursor-pointer'>
            <option>2 players</option>
            <option>3 players</option>
            <option>4 players</option>
          </select>
        </label>

        <label className='flex flex-col gap-1.5'>
          <span className='eyebrow text-ink-muted'>Notes</span>
          <textarea className='input min-h-18 resize-y py-2.5 leading-relaxed' rows={3} placeholder='What happened?' />
        </label>

        <div className='flex flex-col gap-1.5'>
          <span className='eyebrow text-ink-muted'>Disabled / error</span>
          <input className='input cursor-not-allowed opacity-50' type='text' defaultValue='--' disabled />
          <input className='input mt-2 border-loss bg-loss/6 focus:ring-loss/30' type='text' defaultValue="Two of these — that's the wrong number." />
          <span className='text-xs text-loss'>Each player can only appear once per session.</span>
        </div>
      </div>

      <div className='space-y-3'>
        <p className='eyebrow text-ink-muted'>Segmented control</p>
        <div className='flex flex-wrap gap-4'>
          <div className='inline-flex gap-0.5 rounded-md border border-border bg-paper-secondary p-0.5' role='tablist' aria-label='Ownership'>
            {(['All', 'Owned', "Friends'", 'Rented'] as const).map((opt, i) => (
              <button
                key={opt}
                role='tab'
                className={cn(
                  'rounded-[5px] px-3 py-1.5 text-sm font-medium transition-colors',
                  i === 0 ? 'bg-card font-semibold text-ink-primary shadow-xs' : 'text-ink-secondary hover:text-ink-primary',
                )}
              >
                {opt}
              </button>
            ))}
          </div>

          <div className='inline-flex gap-0.5 rounded-md border border-border bg-paper-secondary p-0.5' role='tablist' aria-label='Duration'>
            {(['15m', '30m', '~1h', '2h+'] as const).map((opt, i) => (
              <button
                key={opt}
                role='tab'
                className={cn(
                  'rounded-[5px] px-3 py-1.5 text-sm font-medium transition-colors',
                  i === 2 ? 'bg-card font-semibold text-ink-primary shadow-xs' : 'text-ink-secondary hover:text-ink-primary',
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>

    {/* Chips & Pills */}
    <section className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold'>Chips & Pills</h2>
        <p className='mt-1 text-sm text-ink-secondary'>
          Two shapes, one job each. <strong>Pills</strong> are rounded; they carry status and selection. <strong>Chips</strong> are squared; they carry metadata (player counts,
          times, tags).
        </p>
      </div>

      <div className='space-y-4 rounded-xl border border-border bg-card p-5'>
        <p className='eyebrow text-ink-muted'>Pill — selection & status</p>
        <div className='flex flex-wrap items-center gap-2'>
          <span className='inline-flex h-7 items-center rounded-full border border-border bg-card px-3 text-sm font-medium text-ink-primary'>Default</span>
          <span className='inline-flex h-7 items-center rounded-full border border-ink-primary bg-ink-primary px-3 text-sm font-medium text-paper-primary'>Selected</span>
          <span className='border-yellow-tertiary/35 inline-flex h-7 items-center rounded-full border bg-yellow-secondary px-3 text-sm font-medium text-ink-primary'>Soft</span>
          <span className='inline-flex h-7 items-center rounded-full border border-dashed border-border bg-transparent px-3 text-sm font-medium text-ink-muted'>+ add</span>
          <span className='inline-flex h-7 items-center gap-1.5 rounded-full border border-border bg-card pr-1 pl-1.5 text-sm font-medium text-ink-primary'>
            <span
              className='inline-flex h-4.5 w-4.5 items-center justify-center rounded-full border border-black/10 text-[10px] font-bold text-ink-primary'
              style={{ background: 'var(--player-a)' }}
            >
              A
            </span>
            Alyne
            <button
              aria-label='remove'
              className='ml-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full text-base leading-none text-ink-muted hover:bg-paper-secondary hover:text-ink-primary'
            >
              ×
            </button>
          </span>
        </div>

        <p className='eyebrow text-ink-muted'>Chip — metadata</p>
        <div className='flex flex-wrap items-center gap-2'>
          <span className='inline-flex h-6 items-center rounded-sm border border-border bg-paper-secondary px-2 font-mono text-[11.5px] font-medium text-ink-primary'>
            2–4 players
          </span>
          <span className='inline-flex h-6 items-center rounded-sm border border-border bg-paper-secondary px-2 font-mono text-[11.5px] font-medium text-ink-primary'>~45 min</span>
          <span className='inline-flex h-6 items-center rounded-sm border border-border bg-paper-secondary px-2 font-mono text-[11.5px] font-medium text-ink-primary'>
            strategy
          </span>
          <span className='border-yellow-tertiary/40 inline-flex h-6 items-center rounded-sm border bg-yellow-secondary px-2 font-mono text-[11.5px] font-medium text-ink-primary'>
            ★ best for 3
          </span>
          <span className='inline-flex h-6 items-center rounded-sm border border-win/30 bg-win/14 px-2 font-mono text-[11.5px] font-medium text-ink-primary'>🥇 Alyne · 5</span>
          <span className='inline-flex h-6 items-center rounded-sm border border-border bg-card px-2 font-mono text-[11.5px] font-medium text-ink-primary'>🥈 Marina · 3</span>
          <span className='inline-flex h-6 items-center rounded-sm border border-loss/30 bg-loss/12 px-2 font-mono text-[11.5px] font-medium text-ink-primary'>🔥 3 streak</span>
        </div>

        <p className='eyebrow text-ink-muted'>Status badge — ownership</p>
        <div className='flex flex-wrap items-center gap-2'>
          <span className='border-yellow-tertiary inline-flex items-center rounded-lg border bg-yellow-primary px-2 py-0.5 font-mono text-[10px] font-bold tracking-[1.2px] text-ink-primary uppercase'>
            OWN
          </span>
          <span className='inline-flex items-center rounded-lg border border-player-b/60 bg-player-b px-2 py-0.5 font-mono text-[10px] font-bold tracking-[1.2px] text-ink-primary uppercase'>
            FRIEND
          </span>
          <span className='inline-flex items-center rounded-lg border border-player-a/60 bg-player-a px-2 py-0.5 font-mono text-[10px] font-bold tracking-[1.2px] text-ink-primary uppercase'>
            RENT
          </span>
          <span className='inline-flex items-center rounded-lg border border-ink-primary bg-ink-primary px-2 py-0.5 font-mono text-[10px] font-bold tracking-[1.2px] text-paper-primary uppercase'>
            NEW
          </span>
        </div>
      </div>
    </section>

    {/* Avatars */}
    <section className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold'>Avatars & Player marks</h2>
        <p className='mt-1 text-sm text-ink-secondary'>
          Initial-based, colored per-player. Color is assigned at player creation and never changes — that's how someone becomes "the pink one".
        </p>
      </div>

      <div className='space-y-4 rounded-xl border border-border bg-card p-5'>
        <p className='eyebrow text-ink-muted'>Sizes</p>
        <div className='flex flex-wrap items-center gap-4'>
          <span
            className='inline-flex h-5 w-5 items-center justify-center rounded-full border border-ink-primary font-sans text-[10px] font-bold text-ink-primary'
            style={{ background: 'var(--player-a)' }}
          >
            A
          </span>
          <span
            className='inline-flex h-7 w-7 items-center justify-center rounded-full border border-ink-primary font-sans text-xs font-bold text-ink-primary'
            style={{ background: 'var(--player-a)' }}
          >
            A
          </span>
          <span
            className='inline-flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-ink-primary font-sans text-sm font-bold text-ink-primary'
            style={{ background: 'var(--player-a)' }}
          >
            A
          </span>
          <span
            className='inline-flex h-14 w-14 items-center justify-center rounded-full border-2 border-ink-primary font-sans text-[22px] font-bold text-ink-primary'
            style={{ background: 'var(--player-a)' }}
          >
            A
          </span>
          <span
            className='inline-flex h-22 w-22 items-center justify-center rounded-full border-[2.5px] border-ink-primary font-sans text-4xl font-bold text-ink-primary'
            style={{ background: 'var(--player-a)' }}
          >
            A
          </span>
          <span className='text-xs text-ink-muted'>xs 20 · sm 28 · md 36 · lg 56 · xl 88</span>
        </div>

        <p className='eyebrow text-ink-muted'>Player palette</p>
        <div className='flex flex-wrap items-center gap-3'>
          {(
            [
              { p: 'a', initial: 'A' },
              { p: 'b', initial: 'M' },
              { p: 'c', initial: 'G' },
              { p: 'd', initial: 'L' },
              { p: 'e', initial: 'J' },
              { p: 'f', initial: 'K' },
            ] as const
          ).map(({ p, initial }) => (
            <span
              key={p}
              className='inline-flex h-14 w-14 items-center justify-center rounded-full border-2 border-ink-primary font-sans text-[22px] font-bold text-ink-primary'
              style={{ background: `var(--player-${p})` }}
            >
              {initial}
            </span>
          ))}
        </div>

        <p className='eyebrow text-ink-muted'>Stack & with rank</p>
        <div className='flex flex-wrap items-center gap-8'>
          <div className='flex items-center'>
            {(['a', 'b', 'c'] as const).map((p, i) => (
              <span
                key={p}
                className='inline-flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-ink-primary font-sans text-sm font-bold text-ink-primary'
                style={{ background: `var(--player-${p})`, marginLeft: i === 0 ? 0 : '-10px', boxShadow: '0 0 0 2px var(--card)' }}
              >
                {['A', 'M', 'G'][i]}
              </span>
            ))}
            <span
              className='inline-flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-ink-primary bg-paper-secondary font-mono text-xs font-semibold text-ink-primary'
              style={{ marginLeft: '-10px', boxShadow: '0 0 0 2px var(--card)' }}
            >
              +2
            </span>
          </div>

          {(
            [
              { medal: '🥇', p: 'a', initial: 'A' },
              { medal: '🥈', p: 'b', initial: 'M' },
              { medal: '🥉', p: 'c', initial: 'G' },
            ] as const
          ).map(({ medal, p, initial }) => (
            <div key={p} className='flex flex-col items-center gap-1'>
              <span className='text-lg'>{medal}</span>
              <span
                className='inline-flex h-14 w-14 items-center justify-center rounded-full border-2 border-ink-primary font-sans text-[22px] font-bold text-ink-primary'
                style={{ background: `var(--player-${p})` }}
              >
                {initial}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Cards */}
    <section className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold'>Cards</h2>
        <p className='mt-1 text-sm text-ink-secondary'>
          One radius (12px), one resting shadow, one hover state. Variants differ by <em>content density</em>, not by visual style.
        </p>
      </div>

      <div className='grid grid-cols-3 gap-4'>
        <div className='rounded-xl border border-border bg-card p-5 shadow-sm'>
          <p className='eyebrow text-ink-muted'>Default · resting</p>
          <h3 className='my-1.5 text-lg font-bold'>Recent sessions</h3>
          <p className='text-sm text-ink-muted'>Wraps any content. Pad 16/20.</p>
        </div>

        <div className='cursor-pointer rounded-xl border border-border bg-card p-5 shadow-sm transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-md'>
          <p className='eyebrow text-ink-muted'>Hoverable</p>
          <h3 className='my-1.5 text-lg font-bold'>Tap me</h3>
          <p className='text-sm text-ink-muted'>Lifts on hover. Use for navigable cards.</p>
        </div>

        <div className='border-yellow-tertiary rounded-xl border bg-yellow-primary p-5'>
          <p className='eyebrow text-ink-primary/70'>Accent · key moment</p>
          <h3 className='my-1.5 text-lg font-bold text-ink-primary'>Play tonight</h3>
          <p className='text-sm text-ink-primary'>Yellow ground — at most one per screen.</p>
        </div>
      </div>

      <div>
        <p className='eyebrow mb-3 text-ink-muted'>List row</p>
        <div className='overflow-hidden rounded-xl border border-border bg-card shadow-sm'>
          {(
            [
              { title: 'Rumikubi', meta: '2 sessions · 2–4p · own', stars: '★★★★' },
              { title: 'Hearthstone', meta: '1 session · friend · Marina', stars: '★★★' },
              { title: 'Sushi Go!', meta: '0 sessions · 2–5p · own', stars: '★★' },
            ] as const
          ).map(({ title, meta, stars }, i, arr) => (
            <div key={title} className={cn('grid grid-cols-[44px_1fr_auto_auto] items-center gap-3.5 px-4 py-3', i < arr.length - 1 && 'border-b border-dashed border-border')}>
              <div
                className='h-11 w-11 rounded-lg border border-border'
                style={{ background: 'repeating-linear-gradient(135deg, var(--paper-secondary) 0 6px, var(--paper-muted) 6px 12px)' }}
              />
              <div className='flex flex-col gap-0.5'>
                <span className='text-[15px] font-semibold text-ink-primary'>{title}</span>
                <span className='text-xs text-ink-muted'>{meta}</span>
              </div>
              <span className='inline-flex h-6 items-center rounded-sm border border-border bg-paper-secondary px-2 font-mono text-[11.5px] text-ink-primary'>{stars}</span>
              <button className='inline-flex h-7.5 cursor-pointer items-center rounded-md border border-transparent bg-transparent px-2.5 text-xs font-semibold text-ink-secondary transition-colors hover:bg-paper-secondary hover:text-ink-primary'>
                Open
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Navigation */}
    <section className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold'>Navigation</h2>
        <p className='mt-1 text-sm text-ink-secondary'>Desktop has a left rail. Mobile has a bottom tab bar with the FAB floating above. Both share the same 5 destinations.</p>
      </div>

      <div className='grid grid-cols-2 gap-4'>
        {/* Sidebar mock */}
        <div className='overflow-hidden rounded-xl border border-border bg-card shadow-sm'>
          <p className='eyebrow px-4 pt-3.5 pb-2 text-ink-muted'>Sidebar — desktop</p>
          <div className='border-t border-border bg-paper-primary px-3.5 py-3'>
            <div className='mb-2 flex items-center gap-2.5 border-b border-dashed border-border pb-3'>
              <svg width='22' height='22' viewBox='0 0 64 64'>
                <rect width='64' height='64' rx='14' style={{ fill: 'var(--ink-primary)' }} />
                <rect x='13' y='16' width='5' height='32' rx='1.5' style={{ fill: 'var(--paper-primary)' }} />
                <rect x='22' y='16' width='5' height='32' rx='1.5' style={{ fill: 'var(--paper-primary)' }} />
                <rect x='31' y='16' width='5' height='32' rx='1.5' style={{ fill: 'var(--paper-primary)' }} />
                <rect x='40' y='16' width='5' height='32' rx='1.5' style={{ fill: 'var(--paper-primary)' }} />
                <path d='M9 49 L52 15' strokeWidth='6' strokeLinecap='round' fill='none' style={{ stroke: 'var(--yellow-primary)' }} />
              </svg>
              <span className='text-base font-extrabold text-ink-primary'>Tally</span>
            </div>
            <div className='flex flex-col gap-0.5'>
              {(
                [
                  { icon: '⌂', label: 'Home', active: true, dot: false, cta: false },
                  { icon: '▦', label: 'Library', active: false, dot: false, cta: false },
                  { icon: '◔', label: 'Sessions', active: false, dot: true, cta: false },
                  { icon: '◉', label: 'Players', active: false, dot: false, cta: false },
                  { icon: '🏪', label: 'Shops', active: false, dot: false, cta: false },
                ] as const
              ).map(({ icon, label, active, dot }) => (
                <div
                  key={label}
                  className={cn(
                    'flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-[13.5px] transition-colors',
                    active ? 'bg-paper-secondary font-semibold text-ink-primary' : 'text-ink-secondary hover:bg-paper-secondary hover:text-ink-primary',
                  )}
                >
                  <span className={cn('w-5 text-center text-sm', active ? 'text-yellow-tertiary' : 'text-ink-muted')}>{icon}</span>
                  {label}
                  {dot && <span className='ml-auto h-1.5 w-1.5 rounded-full bg-yellow-primary' style={{ boxShadow: '0 0 0 2px var(--paper-primary)' }} />}
                </div>
              ))}
              <div className='my-2 h-px bg-border' />
              <div className='flex cursor-pointer items-center gap-2.5 rounded-md bg-ink-primary px-2.5 py-2 text-[13.5px] font-semibold text-paper-primary hover:bg-ink-secondary'>
                <span className='w-5 text-center text-sm text-yellow-primary'>+</span>
                Log session
                <kbd className='ml-auto rounded px-1.5 py-0.5 font-mono text-[10px]' style={{ background: 'rgba(255,255,255,0.1)' }}>
                  ⌘N
                </kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom tab bar mock */}
        <div className='overflow-hidden rounded-xl border border-border bg-card shadow-sm'>
          <p className='eyebrow px-4 pt-3.5 pb-2 text-ink-muted'>Bottom tab bar — mobile</p>
          <div className='relative flex h-70 flex-col border-t border-border bg-paper-primary'>
            <div className='flex flex-1 flex-col gap-2.5 p-4'>
              <div className='h-14 rounded-lg border border-dashed border-border bg-card' />
              <div className='h-14 w-[70%] rounded-lg border border-dashed border-border bg-card' />
              <div className='h-14 rounded-lg border border-dashed border-border bg-card' />
            </div>
            <button
              aria-label='Log session'
              className='absolute right-4 bottom-17 inline-flex h-13 w-13 items-center justify-center rounded-full border-[1.5px] border-ink-primary bg-yellow-primary text-ink-primary shadow-stamp'
            >
              <svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round'>
                <path d='M12 5v14M5 12h14' />
              </svg>
            </button>
            <div className='grid grid-cols-4 border-t border-border bg-card'>
              {(
                [
                  { icon: '⌂', label: 'Home', active: true },
                  { icon: '▦', label: 'Library', active: false },
                  { icon: '◔', label: 'Plays', active: false },
                  { icon: '◉', label: 'Crew', active: false },
                ] as const
              ).map(({ icon, label, active }) => (
                <div
                  key={label}
                  className={cn('flex flex-col items-center gap-1 py-2.5 font-mono text-[10px] tracking-[0.6px]', active ? 'font-bold text-ink-primary' : 'text-ink-muted')}
                >
                  <span className='text-lg'>{icon}</span>
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top bar */}
      <div>
        <p className='eyebrow mb-3 text-ink-muted'>Top bar — surface header</p>
        <div className='flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3.5 shadow-sm'>
          <div className='flex flex-col gap-0.5'>
            <h3 className='text-lg leading-none font-bold'>Library</h3>
            <span className='text-xs text-ink-muted'>12 games</span>
          </div>
          <div className='flex items-center gap-2'>
            <span className='inline-flex h-6 cursor-pointer items-center rounded-sm border border-border bg-paper-secondary px-2 font-mono text-[11.5px] text-ink-primary'>
              All ▾
            </span>
            <span className='inline-flex h-6 cursor-pointer items-center rounded-sm border border-border bg-paper-secondary px-2 font-mono text-[11.5px] text-ink-primary'>
              Sort: recent ▾
            </span>
            <button className='border-yellow-tertiary hover:bg-yellow-tertiary inline-flex h-7.5 cursor-pointer items-center gap-1.5 rounded-md border bg-yellow-primary px-2.5 text-xs font-semibold text-ink-primary transition-colors'>
              + Add game
            </button>
          </div>
        </div>
      </div>
    </section>

    {/* Feedback */}
    <section className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold'>Feedback</h2>
        <p className='mt-1 text-sm text-ink-secondary'>
          Toasts in the bottom-left. Banners inline at the top of a surface. Both auto-dismiss for non-blocking news; require a tap for "you did a thing".
        </p>
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div className='flex items-center gap-3 rounded-lg bg-ink-primary px-3.5 py-3 shadow-md'>
          <span className='inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-yellow-primary text-[13px] font-bold text-ink-primary'>✓</span>
          <div className='flex flex-1 flex-col gap-0.5'>
            <span className='text-sm font-bold text-paper-primary'>Session logged.</span>
            <span className='text-xs' style={{ color: 'color-mix(in oklch, var(--paper-primary) 60%, transparent)' }}>
              Alyne · Rumikubi · 4 players
            </span>
          </div>
          <button className='inline-flex h-7.5 cursor-pointer items-center rounded-md px-2.5 text-xs font-semibold text-yellow-primary transition-colors hover:bg-white/8'>
            Undo
          </button>
        </div>

        <div className='flex items-center gap-3 rounded-lg bg-ink-primary px-3.5 py-3 shadow-md'>
          <span className='inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-loss text-[13px] font-bold text-paper-primary'>!</span>
          <div className='flex flex-1 flex-col gap-0.5'>
            <span className='text-sm font-bold text-paper-primary'>Couldn't save</span>
            <span className='text-xs' style={{ color: 'color-mix(in oklch, var(--paper-primary) 60%, transparent)' }}>
              Try again — you'll keep what you entered.
            </span>
          </div>
          <button className='inline-flex h-7.5 cursor-pointer items-center rounded-md px-2.5 text-xs font-semibold text-yellow-primary transition-colors hover:bg-white/8'>
            Retry
          </button>
        </div>
      </div>

      <div>
        <p className='eyebrow mb-3 text-ink-muted'>Banner</p>
        <div className='border-yellow-tertiary/35 flex items-center justify-between gap-4 rounded-lg border bg-yellow-secondary px-4 py-3.5'>
          <div className='flex flex-col gap-0.5'>
            <span className='text-sm font-bold text-ink-primary'>BG3 is due back to Joy Joy in 2 days.</span>
            <span className='text-xs text-ink-secondary'>Renew rental or mark returned.</span>
          </div>
          <button className='inline-flex h-7.5 shrink-0 cursor-pointer items-center rounded-md border border-border bg-card px-2.5 text-xs font-semibold text-ink-primary transition-colors hover:border-ink-muted hover:bg-paper-secondary'>
            Manage rental
          </button>
        </div>
      </div>
    </section>

    {/* Leaderboard */}
    <section className='space-y-6'>
      <div>
        <p className='eyebrow text-ink-muted'>03 — Tally patterns</p>
        <h2 className='mt-1 text-2xl font-bold'>Leaderboard row</h2>
        <p className='mt-1 text-sm text-ink-secondary'>
          The most-touched component in the app. Avatar · name · score · trend, with an emphasis on <em>change</em>, not just standing.
        </p>
      </div>

      <div className='overflow-hidden rounded-xl border border-border bg-card shadow-sm'>
        {(
          [
            { rank: 1, p: 'a', initial: 'A', name: 'Alyne', meta: '3 sessions · 67% win', streak: '🔥 3', score: 9, delta: '▲ 2', trend: 'up' },
            { rank: 2, p: 'b', initial: 'M', name: 'Marina', meta: '3 sessions · 33% win', streak: null, score: 5, delta: '—', trend: 'flat' },
            { rank: 3, p: 'c', initial: 'G', name: 'Guillain', meta: '2 sessions · 0% win', streak: null, score: 2, delta: '▼ 1', trend: 'down' },
            { rank: 4, p: 'd', initial: 'L', name: 'Lukan', meta: '1 session · 0% win', streak: null, score: 1, delta: '—', trend: 'flat' },
          ] as const
        ).map(({ rank, p, initial, name, meta, streak, score, delta, trend }, i, arr) => (
          <div
            key={name}
            className={cn(
              'grid items-center gap-3.5 px-4 py-3',
              'grid-cols-[32px_56px_1fr_auto_50px_50px]',
              i < arr.length - 1 && 'border-b border-dashed border-border',
              rank === 1 && 'bg-yellow-secondary/50',
            )}
          >
            <span className={cn('text-center font-mono text-base font-bold', rank === 1 ? 'text-yellow-tertiary' : 'text-ink-primary')}>{rank}</span>
            <span
              className='inline-flex h-14 w-14 items-center justify-center rounded-full border-2 border-ink-primary font-sans text-[22px] font-bold text-ink-primary'
              style={{ background: `var(--player-${p})` }}
            >
              {initial}
            </span>
            <div className='flex flex-col gap-0.5'>
              <span className='text-base font-bold text-ink-primary'>{name}</span>
              <span className='text-xs text-ink-muted'>{meta}</span>
            </div>
            {streak ? (
              <span className='inline-flex h-6 items-center rounded-sm border border-loss/30 bg-loss/12 px-2 font-mono text-[11.5px] text-ink-primary'>{streak}</span>
            ) : (
              <span className='inline-flex h-6 items-center rounded-sm border border-border bg-paper-secondary px-2 font-mono text-[11.5px] text-ink-primary'>—</span>
            )}
            <span className='text-right font-mono text-[22px] font-bold text-ink-primary'>{score}</span>
            <span className={cn('text-right font-mono text-xs font-semibold', trend === 'up' ? 'text-win' : trend === 'down' ? 'text-loss' : 'text-ink-muted')}>{delta}</span>
          </div>
        ))}
      </div>
    </section>

    {/* Podium */}
    <section className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold'>Podium</h2>
        <p className='mt-1 text-sm text-ink-secondary'>Used at the top of Home and at the end of a session. Three columns; the winner is taller, centered, with yellow paper.</p>
      </div>

      <div className='rounded-xl border border-border bg-card p-6 shadow-sm'>
        <p className='eyebrow mb-6 text-center text-ink-muted'>Reigning champion · this week</p>
        <div className='grid grid-cols-3 items-end gap-2'>
          {/* 2nd */}
          <div className='flex flex-col items-center gap-1.5 text-center'>
            <span
              className='inline-flex h-14 w-14 items-center justify-center rounded-full border-2 border-ink-primary font-sans text-[22px] font-bold text-ink-primary'
              style={{ background: 'var(--player-b)' }}
            >
              M
            </span>
            <span className='text-[15px] font-bold text-ink-primary'>Marina</span>
            <span className='text-xs text-ink-muted'>5 pts</span>
            <div className='mt-1.5 flex h-20 w-full items-center justify-center rounded-t-lg border-[1.5px] border-ink-primary bg-paper-secondary font-mono text-xl font-bold text-ink-primary'>
              2
            </div>
          </div>
          {/* 1st */}
          <div className='flex -translate-y-3 flex-col items-center gap-1.5 text-center'>
            <span
              className='inline-flex h-22 w-22 items-center justify-center rounded-full border-[2.5px] border-ink-primary font-sans text-4xl font-bold text-ink-primary'
              style={{ background: 'var(--player-a)' }}
            >
              A
            </span>
            <span className='text-[15px] font-bold text-ink-primary'>Alyne</span>
            <span className='text-xs text-ink-muted'>9 pts · 🔥 3</span>
            <div className='mt-1.5 flex h-27.5 w-full items-center justify-center rounded-t-lg border-[1.5px] border-ink-primary bg-yellow-primary font-mono text-xl font-bold text-ink-primary'>
              1
            </div>
          </div>
          {/* 3rd */}
          <div className='flex flex-col items-center gap-1.5 text-center'>
            <span
              className='inline-flex h-14 w-14 items-center justify-center rounded-full border-2 border-ink-primary font-sans text-[22px] font-bold text-ink-primary'
              style={{ background: 'var(--player-c)' }}
            >
              G
            </span>
            <span className='text-[15px] font-bold text-ink-primary'>Guillain</span>
            <span className='text-xs text-ink-muted'>2 pts</span>
            <div className='mt-1.5 flex h-14 w-full items-center justify-center rounded-t-lg border-[1.5px] border-ink-primary bg-paper-secondary font-mono text-xl font-bold text-ink-primary opacity-80'>
              3
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Game card */}
    <section className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold'>Game card</h2>
        <p className='mt-1 text-sm text-ink-secondary'>
          Two density modes. The rich card carries cover art and ownership; the row variant earns its place when there are 20+ games.
        </p>
      </div>

      <div>
        <p className='eyebrow mb-3 text-ink-muted'>Current Card · grid</p>
        <div className='grid grid-cols-4 gap-3.5'>
          {(
            [
              {
                id: 1,
                name: 'Hearthstone',
                session_count: 0,
              },
              {
                id: 2,
                name: 'Catan',
                session_count: 14,
              },
              {
                id: 3,
                name: 'Ticket to Ride',
                session_count: 7,
              },
              {
                id: 4,
                name: 'Wingspan',
                session_count: 23,
              },
              {
                id: 5,
                name: 'Pandemic',
                session_count: 5,
              },
              {
                id: 6,
                name: 'Codenames',
                session_count: 31,
              },
              {
                id: 7,
                name: 'Azul',
                session_count: 9,
              },
              {
                id: 8,
                name: 'Gloomhaven',
                session_count: 2,
              },
              {
                id: 9,
                name: 'Terraforming Mars',
                session_count: 18,
              },
              {
                id: 10,
                name: 'Betrayal at House on the Hill',
                session_count: 4,
              },
              {
                id: 11,
                name: 'Dominion',
                session_count: 11,
              },
              {
                id: 12,
                name: '7 Wonders',
                session_count: 16,
              },
            ] as const
          ).map((game, index) => (
            <GameCard key={index} {...game} />
          ))}
        </div>
      </div>

      <div>
        <p className='eyebrow mb-3 text-ink-muted'>Rich · grid</p>
        <div className='grid grid-cols-4 gap-3.5'>
          {(
            [
              {
                title: 'Rumikubi',
                meta: '2 sessions · 2–4p',
                badge: 'OWN',
                badgeCls: 'bg-yellow-primary border-yellow-tertiary text-ink-primary',
                art: 'repeating-linear-gradient(135deg, #e8e2d0 0 8px, #dfd9c5 8px 16px)',
              },
              {
                title: 'Sushi Go!',
                meta: '0 sessions · 2–5p',
                badge: 'FRIEND',
                badgeCls: 'bg-player-b border-player-b/60 text-ink-primary',
                art: 'repeating-linear-gradient(45deg,  #e2e8d0 0 8px, #d5dfc5 8px 16px)',
              },
              {
                title: 'BG3',
                meta: 'Joy Joy · 7d left',
                badge: 'RENT',
                badgeCls: 'bg-player-a border-player-a/60 text-ink-primary',
                art: 'repeating-linear-gradient(135deg, #f0d4d4 0 8px, #e5c8c8 8px 16px)',
              },
              {
                title: 'Hearthstone',
                meta: '1 session · 3p',
                badge: 'OWN',
                badgeCls: 'bg-yellow-primary border-yellow-tertiary text-ink-primary',
                art: 'repeating-linear-gradient(45deg,  #d8d4e8 0 8px, #c8c4dc 8px 16px)',
              },
            ] as const
          ).map(({ title, meta, badge, badgeCls, art }) => (
            <article
              key={title}
              className='flex cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-md'
            >
              <div className='relative aspect-3/4 border-b border-border'>
                <div className='h-full w-full' style={{ background: art }} />
                <span
                  className={`absolute top-2.5 left-2.5 inline-flex items-center rounded-lg border px-2 py-0.5 font-mono text-[10px] font-bold tracking-[1.2px] uppercase ${badgeCls}`}
                >
                  {badge}
                </span>
              </div>
              <div className='px-3.5 pt-3 pb-3.5'>
                <h3 className='text-base leading-tight font-bold text-ink-primary'>{title}</h3>
                <p className='mt-0.5 text-xs text-ink-muted'>{meta}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div>
        <p className='eyebrow mb-3 text-ink-muted'>Row · list</p>
        <div className='overflow-hidden rounded-xl border border-border bg-card shadow-sm'>
          {(
            [
              { title: 'Rumikubi', meta: '2 sess · 2–4p · own', chip: 'last May 6', art: 'repeating-linear-gradient(135deg, #e8e2d0 0 6px, #dfd9c5 6px 12px)' },
              { title: 'Sushi Go!', meta: '0 sess · 2–5p · own', chip: 'never played', art: 'repeating-linear-gradient(45deg,  #e2e8d0 0 6px, #d5dfc5 6px 12px)' },
            ] as const
          ).map(({ title, meta, chip, art }, i, arr) => (
            <div key={title} className={cn('grid grid-cols-[44px_1fr_auto] items-center gap-3.5 px-4 py-3', i < arr.length - 1 && 'border-b border-dashed border-border')}>
              <div className='h-11 w-11 rounded-lg border border-border' style={{ background: art }} />
              <div className='flex flex-col gap-0.5'>
                <span className='text-[15px] font-semibold text-ink-primary'>{title}</span>
                <span className='text-xs text-ink-muted'>{meta}</span>
              </div>
              <span className='inline-flex h-6 items-center rounded-sm border border-border bg-paper-secondary px-2 font-mono text-[11.5px] text-ink-primary'>{chip}</span>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Session card */}
    <section className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold'>Session card</h2>
        <p className='mt-1 text-sm text-ink-secondary'>
          The atom of the timeline. Shows the game, the ranking, the date, and (optionally) a note. Tap anywhere to see the full session.
        </p>
      </div>

      <div className='grid grid-cols-2 gap-4'>
        {/* Full card */}
        <article className='flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm'>
          <header className='flex items-start justify-between gap-3'>
            <div>
              <h3 className='text-lg font-bold text-ink-primary'>Rumikubi</h3>
              <span className='text-xs text-ink-muted'>May 6 · 45 min · 4 players</span>
            </div>
            <span className='border-yellow-tertiary/40 inline-flex h-6 shrink-0 items-center rounded-sm border bg-yellow-secondary px-2 font-mono text-[11.5px] text-ink-primary'>
              ★ best run
            </span>
          </header>

          <ol className='flex flex-col divide-y divide-dashed divide-border'>
            {(
              [
                { medal: '🥇', p: 'a', initial: 'A', name: 'Alyne', score: 5, first: true },
                { medal: '🥈', p: 'b', initial: 'M', name: 'Marina', score: 3, first: false },
                { medal: '🥉', p: 'd', initial: 'L', name: 'Lukan', score: 2, first: false },
                { medal: '4', p: 'c', initial: 'G', name: 'Guillain', score: 1, first: false },
              ] as const
            ).map(({ medal, p, initial, name, score, first }) => (
              <li key={name} className='grid grid-cols-[28px_36px_1fr_auto] items-center gap-3 py-1.5'>
                <span className='text-center font-mono text-sm font-bold text-ink-muted'>{medal}</span>
                <span
                  className='inline-flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-ink-primary font-sans text-sm font-bold text-ink-primary'
                  style={{ background: `var(--player-${p})` }}
                >
                  {initial}
                </span>
                <span className={cn('text-[14.5px]', first && 'font-bold')}>{name}</span>
                <span className={cn('font-mono text-sm font-bold', first ? 'text-yellow-tertiary' : 'text-ink-primary')}>{score}</span>
              </li>
            ))}
          </ol>

          <p className='rounded-r-lg border-l-[3px] border-yellow-primary bg-paper-secondary px-3.5 py-2.5 font-callout text-base leading-snug text-ink-secondary'>
            "Alyne pulled off the runs win at the last second. Marina is plotting revenge."
          </p>
        </article>

        {/* Compact card */}
        <article className='flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm'>
          <header>
            <h3 className='text-lg font-bold text-ink-primary'>Hearthstone</h3>
            <span className='text-xs text-ink-muted'>May 3 · 25 min · 3 players</span>
          </header>

          <ol className='flex flex-col divide-y divide-dashed divide-border'>
            {(
              [
                { medal: '🥇', p: 'b', initial: 'M', name: 'Marina', first: true },
                { medal: '2', p: 'a', initial: 'A', name: 'Alyne', first: false },
                { medal: '3', p: 'd', initial: 'L', name: 'Lukan', first: false },
              ] as const
            ).map(({ medal, p, initial, name, first }) => (
              <li key={name} className='grid grid-cols-[28px_36px_1fr] items-center gap-3 py-1.5'>
                <span className='text-center font-mono text-sm font-bold text-ink-muted'>{medal}</span>
                <span
                  className='inline-flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-ink-primary font-sans text-sm font-bold text-ink-primary'
                  style={{ background: `var(--player-${p})` }}
                >
                  {initial}
                </span>
                <span className={cn('text-[14.5px]', first && 'font-bold')}>{name}</span>
              </li>
            ))}
          </ol>

          <footer className='flex gap-2 border-t border-dashed border-border pt-2'>
            <button className='inline-flex h-7.5 cursor-pointer items-center rounded-md px-2.5 text-xs font-semibold text-ink-secondary transition-colors hover:bg-paper-secondary hover:text-ink-primary'>
              View detail
            </button>
            <button className='inline-flex h-7.5 cursor-pointer items-center rounded-md px-2.5 text-xs font-semibold text-ink-secondary transition-colors hover:bg-paper-secondary hover:text-ink-primary'>
              Rematch
            </button>
          </footer>
        </article>
      </div>
    </section>

    {/* Player profile header */}
    <section className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold'>Player profile header</h2>
        <p className='mt-1 text-sm text-ink-secondary'>
          Lives on <code className='font-mono text-xs'>/players/&lt;name&gt;</code>. Hero block at top, then head-to-head and best-at modules below.
        </p>
      </div>

      <div className='grid grid-cols-[auto_1fr_auto] items-center gap-6 rounded-xl border border-border bg-card p-7 shadow-sm'>
        <span
          className='inline-flex h-22 w-22 items-center justify-center rounded-full border-[2.5px] border-ink-primary font-sans text-4xl font-bold text-ink-primary'
          style={{ background: 'var(--player-a)' }}
        >
          A
        </span>
        <div className='flex flex-col gap-2.5'>
          <h1 className='text-4xl leading-none font-extrabold tracking-tight text-ink-primary'>
            Alyne <span className='text-yellow-tertiary font-callout text-3xl'>— champion.</span>
          </h1>
          <div className='flex flex-wrap gap-1.5'>
            <span className='border-yellow-tertiary/40 inline-flex h-6 items-center rounded-sm border bg-yellow-secondary px-2 font-mono text-[11.5px] text-ink-primary'>
              9 pts
            </span>
            <span className='inline-flex h-6 items-center rounded-sm border border-border bg-paper-secondary px-2 font-mono text-[11.5px] text-ink-primary'>3 sessions</span>
            <span className='inline-flex h-6 items-center rounded-sm border border-border bg-paper-secondary px-2 font-mono text-[11.5px] text-ink-primary'>67% win</span>
            <span className='inline-flex h-6 items-center rounded-sm border border-loss/30 bg-loss/12 px-2 font-mono text-[11.5px] text-ink-primary'>🔥 3 streak</span>
          </div>
        </div>
        <div className='flex flex-col gap-2'>
          <button className='inline-flex h-7.5 cursor-pointer items-center rounded-md border border-border bg-card px-2.5 text-xs font-semibold text-ink-primary transition-colors hover:border-ink-muted hover:bg-paper-secondary'>
            Head-to-head
          </button>
          <button className='border-yellow-tertiary hover:bg-yellow-tertiary inline-flex h-7.5 cursor-pointer items-center rounded-md border bg-yellow-primary px-2.5 text-xs font-semibold text-ink-primary transition-colors'>
            + Log session
          </button>
        </div>
      </div>
    </section>

    {/* Empty state */}
    <section className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold'>Empty state</h2>
        <p className='mt-1 text-sm text-ink-secondary'>
          Always offers <em>the next action</em>. Never a sad mascot.
        </p>
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div className='flex flex-col items-center gap-2 rounded-xl border border-border bg-card px-6 py-9 text-center shadow-sm'>
          <div className='mb-2 flex h-20 w-20 items-center justify-center rounded-xl bg-paper-secondary'>
            <svg width='56' height='56' viewBox='0 0 64 64'>
              <rect width='64' height='64' rx='14' style={{ fill: 'var(--paper-secondary)' }} />
              <rect x='13' y='16' width='5' height='32' rx='1.5' style={{ fill: 'var(--ink-muted)' }} opacity='0.4' />
              <rect x='22' y='16' width='5' height='32' rx='1.5' style={{ fill: 'var(--ink-muted)' }} opacity='0.4' />
              <rect x='31' y='16' width='5' height='32' rx='1.5' style={{ fill: 'var(--ink-muted)' }} opacity='0.4' />
              <rect x='40' y='16' width='5' height='32' rx='1.5' style={{ fill: 'var(--ink-muted)' }} opacity='0.4' />
            </svg>
          </div>
          <h3 className='mt-1.5 text-lg font-bold text-ink-primary'>No sessions yet</h3>
          <p className='max-w-xs text-sm text-ink-muted'>Log your first game and the leaderboard starts filling in.</p>
          <button className='border-yellow-tertiary hover:bg-yellow-tertiary mt-2.5 inline-flex h-9.5 cursor-pointer items-center rounded-md border bg-yellow-primary px-3.5 text-sm font-semibold text-ink-primary transition-colors'>
            + Log first session
          </button>
        </div>

        <div className='flex flex-col items-center gap-2 rounded-xl border border-border bg-card px-6 py-9 text-center shadow-sm'>
          <div className='mb-2 flex h-20 w-20 items-center justify-center rounded-xl bg-paper-secondary'>
            <svg width='48' height='48' viewBox='0 0 24 24' fill='none' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' style={{ stroke: 'var(--ink-muted)' }}>
              <rect x='3' y='3' width='7' height='7' rx='1.5' />
              <rect x='14' y='3' width='7' height='7' rx='1.5' />
              <rect x='3' y='14' width='7' height='7' rx='1.5' />
              <rect x='14' y='14' width='7' height='7' rx='1.5' />
            </svg>
          </div>
          <h3 className='mt-1.5 text-lg font-bold text-ink-primary'>Your library is empty</h3>
          <p className='max-w-xs text-sm text-ink-muted'>Add a game you own, or one you've played at a friend's place.</p>
          <div className='mt-2.5 flex gap-2'>
            <button className='border-yellow-tertiary hover:bg-yellow-tertiary inline-flex h-7.5 cursor-pointer items-center rounded-md border bg-yellow-primary px-2.5 text-xs font-semibold text-ink-primary transition-colors'>
              + Add game
            </button>
            <button className='inline-flex h-7.5 cursor-pointer items-center rounded-md border border-transparent bg-transparent px-2.5 text-xs font-semibold text-ink-secondary transition-colors hover:bg-paper-secondary hover:text-ink-primary'>
              Browse BGG
            </button>
          </div>
        </div>
      </div>
    </section>
  </Page>
)

// {
//   /* Checkboxes */
// }
// <section className='space-y-4'>
//   <h2 className='text-lg font-semibold'>Checkbox</h2>
//   <div className='bg-surface-elevated flex flex-wrap gap-6 rounded-xl border border-border px-6 py-5'>
//     <CheckboxRow label='Unchecked' />
//     <CheckboxRow label='Checked' defaultChecked />
//     <CheckboxRow label='Disabled' disabled />
//     <CheckboxRow label='Disabled checked' disabled defaultChecked />
//   </div>
// </section>

// {
//   /* Badges */
// }
// <section className='space-y-4'>
//   <h2 className='text-lg font-semibold'>Badges</h2>

//   <div className='bg-surface-elevated overflow-auto rounded-xl border border-border'>
//     <table className='w-full text-sm'>
//       <thead className='bg-muted/50'>
//         <tr>
//           <th className='eyebrow px-4 py-3 text-left text-muted-foreground'>Variant</th>
//           {COLORS.map((c) => (
//             <th key={c} className='eyebrow px-3 py-3 text-center text-muted-foreground'>
//               {c}
//             </th>
//           ))}
//         </tr>
//       </thead>
//       <tbody className='divide-y divide-border'>
//         {VARIANTS.map((variant) => (
//           <tr key={variant} className='hover:bg-muted/30'>
//             <td className='eyebrow px-4 py-3 text-muted-foreground'>{variant}</td>
//             {COLORS.map((color) => (
//               <td key={color} className='px-3 py-3 text-center'>
//                 <Badge variant={variant} color={color}>
//                   {color}
//                 </Badge>
//               </td>
//             ))}
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   </div>
// </section>

// {
//   /* Toaster */
// }
// <section className='space-y-4'>
//   <h2 className='text-lg font-semibold'>Toaster</h2>
//   <div className='bg-surface-elevated flex flex-wrap gap-3 rounded-xl border border-border px-6 py-5'>
//     <button className='rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground' onClick={() => toast('Default toast')}>
//       Default
//     </button>
//     <button className='rounded-md bg-success px-3 py-1.5 text-sm text-white' onClick={() => toast.success('Success toast')}>
//       Success
//     </button>
//     <button className='rounded-md bg-warning px-3 py-1.5 text-sm text-white' onClick={() => toast.warning('Warning toast')}>
//       Warning
//     </button>
//     <button className='rounded-md bg-destructive px-3 py-1.5 text-sm text-white' onClick={() => toast.error('Error toast')}>
//       Error
//     </button>
//     <button className='rounded-md bg-info px-3 py-1.5 text-sm text-white' onClick={() => toast.info('Info toast')}>
//       Info
//     </button>
//     <button className='rounded-md bg-muted px-3 py-1.5 text-sm text-foreground' onClick={() => toast.loading('Loading…')}>
//       Loading
//     </button>
//   </div>
// </section>
