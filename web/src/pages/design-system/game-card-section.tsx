import { Badge } from '@/components/atoms/badge'
import { GameCard } from '@/components/game-card'
import { cn } from '@/lib/utils'

export function GameCardSection() {
  return (
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
              { id: 1, name: 'Hearthstone', session_count: 0 },
              { id: 2, name: 'Catan', session_count: 14 },
              { id: 3, name: 'Ticket to Ride', session_count: 7 },
              { id: 4, name: 'Wingspan', session_count: 23 },
              { id: 5, name: 'Pandemic', session_count: 5 },
              { id: 6, name: 'Codenames', session_count: 31 },
              { id: 7, name: 'Azul', session_count: 9 },
              { id: 8, name: 'Gloomhaven', session_count: 2 },
              { id: 9, name: 'Terraforming Mars', session_count: 18 },
              { id: 10, name: 'Betrayal at House on the Hill', session_count: 4 },
              { id: 11, name: 'Dominion', session_count: 11 },
              { id: 12, name: '7 Wonders', session_count: 16 },
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
              { title: 'Rumikubi', meta: '2 sessions · 2–4p', badge: 'OWN', variant: 'owned', art: 'repeating-linear-gradient(135deg, #e8e2d0 0 8px, #dfd9c5 8px 16px)' },
              { title: 'Sushi Go!', meta: '0 sessions · 2–5p', badge: 'FRIEND', variant: 'borrowed', art: 'repeating-linear-gradient(45deg,  #e2e8d0 0 8px, #d5dfc5 8px 16px)' },
              { title: 'BG3', meta: 'Joy Joy · 7d left', badge: 'RENT', variant: 'rented', art: 'repeating-linear-gradient(135deg, #f0d4d4 0 8px, #e5c8c8 8px 16px)' },
              { title: 'Hearthstone', meta: '1 session · 3p', badge: 'OWN', variant: 'owned', art: 'repeating-linear-gradient(45deg,  #d8d4e8 0 8px, #c8c4dc 8px 16px)' },
            ] as const
          ).map(({ title, meta, badge, variant, art }) => (
            <article
              key={title}
              className='flex cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-md'
            >
              <div className='relative aspect-3/4 border-b border-border'>
                <div className='h-full w-full' style={{ background: art }} />
                <Badge variant={variant} className='absolute top-2.5 left-2.5'>
                  {badge}
                </Badge>
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
  )
}
