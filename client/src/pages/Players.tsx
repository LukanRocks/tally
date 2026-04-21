import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserRound, Camera, Pencil, Trash2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { api, Player } from '../lib/api';

export default function Players() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [nameInvalid, setNameInvalid] = useState(false);
  const avatarRefs = useRef<Record<number, HTMLInputElement | null>>({});

  useEffect(() => {
    api.players.list().then(data => { setPlayers(data); setLoading(false); });
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) { setNameInvalid(true); return; }
    setNameInvalid(false);
    try {
      const p = await api.players.create(newName.trim());
      setPlayers(ps => [...ps, p]);
      setNewName('');
      setError('');
      toast.success(`${p.name} added`);
    } catch (err: any) { setError(err.message); }
  }

  async function handleUpdate(id: number) {
    if (!editName.trim()) return;
    try {
      const updated = await api.players.update(id, editName.trim());
      setPlayers(ps => ps.map(p => p.id === id ? { ...p, ...updated } : p));
      setEditId(null);
      setError('');
    } catch (err: any) { setError(err.message); }
  }

  async function handleDelete(id: number) {
    const name = players.find(p => p.id === id)?.name;
    await api.players.delete(id);
    setPlayers(ps => ps.filter(p => p.id !== id));
    setDeleteId(null);
    toast.success(`${name} deleted`);
  }

  async function handleAvatar(id: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const updated = await api.players.uploadAvatar(id, file);
    setPlayers(ps => ps.map(p => p.id === id ? { ...p, avatar_path: updated.avatar_path } : p));
  }

  if (loading) return <div className="p-8 text-muted-foreground">Loading…</div>;

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-foreground mb-6">Players</h1>

      {error && (
        <div className="mb-4 px-4 py-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">{error}</div>
      )}

      {/* Add player */}
      <form onSubmit={handleCreate} className="flex gap-2 mb-8">
        <input type="text" value={newName} onChange={e => { setNewName(e.target.value); if (nameInvalid) setNameInvalid(false); }}
          placeholder="New player name…"
          className={`flex-1 border rounded-lg px-3 py-2 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 ${nameInvalid ? 'border-destructive focus:ring-destructive/50' : 'border-border focus:ring-ring'}`} />
        <button type="submit"
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90">
          <UserPlus size={14} /> Add Player
        </button>
      </form>

      {players.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <UserRound size={40} className="mx-auto mb-3 text-muted-foreground/50" />
          <p>No players yet. Add the first one above.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {players.map(p => (
            <li key={p.id}
              className="flex items-center gap-4 bg-card border border-border rounded-xl px-5 py-4">
              {/* Avatar */}
              <button onClick={() => avatarRefs.current[p.id]?.click()}
                className="relative shrink-0 group">
                <div className="w-11 h-11 rounded-full bg-muted overflow-hidden flex items-center justify-center">
                  {p.avatar_path ? (
                    <img src={p.avatar_path} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <UserRound size={20} className="text-muted-foreground" />
                  )}
                </div>
                <div className="absolute inset-0 rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera size={13} className="text-white" />
                </div>
                <input type="file" ref={el => { avatarRefs.current[p.id] = el; }} className="hidden"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={e => handleAvatar(p.id, e)} />
              </button>

              {/* Name */}
              <div className="flex-1 min-w-0">
                {editId === p.id ? (
                  <form onSubmit={e => { e.preventDefault(); handleUpdate(p.id); }} className="flex gap-2">
                    <input type="text" value={editName} onChange={e => setEditName(e.target.value)} autoFocus
                      className="border border-border rounded-lg px-2 py-1 text-sm flex-1 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                    <button type="submit" className="text-xs text-brand-600 hover:underline">Save</button>
                    <button type="button" onClick={() => setEditId(null)} className="text-xs text-muted-foreground hover:underline">Cancel</button>
                  </form>
                ) : (
                  <>
                    <Link to={`/players/${p.id}`} className="font-semibold text-sm text-foreground hover:text-brand-600">{p.name}</Link>
                    <p className="text-xs text-muted-foreground mt-0.5">{p.total_points ?? 0} pts · {p.total_sessions ?? 0} sessions</p>
                  </>
                )}
              </div>

              {/* Actions */}
              {editId !== p.id && (
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => { setEditId(p.id); setEditName(p.name); }}
                    className="flex items-center gap-1 text-xs text-muted-foreground border border-border rounded-lg px-3 py-1 hover:bg-accent hover:text-accent-foreground">
                    <Pencil size={11} /> Edit
                  </button>
                  <button onClick={() => setDeleteId(p.id)}
                    className="flex items-center gap-1 text-xs text-destructive border border-destructive/30 rounded-lg px-3 py-1 hover:bg-destructive/10">
                    <Trash2 size={11} /> Delete
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Delete confirm */}
      {deleteId != null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card text-card-foreground rounded-2xl p-6 w-full max-w-sm shadow-xl border border-border">
            <h3 className="text-lg font-semibold mb-2">Delete player?</h3>
            <p className="text-sm text-muted-foreground mb-6">Their session results will be hidden but session data is retained.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)}
                className="px-4 py-2 border border-border text-sm rounded-lg hover:bg-accent hover:text-accent-foreground">Cancel</button>
              <button onClick={() => handleDelete(deleteId)}
                className="px-4 py-2 bg-destructive text-white text-sm rounded-lg hover:bg-destructive/90">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
