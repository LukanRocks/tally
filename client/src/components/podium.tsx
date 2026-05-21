import { Link } from 'react-router-dom'
import { Crown } from 'lucide-react'
import { LeaderboardEntry } from '../lib/api'

interface PodiumProps {
  entries: LeaderboardEntry[]
  ready: boolean
}

const rankStyle: Record<number, { step: string; text: string; ring: string; spotlight: string }> = {
  1: {
    step: 'bg-linear-to-b from-yellow-400/25 to-transparent',
    text: 'text-yellow-500',
    ring: 'ring-yellow-400/60',
    spotlight: 'from-yellow-400/30 via-yellow-400/10 to-transparent',
  },
  2: {
    step: 'bg-linear-to-b from-slate-400/25 to-transparent',
    text: 'text-slate-400',
    ring: 'ring-slate-400/60',
    spotlight: 'from-slate-400/25 via-slate-400/10 to-transparent',
  },
  3: {
    step: 'bg-linear-to-b from-amber-700/25 to-transparent',
    text: 'text-amber-700',
    ring: 'ring-amber-700/60',
    spotlight: 'from-amber-700/25 via-amber-700/10 to-transparent',
  },
}

const enterDelay: Record<number, string> = { 1: '400ms', 2: '200ms', 3: '0ms' }

export const Podium = ({ entries, ready }: PodiumProps) => {
  const [first, second, third] = entries

  const steps: { entry: LeaderboardEntry | undefined; rank: number; height: string; label: string }[] = [
    { entry: second, rank: 2, height: 'h-28', label: '2' },
    { entry: first, rank: 1, height: 'h-36', label: '1' },
    { entry: third, rank: 3, height: 'h-20', label: '3' },
  ]

  return (
    <div className='flex items-end justify-center gap-2'>
      {steps.map(({ entry, rank, height, label }) => {
        const style = rankStyle[rank]
        const hasPlayer = entry != null && entry.total_points > 0

        return (
          <div
            key={rank}
            className='relative flex flex-col items-center gap-2 transition-all duration-700 ease-out'
            style={{ transitionDelay: enterDelay[rank], opacity: ready ? 1 : 0, transform: ready ? 'translateY(0)' : 'translateY(32px)' }}
          >
            {hasPlayer && <div className={`absolute -top-4 h-32 w-32 animate-pulse rounded-full bg-radial ${style.spotlight} blur-2xl`} />}
            {hasPlayer && rank === 1 && <Crown size={18} className='relative text-yellow-500' />}
            {hasPlayer && (
              <Link to={`/players/${entry.player_id}`} className='relative'>
                {entry.avatar_path ? (
                  <img src={entry.avatar_path} alt={entry.player_name} className={`${rank === 1 ? 'h-16 w-16' : 'h-12 w-12'} rounded-full object-cover ring-2 ${style.ring}`} />
                ) : (
                  <div
                    className={`${rank === 1 ? 'h-16 w-16 text-xl' : 'h-12 w-12 text-lg'} flex items-center justify-center rounded-full bg-muted font-bold ring-2 ${style.text} ${style.ring}`}
                  >
                    {entry.player_name[0].toUpperCase()}
                  </div>
                )}
              </Link>
            )}
            {hasPlayer && (
              <Link to={`/players/${entry.player_id}`} className='relative max-w-20 truncate text-center text-sm font-semibold hover:text-primary'>
                {entry.player_name}
              </Link>
            )}
            {hasPlayer && (
              <p className='relative text-xs text-muted-foreground'>
                {entry.wins} wins · {entry.win_rate}%
              </p>
            )}

            <div className={`relative flex w-24 ${height} items-start justify-center rounded-t-lg pt-3 ${style.step}`}>
              <span className={`text-2xl font-black ${style.text}`}>{label}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
