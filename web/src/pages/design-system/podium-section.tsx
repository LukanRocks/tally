export function PodiumSection() {
  return (
    <section className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold'>Podium</h2>
        <p className='mt-1 text-sm text-ink-secondary'>Used at the top of Home and at the end of a session. Three columns; the winner is taller, centered, with yellow paper.</p>
      </div>

      <div className='rounded-xl border border-paper-muted bg-paper-primary p-6 shadow-sm'>
        <p className='mb-6 text-center caption text-ink-muted'>Reigning champion · this week</p>
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
  )
}
