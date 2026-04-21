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
      className={`flex items-center gap-3 bg-card border rounded-xl px-4 py-3 ${isDragging ? 'shadow-lg border-primary opacity-90' : 'border-border'}`}>
      <div {...attributes} {...listeners} className="cursor-grab text-muted-foreground select-none">
        <GripVertical size={16} />
      </div>
      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${rank === 1 ? 'bg-yellow-100 text-yellow-700' : 'bg-muted text-muted-foreground'}`}>
        {rank}
      </span>
      <span className="flex-1 font-medium text-sm">{player.name}</span>
      <span className="text-sm font-semibold text-primary">{calcPoints(n, rank)} pts</span>
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
      navigate(id ? `/library/${id}` : '/home');
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
      <h1 className="text-2xl font-bold text-foreground mb-8">Log Session</h1>

      {error && (
        <div className="mb-4 px-4 py-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Game *</label>
          <select value={gameId} onChange={e => setGameId(Number(e.target.value))}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
            <option value={0}>Select a game…</option>
            {games.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Date *</label>
            <input type="date" value={playedAt} onChange={e => setPlayedAt(e.target.value)}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Notes</label>
            <input type="text" value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Optional notes…"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>

        {/* Player search */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Add Players</label>
          <div className="relative">
            <input type="text" value={playerSearch} onChange={e => setPlayerSearch(e.target.value)}
              placeholder="Search players…"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            {playerSearch && filteredPlayers.length > 0 && (
              <ul className="absolute z-10 w-full bg-card border border-border rounded-lg mt-1 shadow-lg max-h-48 overflow-y-auto">
                {filteredPlayers.slice(0, 8).map(p => (
                  <li key={p.id}>
                    <button type="button" onClick={() => addPlayer(p)}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground">{p.name}</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button type="button" onClick={() => setShowNewPlayer(v => !v)}
            className="mt-2 text-xs text-primary hover:underline">
            + Create new player
          </button>
          {showNewPlayer && (
            <div className="flex gap-2 mt-2">
              <input type="text" value={newPlayerName} onChange={e => setNewPlayerName(e.target.value)}
                placeholder="Player name…"
                className="flex-1 border border-border rounded-lg px-3 py-1.5 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              <button type="button" onClick={createPlayer}
                className="px-3 py-1.5 bg-foreground text-background text-sm rounded-lg hover:bg-foreground/90">Add</button>
            </div>
          )}
        </div>

        {/* Ranked list */}
        {ranked.length > 0 && (
          <div>
            <p className="text-sm font-medium text-foreground mb-2">
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
                        className="text-muted-foreground hover:text-destructive">
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
            className="px-6 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50">
            {submitting ? 'Saving…' : 'Log Session'}
          </button>
          <button type="button" onClick={() => navigate(-1)}
            className="px-6 py-2 border border-border text-sm font-medium rounded-lg hover:bg-accent hover:text-accent-foreground">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
