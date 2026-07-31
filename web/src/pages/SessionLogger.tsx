import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, X } from 'lucide-react'
import { api, Game, Player } from '@/lib/http-transport/api'

interface RankedPlayer {
  id: number
  name: string
}

function calcPoints(n: number, rank: number) {
  if (n < 2) return 0
  return n - (rank - 1) + (rank === 1 ? 1 : 0)
}

function SortableItem({ player, rank, n }: { player: RankedPlayer; rank: number; n: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: player.id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-xl border bg-paper-primary px-4 py-3 ${isDragging ? 'border-primary opacity-90 shadow-lg' : 'border-paper-muted'}`}
    >
      <div {...attributes} {...listeners} className='cursor-grab text-ink-muted select-none'>
        <GripVertical size={16} />
      </div>
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${rank === 1 ? 'bg-yellow-100 text-yellow-700' : 'bg-paper-muted text-ink-muted'}`}
      >
        {rank}
      </span>
      <span className='flex-1 text-sm font-medium'>{player.name}</span>
      <span className='text-sm font-semibold text-primary'>{calcPoints(n, rank)} pts</span>
    </div>
  )
}

export default function SessionLogger() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const prefill = location.state as { players?: { id: number; rank: number }[]; gameId?: number } | null
  const [games, setGames] = useState<Game[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [gameId, setGameId] = useState(id ? Number(id) : 0)
  const [playedAt, setPlayedAt] = useState(new Date().toISOString().slice(0, 10))
  const [notes, setNotes] = useState('')
  const [ranked, setRanked] = useState<RankedPlayer[]>([])
  const [playerSearch, setPlayerSearch] = useState('')
  const [newPlayerName, setNewPlayerName] = useState('')
  const [showNewPlayer, setShowNewPlayer] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))

  useEffect(() => {
    Promise.all([api.games.list(), api.players.list()]).then(([g, p]) => {
      setGames(g)
      setPlayers(p)

      if (prefill?.gameId) {
        setGameId(prefill.gameId)
      }

      if (prefill?.players?.length) {
        const sorted = [...prefill.players].sort((a, b) => a.rank - b.rank)
        const rankedPlayers = sorted
          .map((pf) => p.find((pl) => pl.id === pf.id))
          .filter((pl): pl is Player => Boolean(pl))
          .map((pl) => ({ id: pl.id, name: pl.name }))
        setRanked(rankedPlayers)
      }
    })
  }, [])

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setRanked((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id)
        const newIndex = items.findIndex((i) => i.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  function addPlayer(player: Player) {
    if (ranked.some((r) => r.id === player.id)) return
    setRanked((r) => [...r, { id: player.id, name: player.name }])
    setPlayerSearch('')
  }

  function removePlayer(pid: number) {
    setRanked((r) => r.filter((p) => p.id !== pid))
  }

  async function createPlayer() {
    if (!newPlayerName.trim()) return
    try {
      const p = await api.players.create(newPlayerName.trim())
      setPlayers((ps) => [...ps, p])
      addPlayer(p)
      setNewPlayerName('')
      setShowNewPlayer(false)
    } catch (e: any) {
      setError(e.message)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!gameId) {
      setError('Select a game')
      return
    }
    if (ranked.length < 2) {
      setError('At least 2 players required')
      return
    }
    setError('')
    setSubmitting(true)

    try {
      const now = new Date()
      const timeStr = now.toTimeString().slice(0, 8)
      await api.sessions.create({
        game_id: gameId,
        played_at: `${playedAt}T${timeStr}`,
        notes: notes || undefined,
        results: ranked.map((p, i) => ({ player_id: p.id, rank: i + 1 })),
      })
      navigate(id ? `/library/${id}` : '/home')
    } catch (err: any) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  const filteredPlayers = players.filter((p) => p.player_type === 'person' && p.name.toLowerCase().includes(playerSearch.toLowerCase()) && !ranked.some((r) => r.id === p.id))

  return (
    <div className='max-w-2xl p-4 md:p-8'>
      <h1 className='mb-8 text-2xl font-bold text-ink-primary'>Log Session</h1>

      {error && <div className='mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive'>{error}</div>}

      <form onSubmit={handleSubmit} className='space-y-6'>
        <div>
          <label className='mb-1.5 block text-sm font-medium text-ink-primary'>Game *</label>
          <select
            value={gameId}
            onChange={(e) => setGameId(Number(e.target.value))}
            className='w-full rounded-lg border border-paper-muted bg-paper-primary px-3 py-2 text-sm text-ink-primary focus:ring-2 focus:ring-ring focus:outline-none'
          >
            <option value={0}>Select a game…</option>
            {games.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <div>
            <label className='mb-1.5 block text-sm font-medium text-ink-primary'>Date *</label>
            <input
              type='date'
              value={playedAt}
              onChange={(e) => setPlayedAt(e.target.value)}
              className='w-full rounded-lg border border-paper-muted bg-paper-primary px-3 py-2 text-sm text-ink-primary focus:ring-2 focus:ring-ring focus:outline-none'
            />
          </div>
          <div>
            <label className='mb-1.5 block text-sm font-medium text-ink-primary'>Notes</label>
            <input
              type='text'
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder='Optional notes…'
              className='w-full rounded-lg border border-paper-muted bg-paper-primary px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted focus:ring-2 focus:ring-ring focus:outline-none'
            />
          </div>
        </div>

        {/* Player search */}
        <div>
          <label className='mb-1.5 block text-sm font-medium text-ink-primary'>Add Players</label>
          <div className='relative'>
            <input
              type='text'
              value={playerSearch}
              onChange={(e) => setPlayerSearch(e.target.value)}
              placeholder='Search players…'
              className='w-full rounded-lg border border-paper-muted bg-paper-primary px-3 py-2 text-sm text-ink-primary placeholder:text-ink-muted focus:ring-2 focus:ring-ring focus:outline-none'
            />
            {playerSearch && filteredPlayers.length > 0 && (
              <ul className='absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-paper-muted bg-paper-primary shadow-lg'>
                {filteredPlayers.slice(0, 8).map((p) => (
                  <li key={p.id}>
                    <button type='button' onClick={() => addPlayer(p)} className='w-full px-4 py-2 text-left text-sm hover:bg-paper-muted hover:text-ink-primary'>
                      {p.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button type='button' onClick={() => setShowNewPlayer((v) => !v)} className='mt-2 text-xs text-primary hover:underline'>
            + Create new player
          </button>
          {showNewPlayer && (
            <div className='mt-2 flex gap-2'>
              <input
                type='text'
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                placeholder='Player name…'
                className='flex-1 rounded-lg border border-paper-muted bg-paper-primary px-3 py-1.5 text-sm text-ink-primary placeholder:text-ink-muted focus:ring-2 focus:ring-ring focus:outline-none'
              />
              <button type='button' onClick={createPlayer} className='rounded-lg bg-ink-primary px-3 py-1.5 text-sm text-paper-primary hover:bg-ink-primary/90'>
                Add
              </button>
            </div>
          )}
        </div>

        {/* Ranked list */}
        {ranked.length > 0 && (
          <div>
            <p className='mb-2 text-sm font-medium text-ink-primary'>Ranking — drag to reorder (1st at top)</p>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={ranked.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                <div className='space-y-2'>
                  {ranked.map((p, i) => (
                    <div key={p.id} className='flex items-center gap-2'>
                      <div className='flex-1'>
                        <SortableItem player={p} rank={i + 1} n={ranked.length} />
                      </div>
                      <button type='button' onClick={() => removePlayer(p.id)} className='text-ink-muted hover:text-destructive'>
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        )}

        <div className='flex gap-3 pt-2'>
          <button
            type='submit'
            disabled={submitting}
            className='rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50'
          >
            {submitting ? 'Saving…' : 'Log Session'}
          </button>
          <button type='button' onClick={() => navigate(-1)} className='rounded-lg border border-paper-muted px-6 py-2 text-sm font-medium hover:bg-paper-muted hover:text-ink-primary'>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
