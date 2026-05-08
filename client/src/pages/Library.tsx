import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Dices, Plus } from 'lucide-react'
import { api, Game, Player } from '../lib/api'
import { useSettings } from '../contexts/settings-context'

export default function Library() {
  const { settings } = useSettings()
  const [games, setGames] = useState<Game[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('name')
  const [order, setOrder] = useState<'asc' | 'desc'>('asc')
  const [minPlayers, setMinPlayers] = useState('')
  const [maxPlayers, setMaxPlayers] = useState('')
  const [ownerId, setOwnerId] = useState('')
  const [loading, setLoading] = useState(true)
  const ownerInitialized = useRef(false)

  useEffect(() => {
    if (settings && !ownerInitialized.current) {
      ownerInitialized.current = true
      if (settings.default_owner_id != null) setOwnerId(String(settings.default_owner_id))
    }
  }, [settings])

  useEffect(() => {
    api.players.list().then(setPlayers)
  }, [])

  useEffect(() => {
    setLoading(true)
    api.games
      .list({
        search: search || undefined,
        sort,
        order,
        minPlayers: minPlayers ? Number(minPlayers) : undefined,
        maxPlayers: maxPlayers ? Number(maxPlayers) : undefined,
        ownerId: ownerId ? Number(ownerId) : undefined,
      })
      .then((data) => {
        setGames(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [search, sort, order, minPlayers, maxPlayers, ownerId])

  return (
    <div className='p-4 md:p-8'>
      <div className='mb-6 flex flex-wrap items-center gap-3'>
        <input
          type='text'
          placeholder='Search games…'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none sm:w-52'
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className='rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none'
        >
          <option value='name'>Name</option>
          <option value='date_added'>Date Added</option>
          <option value='most_played'>Most Played</option>
          <option value='price'>Price</option>
        </select>
        <select
          value={order}
          onChange={(e) => setOrder(e.target.value as 'asc' | 'desc')}
          className='rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none'
        >
          <option value='asc'>Ascending</option>
          <option value='desc'>Descending</option>
        </select>
        <select
          value={ownerId}
          onChange={(e) => setOwnerId(e.target.value)}
          className='rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none'
        >
          <option value=''>All owners</option>
          {players.map((p) => (
            <option key={p.id} value={String(p.id)}>
              {p.name}
            </option>
          ))}
        </select>
        <input
          type='number'
          placeholder='Min players'
          value={minPlayers}
          onChange={(e) => setMinPlayers(e.target.value)}
          className='w-28 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none'
        />
        <input
          type='number'
          placeholder='Max players'
          value={maxPlayers}
          onChange={(e) => setMaxPlayers(e.target.value)}
          className='w-28 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none'
        />
        <Link
          to='/library/new'
          className='ml-auto flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90'
        >
          <Plus size={14} /> Add Game
        </Link>
      </div>

      {loading ? (
        <div className='text-muted-foreground'>Loading…</div>
      ) : games.length === 0 ? (
        <div className='py-20 text-center text-muted-foreground'>
          <Dices size={40} className='mx-auto mb-4 text-muted-foreground/40' />
          <p className='mb-3'>{search ? 'No games match your search.' : 'Your library is empty.'}</p>
          {!search && (
            <Link to='/library/new' className='text-sm text-primary hover:underline'>
              Add your first game →
            </Link>
          )}
        </div>
      ) : (
        <div className='grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'>
          {games.map((game) => (
            <Link key={game.id} to={`/library/${game.id}`} className='group overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md'>
              <div className='flex aspect-[3/4] items-center justify-center bg-muted'>
                {game.cover_image_path ? (
                  <img src={game.cover_image_path} alt={game.name} className='h-full w-full object-cover transition-transform duration-200 group-hover:scale-105' />
                ) : (
                  <Dices size={36} className='text-muted-foreground/40' />
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
          ))}
        </div>
      )}
    </div>
  )
}
