import { Link } from 'react-router-dom'
import { getBackgroundFallback } from '@/lib/backgrounds'

interface GameCardProps {
  id: number
  name: string
  cover_image_path?: string
  min_players?: number
  max_players?: number
  session_count?: number
}

export const GameCard = (game: GameCardProps) => {
  return (
    <Link to={`/library/${game.id}`} className='group overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md'>
      <div className='flex aspect-3/4 items-center justify-center bg-muted'>
        <img
          src={game.cover_image_path ?? getBackgroundFallback(game.id)}
          alt={game.cover_image_path ? game.name : ''}
          className='h-full w-full object-cover transition-transform duration-200 group-hover:scale-105'
        />
      </div>
      <div className='p-3'>
        <p className='truncate text-sm leading-tight font-semibold'>{game.name}</p>
        {game.min_players && game.max_players && (
          <p className='mt-1 text-xs text-muted-foreground'>
            {game.min_players}–{game.max_players} players
          </p>
        )}
        <p className='mt-0.5 text-xs text-muted-foreground'>{game.session_count ?? 0} sessions</p>
      </div>
    </Link>
  )
}
