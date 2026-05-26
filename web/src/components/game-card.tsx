import { Link } from 'react-router-dom'
import type { Game } from '@/lib/http-transport/api'
import { backgrounds } from '@/lib/backgrounds'
import { useDeterministicPick } from '@/hooks/useDeterministicPick'
import { useSettings } from '@/contexts/settings-context'
import { Badge } from '@/components/atoms/badge'

type GameCardProps = Pick<Game, 'id' | 'name' | 'cover_image_path' | 'min_players' | 'max_players' | 'session_count' | 'owner_id' | 'owner_player_type'>

export const GameCard = (game: GameCardProps) => {
  const fallback = useDeterministicPick(backgrounds, game.id)
  const { settings } = useSettings()
  let ownershipVariant: 'owned' | 'borrowed' | 'rented' | null = null

  if (game.owner_id != null) {
    if (game.owner_id === settings.default_owner_id) ownershipVariant = 'owned'
    else if (game.owner_player_type === 'shop') ownershipVariant = 'rented'
    else ownershipVariant = 'borrowed'
  }

  return (
    <Link to={`/library/${game.id}`} className='overflow-hidden rounded-xl border border-border bg-card transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-md'>
      <div className='relative flex aspect-3/4 items-center justify-center bg-muted'>
        <img src={game.cover_image_path ?? fallback} alt={game.cover_image_path ? game.name : ''} className='h-full w-full object-cover' />
        {ownershipVariant && (
          <Badge variant={ownershipVariant} className='absolute top-2 left-2'>
            {ownershipVariant === 'owned' ? 'Owned' : ownershipVariant === 'rented' ? 'Rented' : 'Borrowed'}
          </Badge>
        )}
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
