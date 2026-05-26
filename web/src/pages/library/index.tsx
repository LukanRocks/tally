import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Dices, Plus, Search } from 'lucide-react'

import { Page, PageHeader } from '@/components/layout/page'
import { Button } from '@/components/atoms/button'
import { GameCard } from '@/components/game-card'
import { EmptyState } from '@/components/feedback/empty-state'
import { Field, FieldTitle } from '@/components/atoms/field'
import { Input } from '@/components/atoms/input'

import { api, Game, Player } from '@/lib/http-transport/api'

export default function Library() {
  const [games, setGames] = useState<Game[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('date_added')
  const [order, setOrder] = useState<'asc' | 'desc'>('desc')
  const [minPlayers, setMinPlayers] = useState('')
  const [maxPlayers, setMaxPlayers] = useState('')
  const [ownerId, setOwnerId] = useState('')
  const [loading, setLoading] = useState(true)

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

      <div className='flex flex-wrap items-end gap-2'>
        <Input type='text' placeholder='Search games…' className='w-full sm:w-80' startIcon={<Search size={15} />} value={search} onChange={(e) => setSearch(e.target.value)} />

        <Field className='w-36'>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className='input cursor-pointer'>
            <option value='name'>Name</option>
            <option value='date_added'>Date Added</option>
            <option value='most_played'>Most Played</option>
            <option value='price'>Price</option>
          </select>
        </Field>
        <Field className='w-32'>
          <select value={order} onChange={(e) => setOrder(e.target.value as 'asc' | 'desc')} className='input cursor-pointer'>
            <option value='asc'>Ascending</option>
            <option value='desc'>Descending</option>
          </select>
        </Field>
        <Field className='w-36'>
          <select value={ownerId} onChange={(e) => setOwnerId(e.target.value)} className='input cursor-pointer'>
            <option value=''>All owners</option>
            {players.map((p) => (
              <option key={p.id} value={String(p.id)}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
        <Field className='w-28'>
          <Input type='number' placeholder='–' value={minPlayers} onChange={(e) => setMinPlayers(e.target.value)} />
        </Field>
        <Field className='w-28'>
          <Input type='number' placeholder='–' value={maxPlayers} onChange={(e) => setMaxPlayers(e.target.value)} />
        </Field>
      </div>

      {!loading &&
        (games.length === 0 ? (
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
        ))}
    </Page>
  )
}
