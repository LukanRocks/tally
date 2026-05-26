import { cn } from '@/lib/utils'

export function NavigationSection() {
  return (
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
            <button className='inline-flex h-7.5 cursor-pointer items-center gap-1.5 rounded-md border border-yellow-tertiary bg-yellow-primary px-2.5 text-xs font-semibold text-ink-primary transition-colors hover:bg-yellow-tertiary'>
              + Add game
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
