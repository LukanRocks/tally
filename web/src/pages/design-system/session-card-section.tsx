import { cn } from '@/lib/utils'

export function SessionCardSection() {
  return (
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
            <span className='inline-flex h-6 shrink-0 items-center rounded-sm border border-yellow-tertiary/40 bg-yellow-secondary px-2 font-mono text-[11.5px] text-ink-primary'>
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
  )
}
