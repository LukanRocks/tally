import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Dices } from 'lucide-react'
import { api, Game, LeaderboardEntry, MostPlayedGame } from '../lib/api'

export default function Dashboard() {
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
        setMostPlayed(mp.slice(0, 5))
        setLeastPlayed(lp.slice(0, 5))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className='p-4 text-muted-foreground md:p-8'>Loading…</div>

  return (
    <div className='mx-auto max-w-5xl space-y-10 p-4 md:p-8'>
      {/* Leaderboard snippet */}
      <section>
        <div className='mb-4 flex items-center justify-between'>
          <h2 className='text-lg font-semibold text-foreground'>Top Players</h2>
          <Link to='/leaderboard' className='text-sm text-primary hover:underline'>
            View all →
          </Link>
        </div>
        {leaderboard.length === 0 ? (
          <p className='text-sm text-muted-foreground'>No sessions logged yet.</p>
        ) : (
          <div className='overflow-hidden rounded-xl border border-border bg-card'>
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead className='bg-muted/50 text-xs tracking-wide text-muted-foreground uppercase'>
                  <tr>
                    <th className='px-4 py-3 text-left'>#</th>
                    <th className='px-4 py-3 text-left'>Player</th>
                    <th className='px-4 py-3 text-right'>Points</th>
                    <th className='px-4 py-3 text-right'>Wins</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-border'>
                  {leaderboard.map((e, i) => (
                    <tr key={e.player_id} className='hover:bg-muted/50'>
                      <td className='px-4 py-3 font-medium text-muted-foreground'>{i + 1}</td>
                      <td className='px-4 py-3 font-medium'>
                        <Link to={`/players/${e.player_id}`} className='hover:text-primary'>
                          {e.player_name}
                        </Link>
                      </td>
                      <td className='px-4 py-3 text-right font-semibold'>{e.total_points}</td>
                      <td className='px-4 py-3 text-right text-muted-foreground'>{e.wins}</td>
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
            <p className='text-sm text-muted-foreground'>No sessions logged yet.</p>
          ) : (
            <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-3'>
              {mostPlayed.map((g) => (
                <Link key={g.id} to={`/library/${g.id}`} className='overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md'>
                  <div className='aspect-3/4 bg-muted'>{g.cover_image_path && <img src={g.cover_image_path} alt={g.name} className='h-full w-full object-cover' />}</div>
                  <div className='p-3'>
                    <p className='truncate text-sm font-medium'>{g.name}</p>
                    <p className='mt-1 text-xs text-muted-foreground'>{g.session_count} sessions</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className='mb-4 text-lg font-semibold text-foreground'>Least Played</h2>
          {leastPlayed.length === 0 ? (
            <p className='text-sm text-muted-foreground'>No sessions logged yet.</p>
          ) : (
            <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-3'>
              {leastPlayed.map((g) => (
                <Link key={g.id} to={`/library/${g.id}`} className='overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md'>
                  <div className='aspect-3/4 bg-muted'>{g.cover_image_path && <img src={g.cover_image_path} alt={g.name} className='h-full w-full object-cover' />}</div>
                  <div className='p-3'>
                    <p className='truncate text-sm font-medium'>{g.name}</p>
                    <p className='mt-1 text-xs text-muted-foreground'>{g.session_count} sessions</p>
                  </div>
                </Link>
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
          <div className='py-10 text-center text-muted-foreground'>
            <p className='mb-3'>No games yet.</p>
            <Link to='/library/new' className='text-sm text-primary hover:underline'>
              Add your first game →
            </Link>
          </div>
        ) : (
          <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5'>
            {recentGames.map((g) => (
              <GameCard key={g.id} game={g} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function GameCard({ game }: { game: Game }) {
  return (
    <Link to={`/library/${game.id}`} className='overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md'>
      <div className='flex aspect-3/4 items-center justify-center bg-muted'>
        {game.cover_image_path ? (
          <img src={game.cover_image_path} alt={game.name} className='h-full w-full object-cover' />
        ) : (
          <Dices size={32} className='text-muted-foreground/40' />
        )}
      </div>
      <div className='p-3'>
        <p className='truncate text-sm font-medium'>{game.name}</p>
        {game.min_players && game.max_players && (
          <p className='mt-1 text-xs text-muted-foreground'>
            {game.min_players}–{game.max_players} players
          </p>
        )}
      </div>
    </Link>
  )
}
