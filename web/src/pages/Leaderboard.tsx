import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, HeadToHead, LeaderboardEntry, MostPlayedGame, Player } from '@/lib/http-transport/api'
import { useSettings } from '@/contexts/settings-context'
import { Podium } from '@/components/custom/podium'

export default function Leaderboard() {
  const { settings } = useSettings()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [mostPlayed, setMostPlayed] = useState<MostPlayedGame[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [p1, setP1] = useState<number>(0)
  const [p2, setP2] = useState<number>(0)
  const [h2h, setH2H] = useState<HeadToHead | null>(null)

  const [loading, setLoading] = useState(true)
  const [podiumReady, setPodiumReady] = useState(false)

  useEffect(() => {
    Promise.all([api.stats.leaderboard(), api.stats.mostPlayed(), api.players.list()])
      .then(([lb, mp, p]) => {
        setLeaderboard(lb)
        setMostPlayed(mp)
        setPlayers(p)

        const ownerId = settings?.default_owner_id ?? null
        const personPlayers = p.filter((pl) => pl.player_type === 'person')
        const ownerExists = ownerId && personPlayers.some((pl) => pl.id === ownerId)
        const defaultP1 = ownerExists ? ownerId! : 0
        const others = personPlayers.filter((pl) => pl.id !== defaultP1)
        const randomP2 = others.length > 0 ? others[Math.floor(Math.random() * others.length)].id : 0
        setP1(defaultP1)
        setP2(randomP2)

        setLoading(false)
        setTimeout(() => setPodiumReady(true), 50)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!p1 || !p2 || p1 === p2) {
      setH2H(null)
      return
    }
    api.stats
      .headToHead(p1, p2)
      .then(setH2H)
      .catch(() => setH2H(null))
  }, [p1, p2])

  if (loading) return <div className='p-4 text-ink-muted md:p-8'>Loading…</div>

  return (
    <div className='mx-auto max-w-5xl space-y-12 p-4 pt-16 md:p-8 md:pt-20'>
      {/* Podium */}
      <section>
        <Podium entries={leaderboard} ready={podiumReady} />
      </section>

      {/* Global rankings */}
      <section>
        {leaderboard.length === 0 ? (
          <p className='text-sm text-ink-muted'>No sessions logged yet.</p>
        ) : (
          <div className='overflow-hidden rounded-xl border border-paper-muted bg-paper-primary'>
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead className='bg-paper-muted/50 text-xs tracking-wide text-ink-muted uppercase'>
                  <tr>
                    <th className='px-4 py-3 text-left'>#</th>
                    <th className='px-4 py-3 text-left'>Player</th>
                    <th className='px-4 py-3 text-right'>Points</th>
                    <th className='px-4 py-3 text-right'>Wins</th>
                    <th className='px-4 py-3 text-right'>Sessions</th>
                    <th className='px-4 py-3 text-right'>Win Rate</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-paper-muted'>
                  {leaderboard.map((e, i) => (
                    <tr key={e.player_id} className='hover:bg-paper-muted/50'>
                      <td className='px-4 py-3 font-medium text-ink-muted'>{i + 1}</td>
                      <td className='px-4 py-3'>
                        <div className='flex items-center gap-2'>
                          {e.avatar_path && <img src={e.avatar_path} alt={e.player_name} className='h-7 w-7 rounded-full object-cover' />}
                          <Link to={`/players/${e.player_id}`} className='font-medium hover:text-primary'>
                            {e.player_name}
                          </Link>
                        </div>
                      </td>
                      <td className='px-4 py-3 text-right font-semibold'>{e.total_points}</td>
                      <td className='px-4 py-3 text-right'>{e.wins}</td>
                      <td className='px-4 py-3 text-right text-ink-muted'>{e.total_sessions}</td>
                      <td className='px-4 py-3 text-right text-ink-muted'>{e.win_rate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Most played */}
      <section>
        {mostPlayed.length === 0 ? (
          <p className='text-sm text-ink-muted'>No sessions yet.</p>
        ) : (
          <div className='overflow-hidden rounded-xl border border-paper-muted bg-paper-primary'>
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead className='bg-paper-muted/50 text-xs tracking-wide text-ink-muted uppercase'>
                  <tr>
                    <th className='px-4 py-3 text-left'>#</th>
                    <th className='px-4 py-3 text-left'>Most Played Games</th>
                    <th className='px-4 py-3 text-right'>Sessions</th>
                    <th className='px-4 py-3 text-right'>Unique Players</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-paper-muted'>
                  {mostPlayed.map((g, i) => (
                    <tr key={g.id} className='hover:bg-paper-muted/50'>
                      <td className='px-4 py-3 font-medium text-ink-muted'>{i + 1}</td>
                      <td className='px-4 py-3'>
                        <div className='flex items-center gap-3'>
                          {g.cover_image_path && <img src={g.cover_image_path} alt={g.name} className='h-10 w-8 rounded object-cover' />}
                          <Link to={`/library/${g.id}`} className='font-medium hover:text-primary'>
                            {g.name}
                          </Link>
                        </div>
                      </td>
                      <td className='px-4 py-3 text-right font-semibold'>{g.session_count}</td>
                      <td className='px-4 py-3 text-right text-ink-muted'>{g.unique_players}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Head-to-head */}
      <section>
        <h2 className='mb-4 text-lg font-semibold text-ink-primary'>Head-to-Head</h2>
        <div className='mb-4 flex flex-col gap-3 sm:flex-row'>
          <select
            value={p1}
            onChange={(e) => setP1(Number(e.target.value))}
            className='rounded-lg border border-paper-muted bg-paper-primary px-3 py-2 text-sm text-ink-primary focus:ring-2 focus:ring-ring focus:outline-none'
          >
            <option value={0} disabled hidden>
              Player 1…
            </option>
            {players
              .filter((p) => p.player_type === 'person' && p.id !== p2)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
          </select>
          <span className='flex items-center font-bold text-ink-muted'>vs</span>
          <select
            value={p2}
            onChange={(e) => setP2(Number(e.target.value))}
            className='rounded-lg border border-paper-muted bg-paper-primary px-3 py-2 text-sm text-ink-primary focus:ring-2 focus:ring-ring focus:outline-none'
          >
            <option value={0} disabled hidden>
              Player 2…
            </option>
            {players
              .filter((p) => p.player_type === 'person' && p.id !== p1)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
          </select>
        </div>

        {h2h && (
          <div className='rounded-xl border border-paper-muted bg-paper-primary p-6'>
            <div className='mb-6 grid grid-cols-3 gap-4 text-center'>
              <div>
                <p className='text-lg font-bold'>{h2h.player1.name}</p>
                <p className='mt-1 text-3xl font-black text-primary'>{h2h.p1_wins}</p>
                <p className='text-xs text-ink-muted'>wins</p>
              </div>
              <div className='flex flex-col items-center justify-center'>
                <p className='text-sm text-ink-muted'>{h2h.shared_sessions} shared sessions</p>
              </div>
              <div>
                <p className='text-lg font-bold'>{h2h.player2.name}</p>
                <p className='mt-1 text-3xl font-black text-primary'>{h2h.p2_wins}</p>
                <p className='text-xs text-ink-muted'>wins</p>
              </div>
            </div>
            {h2h.sessions.length > 0 && (
              <div className='overflow-x-auto'>
                <table className='w-full text-sm'>
                  <thead className='text-xs text-ink-muted uppercase'>
                    <tr>
                      <th className='pb-2 text-left'>Date</th>
                      <th className='pb-2 text-left'>Game</th>
                      <th className='pb-2 text-center'>{h2h.player1.name}</th>
                      <th className='pb-2 text-center'>{h2h.player2.name}</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-paper-muted'>
                    {h2h.sessions.map((s) => (
                      <tr key={s.session_id}>
                        <td className='py-2'>{s.played_at.slice(0, 10)}</td>
                        <td className='py-2 text-ink-primary/80'>{s.game_name}</td>
                        <td className='py-2 text-center'>
                          <span className={s.p1_rank < s.p2_rank ? 'font-bold text-green-600' : 'text-ink-muted'}>
                            #{s.p1_rank} ({s.p1_points}pts)
                          </span>
                        </td>
                        <td className='py-2 text-center'>
                          <span className={s.p2_rank < s.p1_rank ? 'font-bold text-green-600' : 'text-ink-muted'}>
                            #{s.p2_rank} ({s.p2_points}pts)
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
