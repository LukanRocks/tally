import { cn } from '@/lib/utils'

export function LeaderboardSection() {
  return (
    <section className='space-y-6'>
      <div>
        <p className='caption text-ink-muted'>03 — Tally patterns</p>
        <h2 className='mt-1 text-2xl font-bold'>Leaderboard row</h2>
        <p className='mt-1 text-sm text-ink-secondary'>
          The most-touched component in the app. Avatar · name · score · trend, with an emphasis on <em>change</em>, not just standing.
        </p>
      </div>

      <div className='overflow-hidden rounded-xl border border-paper-muted bg-paper-primary shadow-sm'>
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
              i < arr.length - 1 && 'border-b border-dashed border-paper-muted',
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
              <span className='inline-flex h-6 items-center rounded-sm border border-paper-muted bg-paper-secondary px-2 font-mono text-[11.5px] text-ink-primary'>—</span>
            )}
            <span className='text-right font-mono text-[22px] font-bold text-ink-primary'>{score}</span>
            <span className={cn('text-right font-mono text-xs font-semibold', trend === 'up' ? 'text-win' : trend === 'down' ? 'text-loss' : 'text-ink-muted')}>{delta}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
