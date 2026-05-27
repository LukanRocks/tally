import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, Game, LeaderboardEntry, MostPlayedGame } from '@/lib/http-transport/api'
import { GameCard } from '@/components/molecules/game-card'
import { cn } from '@/lib/utils'
import { Page } from '@/components/layout/page'
import { GreetingBanner } from '@/components/greeting-banner'

export default () => {
  const [recentGames, setRecentGames] = useState<Game[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [mostPlayed, setMostPlayed] = useState<MostPlayedGame[]>([])
  const [leastPlayed, setLeastPlayed] = useState<MostPlayedGame[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.games.list({ sort: 'date_added', order: 'desc' }), api.stats.leaderboard(), api.stats.mostPlayed(), api.stats.leastPlayed()])
      .then(([games, lb, mp, lp]) => {
        setRecentGames(games.slice(0, 5))
        setLeaderboard(lb.slice(0, 5))
        setMostPlayed(mp.slice(0, 3))
        setLeastPlayed(lp.slice(0, 3))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <Page loading={loading}>
      <GreetingBanner />

      {/* Leaderboard snippet */}
      <section>
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='text-lg font-semibold text-foreground'>Top Players</h2>
          <Link to='/leaderboard' className='text-sm text-primary hover:underline'>
            View all →
          </Link>
        </div>
        {leaderboard.length === 0 ? (
          <p className='text-sm text-ink-muted'>No sessions logged yet.</p>
        ) : (
          <div className='bg-surface-elevated overflow-hidden rounded-xl border border-border'>
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead className='bg-muted/50'>
                  <tr>
                    <th className='caption px-4 py-3 text-left text-ink-muted'>#</th>
                    <th className='caption px-4 py-3 text-left text-ink-muted'>Player</th>
                    <th className='caption px-4 py-3 text-right text-ink-muted'>Points</th>
                    <th className='caption px-4 py-3 text-right text-ink-muted'>Wins</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-border'>
                  {leaderboard.map((e, i) => (
                    <tr key={e.player_id} className='hover:bg-muted/50'>
                      <td
                        className={cn('px-4 py-3 font-mono tabular-nums', i === 0 ? 'text-1st-place' : i === 1 ? 'text-2nd-place' : i === 2 ? 'text-3rd-place' : 'text-ink-muted')}
                      >
                        {i + 1}
                      </td>
                      <td className='px-4 py-3 font-medium'>
                        <Link to={`/players/${e.player_id}`} className='hover:text-primary'>
                          {e.player_name}
                        </Link>
                      </td>
                      <td className='px-4 py-3 text-right font-mono tabular-nums'>{e.total_points}</td>
                      <td className='px-4 py-3 text-right font-mono text-ink-muted tabular-nums'>{e.wins}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Most played / Least played */}
      <div className='grid gap-10 md:grid-cols-2'>
        <section>
          <h2 className='mb-4 text-lg font-semibold text-foreground'>Most Played</h2>
          {mostPlayed.length === 0 ? (
            <p className='text-sm text-ink-muted'>No sessions logged yet.</p>
          ) : (
            <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-3'>
              {mostPlayed.map((g) => (
                <GameCard key={g.id} {...g} />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className='mb-4 text-lg font-semibold text-foreground'>Least Played</h2>
          {leastPlayed.length === 0 ? (
            <p className='text-sm text-ink-muted'>No sessions logged yet.</p>
          ) : (
            <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-3'>
              {leastPlayed.map((g) => (
                <GameCard key={g.id} {...g} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Recently added */}
      <section>
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='text-lg font-semibold text-foreground'>Recently Added</h2>
          <Link to='/library' className='text-sm text-primary hover:underline'>
            View all →
          </Link>
        </div>
        {recentGames.length === 0 ? (
          <div className='py-10 text-center text-ink-muted'>
            <p className='mb-3'>No games yet.</p>
            <Link to='/library/new' className='text-sm text-primary hover:underline'>
              Add your first game →
            </Link>
          </div>
        ) : (
          <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5'>
            {recentGames.map((g) => (
              <GameCard key={g.id} {...g} />
            ))}
          </div>
        )}
      </section>
    </Page>
  )
}
