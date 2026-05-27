import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Dices, Plus, Rows3, LayoutGrid, ShelvingUnit, ArrowUp, ArrowDown } from 'lucide-react'

import { Page, PageHeader } from '@/components/layout/page'
import { Button, ButtonGroup } from '@/components/atoms/button'
import { GameCard } from '@/components/molecules/game-card'
import { EmptyState } from '@/components/feedback/empty-state'
import { Field } from '@/components/atoms/field'
import { Input } from '@/components/atoms/input'
import { SearchInput } from '@/components/molecules/search-input'
import { SortControl } from '@/components/molecules/sort-control'
import { Toggle } from '@/components/atoms/toggle'

import { api, Game, Player } from '@/lib/http-transport/api'

export default function Library() {
  const [games, setGames] = useState<Game[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [search, setSearch] = useState('')
  const [activeSearch, setActiveSearch] = useState('')
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
        setActiveSearch(search)
        setLoading(false)
      })
      .catch(() => setLoading(false)) //!todo handle errors
  }, [search, sort, order, minPlayers, maxPlayers, ownerId])

  return (
    <Page>
      <PageHeader title='Library' caption={`${games.length} ${games.length === 1 ? 'game' : 'games'} · ${games.filter((g) => (g.session_count ?? 0) > 0).length} Played`}>
        <Button polymorphic>
          <Link to='/library/new'>
            <Plus size={14} /> Add Game
          </Link>
        </Button>
      </PageHeader>

      <div className='flex flex-wrap items-end gap-2'>
        <ButtonGroup className='order-last sm:order-first'>
          <Toggle variant='outline' color='secondary' pressed={false}>
            <Rows3 />
          </Toggle>
          <Toggle variant='outline' color='secondary' pressed>
            <LayoutGrid />
          </Toggle>
          <Toggle variant='outline' color='secondary' pressed={false}>
            <ShelvingUnit />
          </Toggle>
        </ButtonGroup>

        <SearchInput className='order-first sm:order-0' placeholder='Search games…' value={search} onChange={(e) => setSearch(e.target.value)} />

        <SortControl
          sort={sort}
          order={order}
          onSortChange={setSort}
          onOrderChange={setOrder}
          options={[
            { value: 'name', label: 'Name' },
            { value: 'date_added', label: 'Date Added' },
            { value: 'most_played', label: 'Most Played' },
            { value: 'price', label: 'Price' },
          ]}
        />

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
          <EmptyState icon={Dices} description={activeSearch ? 'No games match your search.' : 'Your library is empty.'}>
            {!activeSearch && (
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
