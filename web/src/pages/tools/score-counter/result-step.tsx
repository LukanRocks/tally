import { Crown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/1-atoms/avatar'
import { type RankedResult, type ScoringDirection } from './types'
import { getPlayerColor } from '@/lib/deterministic-picker'

export function ResultStep({ rankedResults, scoringDirection }: { rankedResults: RankedResult[]; scoringDirection: ScoringDirection }) {
  const winner = rankedResults[0]
  const maxAbsTotal = Math.max(...rankedResults.map((r) => Math.abs(r.total)), 0)

  function barWidth(result: RankedResult) {
    if (maxAbsTotal === 0) return '10%'
    return `${(Math.abs(result.total) / maxAbsTotal) * 100}%`
  }

  const heroClasses = cn('relative overflow-hidden rounded-2xl border border-paper-muted p-6 text-center')
  const rankingHeaderLabel = scoringDirection === 'highest' ? 'RANKING · HIGH TO LOW' : 'RANKING · LOW TO HIGH'
  const winnerCopy = scoringDirection === 'highest' ? 'top of the heap' : 'fewest points wins'

  return (
    <>
      {/* Winner hero */}
      {winner && (
        <div className={heroClasses}>
          <div className='pointer-events-none absolute inset-0' style={{ backgroundColor: getPlayerColor(winner.player.id), opacity: 0.15 }} />
          <div className='relative flex flex-col items-center gap-3'>
            <p className='text-sm text-ink-secondary italic'>{winnerCopy}</p>
            <div className='rounded-full' style={{ outline: `3px solid ${getPlayerColor(winner.player.id)}`, outlineOffset: '3px' }}>
              <Avatar id={winner.player.id} name={winner.player.name} avatar_path={winner.player.avatar_path} size='xl' />
            </div>
            <div className='flex flex-col items-center gap-1'>
              <div className='flex items-center gap-2'>
                <Crown size={18} style={{ color: getPlayerColor(winner.player.id) }} />
                <span className='text-xl font-bold text-ink-primary'>{winner.player.name}</span>
              </div>
              <div className='flex items-baseline gap-1'>
                <span className='text-4xl font-bold text-ink-primary tabular-nums'>{winner.total}</span>
                <span className='text-sm font-semibold tracking-wide text-ink-muted uppercase'>points</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ranking */}
      <div className='flex flex-col gap-3'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-sm font-bold tracking-wide text-ink-primary uppercase'>{rankingHeaderLabel}</p>
            <p className='text-xs text-ink-muted'>How everyone stacked up</p>
          </div>
          <span className='text-xs font-medium text-ink-muted'>{rankedResults.length} players</span>
        </div>

        {rankedResults.map((result) => {
          const isWinner = result.rank === 1
          const rowClasses = cn('flex flex-col gap-2 rounded-xl border border-paper-muted p-4', isWinner ? 'bg-yellow-primary/8' : 'bg-paper-secondary')
          return (
            <div key={result.player.id} className={rowClasses}>
              <div className='flex items-center gap-3'>
                <span
                  className={cn(
                    'flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                    isWinner ? 'bg-yellow-primary text-ink-on-yellow' : 'bg-paper-muted text-ink-secondary',
                  )}
                >
                  {result.rank}
                </span>
                <Avatar id={result.player.id} name={result.player.name} avatar_path={result.player.avatar_path} size='sm' />
                <span className='flex-1 font-medium text-ink-primary'>{result.player.name}</span>
                {isWinner && <span className='rounded-full bg-yellow-primary px-2 py-0.5 text-[10px] font-bold tracking-wide text-ink-on-yellow uppercase'>Winner</span>}
                <span className='w-14 text-right text-base font-bold text-ink-primary tabular-nums'>{result.total}</span>
              </div>

              {/* Bar chart */}
              <div className='h-2 overflow-hidden rounded-full bg-paper-muted'>
                <div className='h-full rounded-full transition-all' style={{ width: barWidth(result), backgroundColor: getPlayerColor(result.player.id) }} />
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
