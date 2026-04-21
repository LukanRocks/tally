import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, Player } from '../lib/api'
import { useSettings } from '../contexts/SettingsContext'

type FormData = {
  name: string
  description: string
  quick_rules: string
  min_players: string
  max_players: string
  purchase_at: string
  price: string
  owner_id: string
}

const empty: FormData = {
  name: '',
  description: '',
  quick_rules: '',
  min_players: '',
  max_players: '',
  purchase_at: '',
  price: '',
  owner_id: '',
}

export default function GameForm() {
  const { settings } = useSettings()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [form, setForm] = useState<FormData>(empty)
  const [players, setPlayers] = useState<Player[]>([])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isEdit) {
      Promise.all([api.games.get(Number(id)), api.players.list()]).then(([g, playerList]) => {
        setForm({
          name: g.name,
          description: g.description ?? '',
          quick_rules: g.quick_rules ?? '',
          min_players: g.min_players != null ? String(g.min_players) : '',
          max_players: g.max_players != null ? String(g.max_players) : '',
          purchase_at: g.purchase_at ?? '',
          price: g.price != null ? String(g.price) : '',
          owner_id: g.owner_id != null ? String(g.owner_id) : '',
        })
        setPlayers(playerList)
      })
    } else {
      api.players.list().then((playerList) => {
        setPlayers(playerList)
        setForm((f) => ({ ...f, owner_id: settings?.default_owner_id != null ? String(settings.default_owner_id) : '' }))
      })
    }
  }, [id, isEdit])

  function set(field: keyof FormData) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('Name is required')
      return
    }
    setError('')
    setSubmitting(true)

    const payload = {
      name: form.name.trim(),
      description: form.description || null,
      quick_rules: form.quick_rules || null,
      min_players: form.min_players ? Number(form.min_players) : null,
      max_players: form.max_players ? Number(form.max_players) : null,
      purchase_at: form.purchase_at || null,
      price: form.price ? Number(form.price) : null,
      owner_id: form.owner_id ? Number(form.owner_id) : null,
    }

    try {
      if (isEdit) {
        await api.games.update(Number(id), payload)
        navigate(`/library/${id}`)
      } else {
        const game = await api.games.create(payload as Parameters<typeof api.games.create>[0])
        navigate(`/library/${game.id}`)
      }
    } catch (err: any) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <div className='max-w-2xl p-4 md:p-8'>
      <div className='mb-6 flex items-center gap-2 text-sm text-muted-foreground'>
        <Link to='/library' className='hover:text-foreground'>
          Library
        </Link>
        <span>/</span>
        <span className='font-medium text-foreground'>{isEdit ? 'Edit Game' : 'Add Game'}</span>
      </div>

      <h1 className='mb-8 text-2xl font-bold text-foreground'>{isEdit ? 'Edit Game' : 'Add Game'}</h1>

      {error && <div className='mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive'>{error}</div>}

      <form onSubmit={handleSubmit} className='space-y-5'>
        <Field label='Name *' htmlFor='name'>
          <input id='name' type='text' value={form.name} onChange={set('name')} required className='input' placeholder='Wingspan' />
        </Field>

        <Field label='Description' htmlFor='description'>
          <textarea
            id='description'
            value={form.description}
            onChange={set('description')}
            rows={3}
            className='input resize-none'
            placeholder='A beautiful engine-builder about birds…'
          />
        </Field>

        <Field label='Quick Rules' htmlFor='quick_rules'>
          <textarea id='quick_rules' value={form.quick_rules} onChange={set('quick_rules')} rows={4} className='input resize-none' placeholder='Brief rules summary…' />
        </Field>

        <div className='grid grid-cols-2 gap-4'>
          <Field label='Min Players' htmlFor='min_players'>
            <input id='min_players' type='number' min={1} value={form.min_players} onChange={set('min_players')} className='input' placeholder='1' />
          </Field>
          <Field label='Max Players' htmlFor='max_players'>
            <input id='max_players' type='number' min={1} value={form.max_players} onChange={set('max_players')} className='input' placeholder='5' />
          </Field>
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <Field label='Purchase Date' htmlFor='purchase_at'>
            <input id='purchase_at' type='date' value={form.purchase_at} onChange={set('purchase_at')} className='input' />
          </Field>
          <Field label='Price' htmlFor='price'>
            <input id='price' type='number' min={0} step='0.01' value={form.price} onChange={set('price')} className='input' placeholder='49.99' />
          </Field>
        </div>

        <Field label='Owner' htmlFor='owner_id'>
          <select id='owner_id' value={form.owner_id} onChange={set('owner_id')} className='input'>
            <option value=''>— None —</option>
            {players.map((p) => (
              <option key={p.id} value={String(p.id)}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>

        <div className='flex gap-3 pt-2'>
          <button
            type='submit'
            disabled={submitting}
            className='rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50'
          >
            {submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Game'}
          </button>
          <Link to={isEdit ? `/library/${id}` : '/library'} className='rounded-lg border border-border px-6 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground'>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className='mb-1.5 block text-sm font-medium text-foreground'>
        {label}
      </label>
      {children}
    </div>
  )
}
