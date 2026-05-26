import { cn } from '@/lib/utils'

export function InputsSection() {
  return (
    <section className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold'>Inputs</h2>
        <p className='mt-1 text-sm text-ink-secondary'>1px line border, paper-tinted fill, yellow focus ring. Heights match button heights so they line up in forms.</p>
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <label className='flex flex-col gap-1.5'>
          <span className='caption text-ink-muted'>Game</span>
          <input className='input' type='text' defaultValue='Rumikubi' />
        </label>

        <label className='flex flex-col gap-1.5'>
          <span className='caption text-ink-muted'>Date</span>
          <input className='input' type='text' placeholder='May 6, 2024' />
        </label>

        <label className='flex flex-col gap-1.5'>
          <span className='caption text-ink-muted'>Search</span>
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
          <span className='caption text-ink-muted'>Player count</span>
          <select className='input cursor-pointer'>
            <option>2 players</option>
            <option>3 players</option>
            <option>4 players</option>
          </select>
        </label>

        <label className='flex flex-col gap-1.5'>
          <span className='caption text-ink-muted'>Notes</span>
          <textarea className='input min-h-18 resize-y py-2.5 leading-relaxed' rows={3} placeholder='What happened?' />
        </label>

        <div className='flex flex-col gap-1.5'>
          <span className='caption text-ink-muted'>Disabled / error</span>
          <input className='input cursor-not-allowed opacity-50' type='text' defaultValue='--' disabled />
          <input className='input mt-2 border-loss bg-loss/6 focus:ring-loss/30' type='text' defaultValue="Two of these — that's the wrong number." />
          <span className='text-xs text-loss'>Each player can only appear once per session.</span>
        </div>
      </div>

      <div className='space-y-3'>
        <p className='caption text-ink-muted'>Segmented control</p>
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
  )
}
