import { GameCard } from '@/components/molecules/game-card'

export const GameCardSection = () => {
  return (
    <section className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold'>Game card</h2>
        <p className='mt-1 text-sm text-ink-secondary'>
          Two density modes. The rich card carries cover art and ownership; the row variant earns its place when there are 20+ games.
        </p>
      </div>

      <div>
        <p className='caption mb-3 text-ink-muted'>Current Card · grid</p>
        <div className='grid grid-cols-4 gap-3.5'>
          {(
            [
              { id: 1, name: 'Calico', session_count: 0, min_players: 2, max_players: 5, owner_id: 1 },
              { id: 2, name: 'Catan', session_count: 14, min_players: 2, max_players: 5, owner_id: 1 },
              { id: 3, name: 'Ticket to Ride', session_count: 7, min_players: 2, max_players: 5, owner_id: 1 },
              { id: 4, name: 'Wingspan', session_count: 23, min_players: 2, max_players: 5, owner_id: 1 },
              { id: 5, name: 'Pandemic', session_count: 5, min_players: 2, max_players: 5, owner_id: 1 },
              { id: 6, name: 'Codenames', session_count: 31, min_players: 2, max_players: 5, owner_id: 1 },
              { id: 7, name: 'Azul', session_count: 9, min_players: 2, max_players: 5, owner_id: 1 },
              { id: 8, name: 'Gloomhaven', session_count: 2, min_players: 2, max_players: 5, owner_id: 1 },
              { id: 9, name: 'Terraforming Mars', session_count: 18, min_players: 2, max_players: 5, owner_id: 1 },
              { id: 10, name: 'Betrayal at House on the Hill', session_count: 4, min_players: 2, max_players: 5, owner_id: 1 },
              { id: 11, name: 'Dominion', session_count: 11, min_players: 2, max_players: 5, owner_id: 1 },
              { id: 12, name: '7 Wonders', session_count: 16, min_players: 2, max_players: 5, owner_id: 1 },
            ] as const
          ).map((game, index) => (
            <GameCard key={index} {...game} />
          ))}
        </div>
      </div>

      {/* <div>
        <p className='caption mb-3 text-ink-muted'>Row · list</p>
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
      </div> */}
    </section>
  )
}
