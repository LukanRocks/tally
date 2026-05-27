import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, BggGame, Player } from '@/lib/http-transport/api'
import { useSettings } from '@/contexts/settings-context'

type FormData = {
  name: string
  description: string
  quick_rules: string
  min_players: string
  max_players: string
  purchase_at: string
  price: string
  owner_id: string
  year_published: string
  bgg_id: number | null
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
  year_published: '',
  bgg_id: null,
}

export default function GameForm() {
  const { settings } = useSettings()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [form, setForm] = useState<FormData>(empty)
  const [players, setPlayers] = useState<Player[]>([])
  const [bggResults, setBggResults] = useState<BggGame[]>([])
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
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
          year_published: g.year_published != null ? String(g.year_published) : '',
          bgg_id: g.bgg_id ?? null,
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

  function handleNameChange(value: string) {
    setForm((f) => ({ ...f, name: value, bgg_id: null }))
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (value.length < 2) {
      setBggResults([])
      return
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await api.bgg.search(value)
        setBggResults(results)
        setHighlightedIndex(-1)
      } catch {
        // silently ignore — autocomplete failure must not block the form
      }
    }, 300)
  }

  function handleBggSelect(game: BggGame) {
    setForm((f) => ({
      ...f,
      name: game.name,
      year_published: game.year_published != null ? String(game.year_published) : '',
      bgg_id: game.bgg_id,
    }))
    setBggResults([])
    setHighlightedIndex(-1)
  }

  function handleNameKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (bggResults.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((i) => Math.min(i + 1, bggResults.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault()
      handleBggSelect(bggResults[highlightedIndex])
    } else if (e.key === 'Escape') {
      setBggResults([])
      setHighlightedIndex(-1)
    }
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
      year_published: form.year_published ? Number(form.year_published) : null,
      bgg_id: form.bgg_id ?? null,
    }

    try {
      if (isEdit) {
        await api.games.update(Number(id), payload as Parameters<typeof api.games.update>[1])
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
          <div className='relative'>
            <input
              id='name'
              type='text'
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              onKeyDown={handleNameKeyDown}
              onBlur={() => setTimeout(() => setBggResults([]), 150)}
              required
              className='input w-full'
              placeholder='Wingspan'
              autoComplete='off'
              data-1p-ignore
              data-lpignore='true'
              data-form-type='other'
            />
            {bggResults.length > 0 && (
              <div className='absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-border bg-popover shadow-lg'>
                {bggResults.map((g, i) => (
                  <button
                    key={g.bgg_id}
                    type='button'
                    onMouseDown={(e) => {
                      e.preventDefault()
                      handleBggSelect(g)
                    }}
                    onMouseEnter={() => setHighlightedIndex(i)}
                    className={`flex w-full items-center px-3 py-2 text-left text-sm ${i === highlightedIndex ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground'}`}
                  >
                    {g.name}
                    {g.year_published != null && <span className='ml-1.5 text-xs text-muted-foreground'>({g.year_published})</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </Field>

        <Field label='Year Published' htmlFor='year_published'>
          <input
            id='year_published'
            type='number'
            min={1900}
            max={new Date().getFullYear() + 2}
            value={form.year_published}
            onChange={set('year_published')}
            className='input'
            placeholder='2019'
          />
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
