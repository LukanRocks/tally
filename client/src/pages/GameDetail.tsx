import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Camera, Dices, Paperclip, Plus, Trash2, Pencil } from 'lucide-react'
import { api, Game, LeaderboardEntry, Session } from '../lib/api'
import { useSettings } from '../contexts/SettingsContext'

function formatPrice(price: number, currency: 'USD' | 'BRL' = 'USD') {
  const locale = currency === 'BRL' ? 'pt-BR' : 'en-US'
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(price)
}

export default function GameDetail() {
  const { settings } = useSettings()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [game, setGame] = useState<Game | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [gameLeaderboard, setGameLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [attachLabel, setAttachLabel] = useState('')
  const attachFileRef = useRef<HTMLInputElement>(null)
  const coverFileRef = useRef<HTMLInputElement>(null)

  const gid = Number(id)

  useEffect(() => {
    Promise.all([api.games.get(gid), api.sessions.list(), api.stats.leaderboardByGame(gid)])
      .then(([g, ss, lb]) => {
        setGame(g)
        setSessions(ss.filter((s) => s.game_id === gid))
        setGameLeaderboard(lb)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [gid])

  async function handleDelete() {
    await api.games.delete(gid)
    navigate('/library')
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const updated = await api.games.uploadCover(gid, file)
    setGame(updated)
  }

  async function handleAttachmentUpload(e: React.FormEvent) {
    e.preventDefault()
    const file = attachFileRef.current?.files?.[0]
    if (!file || !attachLabel.trim()) return
    const attachment = await api.games.uploadAttachment(gid, file, attachLabel)
    setGame((g) => (g ? { ...g, attachments: [...(g.attachments ?? []), attachment] } : g))
    setAttachLabel('')
    if (attachFileRef.current) attachFileRef.current.value = ''
  }

  async function handleDeleteAttachment(aid: number) {
    await api.games.deleteAttachment(gid, aid)
    setGame((g) => (g ? { ...g, attachments: g.attachments?.filter((a) => a.id !== aid) } : g))
  }

  if (loading) return <div className='p-4 text-muted-foreground md:p-8'>Loading…</div>
  if (!game) return <div className='p-4 text-muted-foreground md:p-8'>Game not found.</div>

  return (
    <div className='max-w-4xl p-4 md:p-8'>
      <div className='mb-6 flex items-center gap-2 text-sm text-muted-foreground'>
        <Link to='/library' className='hover:text-foreground'>
          Library
        </Link>
        <span>/</span>
        <span className='font-medium text-foreground'>{game.name}</span>
      </div>

      <div className='flex flex-col gap-8 sm:flex-row'>
        {/* Cover */}
        <div className='shrink-0'>
          <div className='group relative h-52 w-40 cursor-pointer overflow-hidden rounded-xl bg-muted' onClick={() => coverFileRef.current?.click()}>
            {game.cover_image_path ? (
              <img src={game.cover_image_path} alt={game.name} className='h-full w-full object-cover' />
            ) : (
              <div className='flex h-full items-center justify-center'>
                <Dices size={40} className='text-muted-foreground/40' />
              </div>
            )}
            <div className='absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100'>
              <Camera size={20} className='text-white' />
            </div>
          </div>
          <input type='file' ref={coverFileRef} className='hidden' accept='image/jpeg,image/png,image/webp' onChange={handleCoverUpload} />
        </div>

        {/* Info */}
        <div className='min-w-0 flex-1'>
          <div className='flex flex-wrap items-start justify-between gap-4'>
            <h1 className='text-2xl font-bold text-foreground'>{game.name}</h1>
            <div className='flex shrink-0 gap-2'>
              <Link
                to={`/library/${gid}/session/new`}
                className='flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90'
              >
                <Plus size={14} /> Session
              </Link>
              <Link
                to={`/library/${gid}/edit`}
                className='flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground'
              >
                <Pencil size={13} /> Edit
              </Link>
              <button
                onClick={() => setDeleteConfirm(true)}
                className='flex items-center gap-1.5 rounded-lg border border-destructive/30 px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/10'
              >
                <Trash2 size={13} /> Delete
              </button>
            </div>
          </div>

          <div className='mt-3 flex gap-4 text-sm text-muted-foreground'>
            {game.min_players && game.max_players && (
              <span>
                {game.min_players}–{game.max_players} players
              </span>
            )}
            {game.purchase_at && <span>Purchased {game.purchase_at}</span>}
            {game.price != null && <span>{formatPrice(game.price, settings?.currency)}</span>}
          </div>

          {game.description && <p className='mt-4 text-sm leading-relaxed text-foreground/80'>{game.description}</p>}
          {game.quick_rules && (
            <div className='mt-4'>
              <p className='mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase'>Quick Rules</p>
              <p className='text-sm leading-relaxed whitespace-pre-line text-foreground/80'>{game.quick_rules}</p>
            </div>
          )}
        </div>
      </div>

      {/* Attachments */}
      <div className='mt-8'>
        <h2 className='mb-3 flex items-center gap-2 text-base font-semibold text-foreground'>
          <Paperclip size={15} /> Attachments
        </h2>
        {game.attachments?.length ? (
          <ul className='mb-4 space-y-2'>
            {game.attachments.map((a) => (
              <li key={a.id} className='flex items-center justify-between rounded-lg border border-border bg-muted/50 px-4 py-2'>
                <a href={a.file_path} target='_blank' rel='noreferrer' className='text-sm text-primary hover:underline'>
                  {a.label}
                </a>
                <button onClick={() => handleDeleteAttachment(a.id)} className='text-destructive/60 hover:text-destructive'>
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className='mb-4 text-sm text-muted-foreground'>No attachments yet.</p>
        )}
        <form onSubmit={handleAttachmentUpload} className='flex gap-2'>
          <input
            type='text'
            placeholder='Label (e.g. Rulebook)'
            value={attachLabel}
            onChange={(e) => setAttachLabel(e.target.value)}
            className='flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none'
          />
          <input type='file' ref={attachFileRef} accept='application/pdf' className='rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground' />
          <button type='submit' className='rounded-lg bg-foreground px-4 py-1.5 text-sm font-medium text-background hover:bg-foreground/90'>
            Upload
          </button>
        </form>
      </div>

      {/* Leaderboard */}
      <div className='mt-8'>
        <h2 className='mb-3 text-base font-semibold text-foreground'>Leaderboard</h2>
        {gameLeaderboard.length === 0 ? (
          <p className='text-sm text-muted-foreground'>No sessions logged for this game.</p>
        ) : (
          <div className='overflow-hidden rounded-xl border border-border bg-card'>
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead className='bg-muted/50 text-xs tracking-wide text-muted-foreground uppercase'>
                  <tr>
                    <th className='px-4 py-3 text-left'>#</th>
                    <th className='px-4 py-3 text-left'>Player</th>
                    <th className='px-4 py-3 text-right'>Points</th>
                    <th className='px-4 py-3 text-right'>Wins</th>
                    <th className='px-4 py-3 text-right'>Sessions</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-border'>
                  {gameLeaderboard.map((e, i) => (
                    <tr key={e.player_id} className='hover:bg-muted/50'>
                      <td className='px-4 py-3 text-muted-foreground'>{i + 1}</td>
                      <td className='px-4 py-3 font-medium'>
                        <Link to={`/players/${e.player_id}`} className='hover:text-primary'>
                          {e.player_name}
                        </Link>
                      </td>
                      <td className='px-4 py-3 text-right font-semibold'>{e.total_points}</td>
                      <td className='px-4 py-3 text-right'>{e.wins}</td>
                      <td className='px-4 py-3 text-right text-muted-foreground'>{e.total_sessions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Session history */}
      <div className='mt-8'>
        <h2 className='mb-3 text-base font-semibold text-foreground'>Session History</h2>
        {sessions.length === 0 ? (
          <p className='text-sm text-muted-foreground'>No sessions logged for this game.</p>
        ) : (
          <div className='overflow-hidden rounded-xl border border-border bg-card'>
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead className='bg-muted/50 text-xs tracking-wide text-muted-foreground uppercase'>
                  <tr>
                    <th className='px-4 py-3 text-left'>Date</th>
                    <th className='px-4 py-3 text-left'>Players</th>
                    <th className='px-4 py-3 text-left'>Notes</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-border'>
                  {sessions.map((s) => (
                    <tr key={s.id} className='hover:bg-muted/50'>
                      <td className='px-4 py-3 font-medium'>{s.played_at.slice(0, 10)}</td>
                      <td className='px-4 py-3 text-muted-foreground'>{s.player_count} players</td>
                      <td className='px-4 py-3 text-muted-foreground'>{s.notes ?? '—'}</td>
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
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
          <div className='w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-xl'>
            <h3 className='mb-2 text-lg font-semibold'>Delete "{game.name}"?</h3>
            <p className='mb-6 text-sm text-muted-foreground'>This will soft-delete the game, all its sessions, and attachments.</p>
            <div className='flex justify-end gap-3'>
              <button onClick={() => setDeleteConfirm(false)} className='rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground'>
                Cancel
              </button>
              <button onClick={handleDelete} className='rounded-lg bg-destructive px-4 py-2 text-sm text-white hover:bg-destructive/90'>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
