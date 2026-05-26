export function AvatarsSection() {
  return (
    <section className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold'>Avatars & Player marks</h2>
        <p className='mt-1 text-sm text-ink-secondary'>
          Initial-based, colored per-player. Color is assigned at player creation and never changes — that's how someone becomes "the pink one".
        </p>
      </div>

      <div className='space-y-4 rounded-xl border border-border bg-card p-5'>
        <p className='caption text-ink-muted'>Sizes</p>
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

        <p className='caption text-ink-muted'>Player palette</p>
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

        <p className='caption text-ink-muted'>Stack & with rank</p>
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
  )
}
