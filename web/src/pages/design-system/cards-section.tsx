import { cn } from '@/lib/utils'

export function CardsSection() {
  return (
    <section className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold'>Cards</h2>
        <p className='mt-1 text-sm text-ink-secondary'>
          One radius (12px), one resting shadow, one hover state. Variants differ by <em>content density</em>, not by visual style.
        </p>
      </div>

      <div className='grid grid-cols-3 gap-4'>
        <div className='rounded-xl border border-paper-muted bg-paper-primary p-5 shadow-sm'>
          <p className='caption text-ink-muted'>Default · resting</p>
          <h3 className='my-1.5 text-lg font-bold'>Recent sessions</h3>
          <p className='text-sm text-ink-muted'>Wraps any content. Pad 16/20.</p>
        </div>

        <div className='cursor-pointer rounded-xl border border-paper-muted bg-paper-primary p-5 shadow-sm transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-md'>
          <p className='caption text-ink-muted'>Hoverable</p>
          <h3 className='my-1.5 text-lg font-bold'>Tap me</h3>
          <p className='text-sm text-ink-muted'>Lifts on hover. Use for navigable cards.</p>
        </div>

        <div className='rounded-xl border border-yellow-tertiary bg-yellow-primary p-5'>
          <p className='caption text-ink-primary/70'>Accent · key moment</p>
          <h3 className='my-1.5 text-lg font-bold text-ink-primary'>Play tonight</h3>
          <p className='text-sm text-ink-primary'>Yellow ground — at most one per screen.</p>
        </div>
      </div>

      <div>
        <p className='mb-3 caption text-ink-muted'>List row</p>
        <div className='overflow-hidden rounded-xl border border-paper-muted bg-paper-primary shadow-sm'>
          {(
            [
              { title: 'Rumikubi', meta: '2 sessions · 2–4p · own', stars: '★★★★' },
              { title: 'Hearthstone', meta: '1 session · friend · Marina', stars: '★★★' },
              { title: 'Sushi Go!', meta: '0 sessions · 2–5p · own', stars: '★★' },
            ] as const
          ).map(({ title, meta, stars }, i, arr) => (
            <div
              key={title}
              className={cn('grid grid-cols-[44px_1fr_auto_auto] items-center gap-3.5 px-4 py-3', i < arr.length - 1 && 'border-b border-dashed border-paper-muted')}
            >
              <div
                className='h-11 w-11 rounded-lg border border-paper-muted'
                style={{ background: 'repeating-linear-gradient(135deg, var(--paper-secondary) 0 6px, var(--paper-muted) 6px 12px)' }}
              />
              <div className='flex flex-col gap-0.5'>
                <span className='text-[15px] font-semibold text-ink-primary'>{title}</span>
                <span className='text-xs text-ink-muted'>{meta}</span>
              </div>
              <span className='inline-flex h-6 items-center rounded-sm border border-paper-muted bg-paper-secondary px-2 font-mono text-[11.5px] text-ink-primary'>{stars}</span>
              <button className='inline-flex h-7.5 cursor-pointer items-center rounded-md border border-transparent bg-transparent px-2.5 text-xs font-semibold text-ink-secondary transition-colors hover:bg-paper-secondary hover:text-ink-primary'>
                Open
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
