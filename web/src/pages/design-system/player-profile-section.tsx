export function PlayerProfileSection() {
  return (
    <section className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold'>Player profile header</h2>
        <p className='mt-1 text-sm text-ink-secondary'>
          Lives on <code className='font-mono text-xs'>/players/&lt;name&gt;</code>. Hero block at top, then head-to-head and best-at modules below.
        </p>
      </div>

      <div className='grid grid-cols-[auto_1fr_auto] items-center gap-6 rounded-xl border border-paper-muted bg-paper-primary p-7 shadow-sm'>
        <span
          className='inline-flex h-22 w-22 items-center justify-center rounded-full border-[2.5px] border-ink-primary font-sans text-4xl font-bold text-ink-primary'
          style={{ background: 'var(--player-a)' }}
        >
          A
        </span>
        <div className='flex flex-col gap-2.5'>
          <h1 className='text-4xl leading-none font-extrabold tracking-tight text-ink-primary'>
            Alyne <span className='font-callout text-3xl text-yellow-tertiary'>— champion.</span>
          </h1>
          <div className='flex flex-wrap gap-1.5'>
            <span className='inline-flex h-6 items-center rounded-sm border border-yellow-tertiary/40 bg-yellow-secondary px-2 font-mono text-[11.5px] text-ink-primary'>
              9 pts
            </span>
            <span className='inline-flex h-6 items-center rounded-sm border border-paper-muted bg-paper-secondary px-2 font-mono text-[11.5px] text-ink-primary'>3 sessions</span>
            <span className='inline-flex h-6 items-center rounded-sm border border-paper-muted bg-paper-secondary px-2 font-mono text-[11.5px] text-ink-primary'>67% win</span>
            <span className='inline-flex h-6 items-center rounded-sm border border-loss/30 bg-loss/12 px-2 font-mono text-[11.5px] text-ink-primary'>🔥 3 streak</span>
          </div>
        </div>
        <div className='flex flex-col gap-2'>
          <button className='inline-flex h-7.5 cursor-pointer items-center rounded-md border border-paper-muted bg-paper-primary px-2.5 text-xs font-semibold text-ink-primary transition-colors hover:border-ink-muted hover:bg-paper-secondary'>
            Head-to-head
          </button>
          <button className='inline-flex h-7.5 cursor-pointer items-center rounded-md border border-yellow-tertiary bg-yellow-primary px-2.5 text-xs font-semibold text-ink-primary transition-colors hover:bg-yellow-tertiary'>
            + Log session
          </button>
        </div>
      </div>
    </section>
  )
}
