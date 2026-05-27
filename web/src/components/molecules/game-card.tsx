import { Link } from 'react-router-dom'
import type { Game } from '@/lib/http-transport/api'
import { getFallbackBackground } from '@/lib/deterministic-picker'
import { useSettings } from '@/contexts/settings-context'
import { Badge } from '@/components/atoms/badge'
import { Dices } from 'lucide-react'

type GameCardProps = Pick<Game, 'id' | 'name' | 'cover_image_path' | 'min_players' | 'max_players' | 'session_count' | 'owner_id' | 'owner_player_type'>

export const GameCard = (game: GameCardProps) => {
  const fallback = getFallbackBackground(game.id)
  const { settings } = useSettings()
  let ownershipVariant: 'owned' | 'borrowed' | 'rented' | null = null

  if (game.owner_id != null) {
    if (game.owner_id === settings.default_owner_id) ownershipVariant = 'owned'
    else if (game.owner_player_type === 'shop') ownershipVariant = 'rented'
    else ownershipVariant = 'borrowed'
  }

  return (
    <Link to={`/library/${game.id}`} className='overflow-hidden rounded-xl border border-border bg-card transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-md'>
      <div className='relative flex aspect-3/4 items-center justify-center'>
        <img src={game.cover_image_path ?? fallback} alt={game.cover_image_path ? game.name : ''} className='h-full w-full rounded-b-md object-cover' />
        {ownershipVariant && (
          <Badge variant={ownershipVariant} className='absolute top-2 left-2'>
            {ownershipVariant === 'owned' ? 'Owned' : ownershipVariant === 'rented' ? 'Rented' : 'Borrowed'}
          </Badge>
        )}
      </div>
      <div className='flex flex-col gap-1 px-3 py-2'>
        <p className='text-md truncate leading-tight font-semibold capitalize'>{game.name}</p>
        <p className='mt-1 text-xs text-muted-foreground'>
          {game.min_players && game.max_players
            ? `${game.min_players}–${game.max_players} players`
            : (game.min_players ?? game.max_players) != null
              ? `${game.min_players ?? game.max_players} ${(game.min_players ?? game.max_players) === 1 ? 'player' : 'players'}`
              : '¯\\_(ツ)_/¯ players'}
        </p>
        <p className='flex flex-row gap-1 text-xs text-muted-foreground'>
          <Dices size={12} />
          {game.session_count && game.session_count > 0 ? `${game.session_count} sessions` : 'never played'}
        </p>
      </div>
    </Link>
  )
}
