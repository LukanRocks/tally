import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X } from 'lucide-react';
import { api, Game, Player } from '../lib/api';

interface RankedPlayer {
  id: number;
  name: string;
}

function calcPoints(n: number, rank: number) {
  return (n - rank) + (rank === 1 ? 1 : 0);
}

function SortableItem({ player, rank, n }: { player: RankedPlayer; rank: number; n: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: player.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style}
      className={`flex items-center gap-3 bg-white border rounded-xl px-4 py-3 ${isDragging ? 'shadow-lg border-brand-500 opacity-90' : 'border-gray-200'}`}>
      <div {...attributes} {...listeners} className="cursor-grab text-gray-400 select-none">
        <GripVertical size={16} />
      </div>
      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${rank === 1 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
        {rank}
      </span>
      <span className="flex-1 font-medium text-sm">{player.name}</span>
      <span className="text-sm font-semibold text-brand-600">{calcPoints(n, rank)} pts</span>
    </div>
  );
}

export default function SessionLogger() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [games, setGames] = useState<Game[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameId, setGameId] = useState(id ? Number(id) : 0);
  const [playedAt, setPlayedAt] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [ranked, setRanked] = useState<RankedPlayer[]>([]);
  const [playerSearch, setPlayerSearch] = useState('');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [showNewPlayer, setShowNewPlayer] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    Promise.all([api.games.list(), api.players.list()]).then(([g, p]) => {
      setGames(g);
      setPlayers(p);
    });
  }, []);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setRanked(items => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  function addPlayer(player: Player) {
    if (ranked.some(r => r.id === player.id)) return;
    setRanked(r => [...r, { id: player.id, name: player.name }]);
    setPlayerSearch('');
  }

  function removePlayer(pid: number) {
    setRanked(r => r.filter(p => p.id !== pid));
  }

  async function createPlayer() {
    if (!newPlayerName.trim()) return;
    try {
      const p = await api.players.create(newPlayerName.trim());
      setPlayers(ps => [...ps, p]);
      addPlayer(p);
      setNewPlayerName('');
      setShowNewPlayer(false);
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!gameId) { setError('Select a game'); return; }
    if (ranked.length < 2) { setError('At least 2 players required'); return; }
    setError('');
    setSubmitting(true);

    try {
      await api.sessions.create({
        game_id: gameId,
        played_at: playedAt,
        notes: notes || undefined,
        results: ranked.map((p, i) => ({ player_id: p.id, rank: i + 1 })),
      });
      navigate(id ? `/library/${id}` : '/dashboard');
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  const filteredPlayers = players.filter(p =>
    p.name.toLowerCase().includes(playerSearch.toLowerCase()) &&
    !ranked.some(r => r.id === p.id)
  );

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Log Session</h1>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Game *</label>
          <select value={gameId} onChange={e => setGameId(Number(e.target.value))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
            <option value={0}>Select a game…</option>
            {games.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Date *</label>
            <input type="date" value={playedAt} onChange={e => setPlayedAt(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
            <input type="text" value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Optional notes…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
        </div>

        {/* Player search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Add Players</label>
          <div className="relative">
            <input type="text" value={playerSearch} onChange={e => setPlayerSearch(e.target.value)}
              placeholder="Search players…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            {playerSearch && filteredPlayers.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg max-h-48 overflow-y-auto">
                {filteredPlayers.slice(0, 8).map(p => (
                  <li key={p.id}>
                    <button type="button" onClick={() => addPlayer(p)}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">{p.name}</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button type="button" onClick={() => setShowNewPlayer(v => !v)}
            className="mt-2 text-xs text-brand-600 hover:underline">
            + Create new player
          </button>
          {showNewPlayer && (
            <div className="flex gap-2 mt-2">
              <input type="text" value={newPlayerName} onChange={e => setNewPlayerName(e.target.value)}
                placeholder="Player name…"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
              <button type="button" onClick={createPlayer}
                className="px-3 py-1.5 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-700">Add</button>
            </div>
          )}
        </div>

        {/* Ranked list */}
        {ranked.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Ranking — drag to reorder (1st at top)
            </p>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={ranked.map(p => p.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {ranked.map((p, i) => (
                    <div key={p.id} className="flex items-center gap-2">
                      <div className="flex-1">
                        <SortableItem player={p} rank={i + 1} n={ranked.length} />
                      </div>
                      <button type="button" onClick={() => removePlayer(p.id)}
                        className="text-gray-400 hover:text-red-500">
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={submitting}
            className="px-6 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50">
            {submitting ? 'Saving…' : 'Log Session'}
          </button>
          <button type="button" onClick={() => navigate(-1)}
            className="px-6 py-2 border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
