import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { api, Player } from '../lib/api'
import { ThemeSetting } from '../hooks/useTheme'
import { useSettings } from '../contexts/SettingsContext'

type FormState = {
  currency: 'USD' | 'BRL'
  language: 'en' | 'pt'
  theme: ThemeSetting
  default_owner_id: string
}

export default function SettingsPage() {
  const navigate = useNavigate()
  const { settings: ctxSettings, updateSetting, refreshSettings, isLoading: settingsLoading } = useSettings()
  const [form, setForm] = useState<FormState>({
    currency: 'USD',
    language: 'en',
    theme: 'system',
    default_owner_id: '',
  })
  const [players, setPlayers] = useState<Player[]>([])
  const [playersLoading, setPlayersLoading] = useState(true)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [resetConfirmText, setResetConfirmText] = useState('')
  const [resetting, setResetting] = useState(false)
  const [bggLastUpdated, setBggLastUpdated] = useState<string | null>(null)
  const [bggFile, setBggFile] = useState<File | null>(null)
  const [bggImporting, setBggImporting] = useState(false)
  const [showBggDeleteConfirm, setShowBggDeleteConfirm] = useState(false)
  const [bggDeleteText, setBggDeleteText] = useState('')
  const [bggDeleting, setBggDeleting] = useState(false)
  const formInitialized = useRef(false)

  useEffect(() => {
    if (ctxSettings && !formInitialized.current) {
      formInitialized.current = true
      setForm({
        currency: ctxSettings.currency,
        language: ctxSettings.language,
        theme: ctxSettings.theme,
        default_owner_id: ctxSettings.default_owner_id != null ? String(ctxSettings.default_owner_id) : '',
      })
      setBggLastUpdated(ctxSettings.bgg_last_updated ?? null)
    }
  }, [ctxSettings])

  useEffect(() => {
    api.players.list().then((playerList) => {
      setPlayers(playerList)
      setPlayersLoading(false)
    })
  }, [])

  async function set<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [field]: value }))
    const patch =
      field === 'default_owner_id'
        ? { default_owner_id: value ? Number(value) : null }
        : { [field]: value }
    try {
      await updateSetting(patch as Parameters<typeof updateSetting>[0])
      toast.success('Settings saved')
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  async function handleBggImport() {
    if (!bggFile) return
    setBggImporting(true)
    try {
      const result = await api.bgg.import(bggFile)
      setBggLastUpdated(new Date().toISOString())
      setBggFile(null)
      toast.success(`BGG data updated — ${result.imported} games imported`)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setBggImporting(false)
    }
  }

  async function handleBggDelete() {
    setBggDeleting(true)
    try {
      await api.bgg.delete()
      setBggLastUpdated(null)
      setShowBggDeleteConfirm(false)
      setBggDeleteText('')
      toast.success('BGG data deleted')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setBggDeleting(false)
    }
  }

  async function handleReset() {
    setResetting(true)
    try {
      await api.settings.reset()
      await refreshSettings()
      setShowResetConfirm(false)
      setResetConfirmText('')
      toast.success('All data deleted')
      navigate('/onboarding', { replace: true })
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setResetting(false)
    }
  }

  if (settingsLoading || playersLoading) {
    return <div className='p-8 text-sm text-muted-foreground'>Loading…</div>
  }

  return (
    <div className='max-w-lg p-4 md:p-8'>
      <h1 className='mb-8 text-2xl font-bold text-foreground'>Settings</h1>

      <div className='space-y-6'>
        <Field label='Default Owner' htmlFor='default_owner_id'>
          <select
            id='default_owner_id'
            value={form.default_owner_id}
            onChange={(e) => set('default_owner_id', e.target.value)}
            className='input'
          >
            <option value=''>— None —</option>
            {players.map((p) => (
              <option key={p.id} value={String(p.id)}>
                {p.name}
              </option>
            ))}
          </select>
          <p className='mt-1 text-xs text-muted-foreground'>Automatically set as the owner when adding new games.</p>
        </Field>

        <Field label='Currency' htmlFor='currency'>
          <select
            id='currency'
            value={form.currency}
            onChange={(e) => set('currency', e.target.value as 'USD' | 'BRL')}
            className='input'
          >
            <option value='USD'>USD — US Dollar</option>
            <option value='BRL'>BRL — Brazilian Real</option>
          </select>
        </Field>

        <Field label='Language' htmlFor='language'>
          <select
            id='language'
            value={form.language}
            onChange={(e) => set('language', e.target.value as 'en' | 'pt')}
            className='input'
          >
            <option value='en'>English</option>
            <option value='pt'>Português</option>
          </select>
        </Field>

        <Field label='Theme' htmlFor='theme'>
          <select
            id='theme'
            value={form.theme}
            onChange={(e) => set('theme', e.target.value as ThemeSetting)}
            className='input'
          >
            <option value='system'>System</option>
            <option value='light'>Light</option>
            <option value='dark'>Dark</option>
          </select>
        </Field>
      </div>

      {/* BGG Data section */}
      <div className='mt-12 border-t border-border pt-8'>
        <div className='mb-4 flex items-center gap-3'>
          <h2 className='text-sm font-semibold text-foreground'>BGG Data</h2>
          <a href='https://boardgamegeek.com' target='_blank' rel='noopener noreferrer'>
            <img src='/bgg-logo.png' alt='BoardGameGeek' className='h-6' />
          </a>
        </div>

        <p className='mb-1 text-xs text-muted-foreground'>
          Game data provided by{' '}
          <a href='https://boardgamegeek.com' target='_blank' rel='noopener noreferrer' className='underline hover:text-foreground'>
            BoardGameGeek
          </a>
          . Download the data dump from the BGG website and import it here.
        </p>

        <p className='mb-4 text-xs text-muted-foreground'>
          {bggLastUpdated
            ? `Last updated: ${new Date(bggLastUpdated).toLocaleString(ctxSettings?.language === 'pt' ? 'pt-BR' : 'en-US')}`
            : 'No BGG data loaded.'}
        </p>

        <div className='flex items-center gap-2'>
          <input
            type='file'
            accept='.csv'
            onChange={(e) => setBggFile(e.target.files?.[0] ?? null)}
            className='text-sm text-muted-foreground file:mr-2 file:rounded file:border-0 file:bg-accent file:px-3 file:py-1 file:text-sm file:font-medium'
          />
          <button
            onClick={handleBggImport}
            disabled={!bggFile || bggImporting}
            className='rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50'
          >
            {bggImporting ? 'Importing…' : 'Import'}
          </button>
        </div>

        <div className='mt-4'>
          <button
            onClick={() => { setShowBggDeleteConfirm(true); setBggDeleteText('') }}
            className='rounded-lg border border-destructive/40 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10'
          >
            Delete BGG data
          </button>
        </div>
      </div>

      <div className='mt-12 border-t border-border pt-8'>
        <h2 className='mb-1 text-sm font-semibold text-destructive'>Danger Zone</h2>
        <p className='mb-4 text-xs text-muted-foreground'>Permanently deletes all games, sessions, players, and uploaded files. This cannot be undone.</p>
        <button
          onClick={() => { setShowResetConfirm(true); setResetConfirmText('') }}
          className='rounded-lg border border-destructive/40 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10'
        >
          Delete all data
        </button>
      </div>

      {showBggDeleteConfirm && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
          <div className='w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl'>
            <h3 className='mb-2 text-lg font-semibold text-foreground'>Delete BGG data?</h3>
            <p className='mb-4 text-sm text-muted-foreground'>
              All BoardGameGeek catalog data will be removed. Your library games are not affected.
            </p>
            <p className='mb-2 text-sm font-medium text-foreground'>
              Type <span className='font-mono text-destructive'>DELETE</span> to confirm
            </p>
            <input
              type='text'
              value={bggDeleteText}
              onChange={(e) => setBggDeleteText(e.target.value)}
              placeholder='DELETE'
              className='input mb-6'
              autoFocus
            />
            <div className='flex justify-end gap-3'>
              <button
                onClick={() => { setShowBggDeleteConfirm(false); setBggDeleteText('') }}
                disabled={bggDeleting}
                className='rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50'
              >
                Cancel
              </button>
              <button
                onClick={handleBggDelete}
                disabled={bggDeleting || bggDeleteText !== 'DELETE'}
                className='rounded-lg bg-destructive px-4 py-2 text-sm text-white hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-50'
              >
                {bggDeleting ? 'Deleting…' : 'Delete BGG data'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showResetConfirm && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
          <div className='w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl'>
            <h3 className='mb-2 text-lg font-semibold text-foreground'>Delete all data?</h3>
            <p className='mb-4 text-sm text-muted-foreground'>All games, sessions, players, and uploaded files will be permanently removed. This cannot be undone.</p>
            <p className='mb-2 text-sm font-medium text-foreground'>
              Type <span className='font-mono text-destructive'>DELETE</span> to confirm
            </p>
            <input
              type='text'
              value={resetConfirmText}
              onChange={(e) => setResetConfirmText(e.target.value)}
              placeholder='DELETE'
              className='input mb-6'
              autoFocus
            />
            <div className='flex justify-end gap-3'>
              <button
                onClick={() => { setShowResetConfirm(false); setResetConfirmText('') }}
                disabled={resetting}
                className='rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50'
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                disabled={resetting || resetConfirmText !== 'DELETE'}
                className='rounded-lg bg-destructive px-4 py-2 text-sm text-white hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-50'
              >
                {resetting ? 'Deleting…' : 'Delete everything'}
              </button>
            </div>
          </div>
        </div>
      )}
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
