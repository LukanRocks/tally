import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, Player, Session } from '../lib/api'

export default function PlayerProfile() {
  const { id } = useParams<{ id: string }>()
  const pid = Number(id)
  const [player, setPlayer] = useState<Player | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.players.get(pid), api.sessions.list()])
      .then(([p, ss]) => {
        setPlayer(p)
        setSessions(ss)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [pid])

  if (loading) return <div className='p-4 text-muted-foreground md:p-8'>Loading…</div>
  if (!player) return <div className='p-4 text-muted-foreground md:p-8'>Player not found.</div>

  return (
    <div className='max-w-4xl p-4 md:p-8'>
      <div className='mb-6 flex items-center gap-2 text-sm text-muted-foreground'>
        <Link to='/players' className='hover:text-foreground'>
          Players
        </Link>
        <span>/</span>
        <span className='font-medium text-foreground'>{player.name}</span>
      </div>

      {/* Header */}
      <div className='mb-8 flex items-center gap-5'>
        <div className='flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-muted'>
          {player.avatar_path ? (
            <img src={player.avatar_path} alt={player.name} className='h-full w-full object-cover' />
          ) : (
            <span className='text-3xl text-muted-foreground'>◉</span>
          )}
        </div>
        <div>
          <h1 className='text-2xl font-bold text-foreground'>{player.name}</h1>
          <p className='mt-1 text-sm text-muted-foreground'>Member since {player.created_at?.slice(0, 10)}</p>
        </div>
      </div>

      {/* Stats */}
      <div className='mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4'>
        <StatCard label='Total Points' value={player.total_points ?? 0} />
        <StatCard label='Sessions' value={player.total_sessions ?? 0} />
        <StatCard label='Wins' value={player.wins ?? 0} />
        <StatCard label='Win Rate' value={`${player.win_rate ?? 0}%`} />
      </div>

      {/* Session history */}
      <div>
        <h2 className='mb-3 text-base font-semibold text-foreground'>Recent Sessions</h2>
        {sessions.length === 0 ? (
          <p className='text-sm text-muted-foreground'>No sessions found.</p>
        ) : (
          <div className='overflow-hidden rounded-xl border border-border bg-card'>
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead className='bg-muted/50 text-xs tracking-wide text-muted-foreground uppercase'>
                  <tr>
                    <th className='px-4 py-3 text-left'>Date</th>
                    <th className='px-4 py-3 text-left'>Game</th>
                    <th className='px-4 py-3 text-right'>Players</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-border'>
                  {sessions.slice(0, 20).map((s) => (
                    <tr key={s.id} className='hover:bg-muted/50'>
                      <td className='px-4 py-3 font-medium'>{s.played_at}</td>
                      <td className='px-4 py-3 text-foreground/80'>
                        <Link to={`/library/${s.game_id}`} className='hover:text-primary'>
                          {s.game_name}
                        </Link>
                      </td>
                      <td className='px-4 py-3 text-right text-muted-foreground'>{s.player_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className='rounded-xl border border-border bg-card p-4'>
      <p className='text-xs tracking-wide text-muted-foreground uppercase'>{label}</p>
      <p className='mt-1 text-2xl font-bold text-foreground'>{value}</p>
    </div>
  )
}
