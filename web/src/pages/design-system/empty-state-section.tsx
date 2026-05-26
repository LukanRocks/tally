export function EmptyStateSection() {
  return (
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
          <button className='mt-2.5 inline-flex h-9.5 cursor-pointer items-center rounded-md border border-yellow-tertiary bg-yellow-primary px-3.5 text-sm font-semibold text-ink-primary transition-colors hover:bg-yellow-tertiary'>
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
            <button className='inline-flex h-7.5 cursor-pointer items-center rounded-md border border-yellow-tertiary bg-yellow-primary px-2.5 text-xs font-semibold text-ink-primary transition-colors hover:bg-yellow-tertiary'>
              + Add game
            </button>
            <button className='inline-flex h-7.5 cursor-pointer items-center rounded-md border border-transparent bg-transparent px-2.5 text-xs font-semibold text-ink-secondary transition-colors hover:bg-paper-secondary hover:text-ink-primary'>
              Browse BGG
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
