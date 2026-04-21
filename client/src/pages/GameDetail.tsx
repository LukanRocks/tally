import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Camera, Dices, Paperclip, Plus, Trash2, Pencil } from 'lucide-react';
import { api, Game, Session } from '../lib/api';

export default function GameDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [attachLabel, setAttachLabel] = useState('');
  const attachFileRef = useRef<HTMLInputElement>(null);
  const coverFileRef = useRef<HTMLInputElement>(null);

  const gid = Number(id);

  useEffect(() => {
    Promise.all([
      api.games.get(gid),
      api.sessions.list(),
    ]).then(([g, ss]) => {
      setGame(g);
      setSessions(ss.filter(s => s.game_id === gid));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [gid]);

  async function handleDelete() {
    await api.games.delete(gid);
    navigate('/library');
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const updated = await api.games.uploadCover(gid, file);
    setGame(updated);
  }

  async function handleAttachmentUpload(e: React.FormEvent) {
    e.preventDefault();
    const file = attachFileRef.current?.files?.[0];
    if (!file || !attachLabel.trim()) return;
    const attachment = await api.games.uploadAttachment(gid, file, attachLabel);
    setGame(g => g ? { ...g, attachments: [...(g.attachments ?? []), attachment] } : g);
    setAttachLabel('');
    if (attachFileRef.current) attachFileRef.current.value = '';
  }

  async function handleDeleteAttachment(aid: number) {
    await api.games.deleteAttachment(gid, aid);
    setGame(g => g ? { ...g, attachments: g.attachments?.filter(a => a.id !== aid) } : g);
  }

  if (loading) return <div className="p-4 md:p-8 text-muted-foreground">Loading…</div>;
  if (!game) return <div className="p-4 md:p-8 text-muted-foreground">Game not found.</div>;

  return (
    <div className="p-4 md:p-8 max-w-4xl">
      <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
        <Link to="/library" className="hover:text-foreground">Library</Link>
        <span>/</span>
        <span className="text-foreground font-medium">{game.name}</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-8">
        {/* Cover */}
        <div className="shrink-0">
          <div className="w-40 h-52 bg-muted rounded-xl overflow-hidden relative group cursor-pointer"
            onClick={() => coverFileRef.current?.click()}>
            {game.cover_image_path ? (
              <img src={game.cover_image_path} alt={game.name} className="w-full h-full object-cover" />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Dices size={40} className="text-muted-foreground/40" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera size={20} className="text-white" />
            </div>
          </div>
          <input type="file" ref={coverFileRef} className="hidden" accept="image/jpeg,image/png,image/webp"
            onChange={handleCoverUpload} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <h1 className="text-2xl font-bold text-foreground">{game.name}</h1>
            <div className="flex gap-2 shrink-0">
              <Link to={`/library/${gid}/session/new`}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90">
                <Plus size={14} /> Session
              </Link>
              <Link to={`/library/${gid}/edit`}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-sm font-medium rounded-lg hover:bg-accent hover:text-accent-foreground">
                <Pencil size={13} /> Edit
              </Link>
              <button onClick={() => setDeleteConfirm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-destructive/30 text-destructive text-sm font-medium rounded-lg hover:bg-destructive/10">
                <Trash2 size={13} /> Delete
              </button>
            </div>
          </div>

          <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
            {game.min_players && game.max_players && (
              <span>{game.min_players}–{game.max_players} players</span>
            )}
            {game.purchase_at && <span>Purchased {game.purchase_at}</span>}
            {game.price != null && <span>${game.price.toFixed(2)}</span>}
          </div>

          {game.description && (
            <p className="mt-4 text-foreground/80 text-sm leading-relaxed">{game.description}</p>
          )}
          {game.quick_rules && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Quick Rules</p>
              <p className="text-foreground/80 text-sm leading-relaxed whitespace-pre-line">{game.quick_rules}</p>
            </div>
          )}
        </div>
      </div>

      {/* Attachments */}
      <div className="mt-8">
        <h2 className="flex items-center gap-2 text-base font-semibold text-foreground mb-3">
          <Paperclip size={15} /> Attachments
        </h2>
        {game.attachments?.length ? (
          <ul className="space-y-2 mb-4">
            {game.attachments.map(a => (
              <li key={a.id} className="flex items-center justify-between bg-muted/50 border border-border rounded-lg px-4 py-2">
                <a href={a.file_path} target="_blank" rel="noreferrer"
                  className="text-sm text-primary hover:underline">{a.label}</a>
                <button onClick={() => handleDeleteAttachment(a.id)}
                  className="text-destructive/60 hover:text-destructive">
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground mb-4">No attachments yet.</p>
        )}
        <form onSubmit={handleAttachmentUpload} className="flex gap-2">
          <input type="text" placeholder="Label (e.g. Rulebook)" value={attachLabel}
            onChange={e => setAttachLabel(e.target.value)}
            className="border border-border rounded-lg px-3 py-1.5 text-sm flex-1 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          <input type="file" ref={attachFileRef} accept="application/pdf"
            className="border border-border rounded-lg px-3 py-1.5 text-sm bg-background text-foreground" />
          <button type="submit"
            className="px-4 py-1.5 bg-foreground text-background text-sm font-medium rounded-lg hover:bg-foreground/90">
            Upload
          </button>
        </form>
      </div>

      {/* Session history */}
      <div className="mt-8">
        <h2 className="text-base font-semibold text-foreground mb-3">Session History</h2>
        {sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No sessions logged for this game.</p>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs text-muted-foreground uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Players</th>
                    <th className="px-4 py-3 text-left">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sessions.map(s => (
                    <tr key={s.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">{s.played_at}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.player_count} players</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.notes ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirm dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card text-card-foreground rounded-2xl p-6 w-full max-w-sm shadow-xl border border-border">
            <h3 className="text-lg font-semibold mb-2">Delete "{game.name}"?</h3>
            <p className="text-sm text-muted-foreground mb-6">This will soft-delete the game, all its sessions, and attachments.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(false)}
                className="px-4 py-2 border border-border text-sm rounded-lg hover:bg-accent hover:text-accent-foreground">Cancel</button>
              <button onClick={handleDelete}
                className="px-4 py-2 bg-destructive text-white text-sm rounded-lg hover:bg-destructive/90">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
