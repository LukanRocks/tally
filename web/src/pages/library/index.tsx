import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Dices, Plus } from 'lucide-react'

import { Page, PageHeader } from '@/components/layout/page'
import { Button } from '@/components/atoms/button'
import { GameCard } from '@/components/game-card'
import { EmptyState } from '@/components/feedback/empty-state'

import { useSettings } from '@/contexts/settings-context'
import { api, Game, Player } from '@/lib/http-transport/api'

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
    setLoading(true)
    if (settings && !ownerInitialized.current) {
      ownerInitialized.current = true

      if (settings.default_owner_id != null) setOwnerId(String(settings.default_owner_id))
    }
  }, [settings])

  useEffect(() => {
    api.players.list().then(setPlayers)
  }, [])

  useEffect(() => {
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
    <Page>
      <PageHeader title='Library' caption={`${games.length} ${games.length === 1 ? 'game' : 'games'} · ${games.filter((g) => (g.session_count ?? 0) > 0).length} Played`}>
        <Button asChild>
          <Link to='/library/new'>
            <Plus size={14} /> Add Game
          </Link>
        </Button>
      </PageHeader>

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
      </div>

      {games.length === 0 ? (
        <EmptyState icon={Dices} description={search ? 'No games match your search.' : 'Your library is empty.'}>
          {!search && (
            <Link to='/library/new' className='text-sm text-primary hover:underline'>
              Add your first game →
            </Link>
          )}
        </EmptyState>
      ) : (
        <div className='grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'>
          {games.map((game) => (
            <GameCard key={game.id} {...game} />
          ))}
        </div>
      )}
    </Page>
  )
}
