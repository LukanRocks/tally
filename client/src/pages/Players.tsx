import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { UserRound, Camera, Pencil, Trash2, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { api, Player } from '../lib/api'
import { useSettings } from '../contexts/SettingsContext'

export default function Players() {
  const { settings } = useSettings()
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [editId, setEditId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [nameInvalid, setNameInvalid] = useState(false)
  const avatarRefs = useRef<Record<number, HTMLInputElement | null>>({})

  useEffect(() => {
    api.players.list().then((data) => {
      setPlayers(data)
      setLoading(false)
    })
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) {
      setNameInvalid(true)
      return
    }
    setNameInvalid(false)
    try {
      const p = await api.players.create(newName.trim())
      setPlayers((ps) => [...ps, p])
      setNewName('')
      setError('')
      toast.success(`${p.name} added`)
    } catch (err: any) {
      setError(err.message)
    }
  }

  async function handleUpdate(id: number) {
    if (!editName.trim()) return
    try {
      const updated = await api.players.update(id, editName.trim())
      setPlayers((ps) => ps.map((p) => (p.id === id ? { ...p, ...updated } : p)))
      setEditId(null)
      setError('')
    } catch (err: any) {
      setError(err.message)
    }
  }

  async function handleDelete(id: number) {
    const name = players.find((p) => p.id === id)?.name
    await api.players.delete(id)
    setPlayers((ps) => ps.filter((p) => p.id !== id))
    setDeleteId(null)
    toast.success(`${name} deleted`)
  }

  async function handleAvatar(id: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const updated = await api.players.uploadAvatar(id, file)
    setPlayers((ps) => ps.map((p) => (p.id === id ? { ...p, avatar_path: updated.avatar_path } : p)))
  }

  if (loading) return <div className='p-4 text-muted-foreground md:p-8'>Loading…</div>

  return (
    <div className='max-w-3xl p-4 md:p-8'>
      <h1 className='mb-6 text-2xl font-bold text-foreground'>Players</h1>

      {error && <div className='mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive'>{error}</div>}

      {/* Add player */}
      <form onSubmit={handleCreate} className='mb-8 flex gap-2'>
        <input
          type='text'
          value={newName}
          onChange={(e) => {
            setNewName(e.target.value)
            if (nameInvalid) setNameInvalid(false)
          }}
          placeholder='New player name…'
          className={`flex-1 rounded-lg border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:outline-none ${nameInvalid ? 'border-destructive focus:ring-destructive/50' : 'border-border focus:ring-ring'}`}
        />
        <button type='submit' className='flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90'>
          <UserPlus size={14} /> Add Player
        </button>
      </form>

      {players.length === 0 ? (
        <div className='py-16 text-center text-muted-foreground'>
          <UserRound size={40} className='mx-auto mb-3 text-muted-foreground/50' />
          <p>No players yet. Add the first one above.</p>
        </div>
      ) : (
        <ul className='space-y-3'>
          {players.map((p) => (
            <li key={p.id} className='relative flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 transition-colors hover:bg-accent/30'>
              {editId !== p.id && <Link to={`/players/${p.id}`} className='absolute inset-0 rounded-xl' aria-label={p.name} />}

              {/* Avatar */}
              <button onClick={() => avatarRefs.current[p.id]?.click()} className='group relative z-10 shrink-0'>
                <div className='flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-muted'>
                  {p.avatar_path ? <img src={p.avatar_path} alt={p.name} className='h-full w-full object-cover' /> : <UserRound size={20} className='text-muted-foreground' />}
                </div>
                <div className='absolute inset-0 flex items-center justify-center rounded-full bg-black/30 opacity-0 transition-opacity group-hover:opacity-100'>
                  <Camera size={13} className='text-white' />
                </div>
                <input
                  type='file'
                  ref={(el) => {
                    avatarRefs.current[p.id] = el
                  }}
                  className='hidden'
                  accept='image/jpeg,image/png,image/webp'
                  onChange={(e) => handleAvatar(p.id, e)}
                />
              </button>

              {/* Name */}
              <div className='min-w-0 flex-1'>
                {editId === p.id ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleUpdate(p.id)
                    }}
                    className='relative z-10 flex gap-2'
                  >
                    <input
                      type='text'
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      autoFocus
                      className='flex-1 rounded-lg border border-border bg-background px-2 py-1 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none'
                    />
                    <button type='submit' className='text-xs text-primary hover:underline'>
                      Save
                    </button>
                    <button type='button' onClick={() => setEditId(null)} className='text-xs text-muted-foreground hover:underline'>
                      Cancel
                    </button>
                  </form>
                ) : (
                  <>
                    <p className='text-sm font-semibold text-foreground'>{p.name}</p>
                    <p className='mt-0.5 text-xs text-muted-foreground'>
                      {p.total_points ?? 0} pts · {p.total_sessions ?? 0} sessions
                    </p>
                  </>
                )}
              </div>

              {/* Actions */}
              {editId !== p.id && (
                <div className='relative z-10 flex shrink-0 gap-2'>
                  <button
                    onClick={() => {
                      setEditId(p.id)
                      setEditName(p.name)
                    }}
                    className='flex items-center gap-1 rounded-lg border border-border px-3 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  >
                    <Pencil size={11} /> Edit
                  </button>
                  <button
                    onClick={() => setDeleteId(p.id)}
                    disabled={p.id === settings?.default_owner_id}
                    title={p.id === settings?.default_owner_id ? 'Default owner — change in Settings first' : undefined}
                    className='flex items-center gap-1 rounded-lg border border-destructive/30 px-3 py-1 text-xs text-destructive hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent'
                  >
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
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
          <div className='w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-xl'>
            <h3 className='mb-2 text-lg font-semibold'>Delete player?</h3>
            <p className='mb-6 text-sm text-muted-foreground'>Their session results will be hidden but session data is retained.</p>
            <div className='flex justify-end gap-3'>
              <button onClick={() => setDeleteId(null)} className='rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground'>
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteId)} className='rounded-lg bg-destructive px-4 py-2 text-sm text-white hover:bg-destructive/90'>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
