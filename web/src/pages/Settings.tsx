import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { api, Player } from '@/lib/http-transport/api'
import { ThemeSetting } from '@/hooks/useTheme'
import { useSettings } from '@/contexts/settings-context'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter } from '@/components/atoms/dialog'
import { Button } from '@/components/atoms/button'
import { Field, FieldLabel, FieldDescription } from '@/components/atoms/field'
import { Input } from '@/components/atoms/input'

// 1. DELETE_ALL_DATA doesn't show the loading gate during refetch

// After reset, fetchSettings is called internally but isLoading stays false — the context re-renders the children immediately while the fetch is in-flight. Since settings in state still holds the old value momentarily before setSettings updates it, this is a brief inconsistency. If fetchSettings throws during reset, error gets set but the app has already navigated to /onboarding.

// Two options:

// A — Set isLoading to true before calling fetchSettings in DELETE_ALL_DATA
// The loading gate kicks in during the refetch, children are unmounted, and when settings come back the app re-renders cleanly. Simple one-liner addition.

// const DELETE_ALL_DATA = async () => {
//   await api.settings.reset()
//   setIsLoading(true)
//   await fetchSettings()
// }
// Pros: reuses the existing gate, no new state. Cons: the loading spinner briefly flashes before navigation — may look like a glitch since the page is about to navigate to /onboarding anyway.

// B — Don't refetch in the context at all, let the caller navigate and let the app re-initialize naturally
// Since DELETE_ALL_DATA always ends with navigate('/onboarding', { replace: true }), the entire app re-mounts under the provider, which triggers the useEffect and fetches fresh settings from scratch. The context doesn't need to refetch — the navigation does it for free.

// // context — just do the API call
// const DELETE_ALL_DATA = async () => {
//   await api.settings.reset()
// }
// Pros: no timing issue, no flash, the natural app lifecycle handles re-initialization. Cons: assumes reset always leads to a full re-mount, which is true today but could break if reset is ever called from somewhere that doesn't navigate away.

// Recommendation: B. Reset is a destructive, navigate-away action by nature — the provider re-initializes on its own. Refetching inside the context after reset is doing work the navigation already does, which is what created the inconsistency in the first place. Which would you like?

export default () => {
  const navigate = useNavigate()

  const { settings, updateSetting, DELETE_ALL_DATA } = useSettings()

  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [resetConfirmText, setResetConfirmText] = useState('')
  const [resetting, setResetting] = useState(false)
  const [bggFile, setBggFile] = useState<File | null>(null)
  const [bggImporting, setBggImporting] = useState(false)
  const [showBggDeleteConfirm, setShowBggDeleteConfirm] = useState(false)
  const [bggDeleteText, setBggDeleteText] = useState('')
  const [bggDeleting, setBggDeleting] = useState(false)

  useEffect(() => {
    api.players
      .list()
      .then((playerList) => {
        setPlayers(playerList)
        setLoading(false)
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : 'Failed to load data'))
      .finally(() => setLoading(false))
  }, [])

  const set = async (patch: Parameters<typeof updateSetting>[0]) => {
    try {
      await updateSetting(patch)
      toast.success('Settings saved')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load data')
    }
  }

  const handleBggImport = async () => {
    if (!bggFile) return
    setBggImporting(true)
    try {
      const result = await api.bgg.import(bggFile)
      setBggFile(null)
      toast.success(`BGG data updated — ${result.imported} games imported`)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setBggImporting(false)
    }
  }

  const handleBggDelete = async () => {
    setBggDeleting(true)
    try {
      await api.bgg.delete()
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
      await DELETE_ALL_DATA()
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

  return (
    !loading && (
      <div className='max-w-lg p-4 md:p-8'>
        <h1 className='mb-8 text-2xl font-bold text-foreground'>Settings</h1>

        <div className='space-y-6'>
          <Field>
            <FieldLabel htmlFor='default_owner_id'>Default Owner</FieldLabel>
            <select
              id='default_owner_id'
              value={settings.default_owner_id != null ? String(settings.default_owner_id) : ''}
              onChange={(e) => set({ default_owner_id: Number(e.target.value) })}
              className='input'
            >
              {players.map((p) => (
                <option key={p.id} value={String(p.id)}>
                  {p.name}
                </option>
              ))}
            </select>
            <FieldDescription>Automatically set as the owner when adding new games.</FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor='currency'>Currency</FieldLabel>
            <select id='currency' value={settings.currency} onChange={(e) => set({ currency: e.target.value as 'USD' | 'BRL' })} className='input'>
              <option value='USD'>USD — US Dollar</option>
              <option value='BRL'>BRL — Brazilian Real</option>
            </select>
          </Field>

          <Field>
            <FieldLabel htmlFor='language'>Language</FieldLabel>
            <select id='language' value={settings.language} onChange={(e) => set({ language: e.target.value as 'en' | 'pt' })} className='input'>
              <option value='en'>English</option>
              <option value='pt'>Português</option>
            </select>
          </Field>

          <Field>
            <FieldLabel htmlFor='theme'>Theme</FieldLabel>
            <select id='theme' value={settings.theme} onChange={(e) => set({ theme: e.target.value as ThemeSetting })} className='input'>
              <option value='system'>System</option>
              <option value='light'>Light</option>
              <option value='dark'>Dark</option>
            </select>
          </Field>
        </div>

        {/* BGG Data section */}
        <div className='mt-12 border-t border-border pt-8'>
          <div className='mb-4 flex items-center gap-3'>
            <h2 className='text-sm font-semibold text-foreground'>BGG Games Dataset</h2>
            <a href='https://boardgamegeek.com' target='_blank' rel='noopener noreferrer'>
              <img src='/bgg-logo.png' alt='BoardGameGeek' className='h-6' />
            </a>
          </div>

          <p className='mb-1 text-xs text-muted-foreground'>
            Game data provided by{' '}
            <a href='https://boardgamegeek.com' target='_blank' rel='noopener noreferrer' className='underline hover:text-foreground'>
              BoardGameGeek
            </a>
            .{' '}
            <a href='https://boardgamegeek.com/data_dumps/bg_ranks' target='_blank' rel='noopener noreferrer' className='underline hover:text-foreground'>
              Download the data dump
            </a>{' '}
            and import it here.
          </p>

          <p className='mb-4 text-xs text-muted-foreground'>
            {settings.bgg_last_updated
              ? `Last updated: ${new Date(settings.bgg_last_updated).toLocaleString(settings.language === 'pt' ? 'pt-BR' : 'en-US')}`
              : 'No BGG data loaded.'}
          </p>

          <div className='flex items-center gap-2'>
            <Input type='file' accept='.csv' onChange={(e) => setBggFile(e.target.files?.[0] ?? null)} />
            <button
              onClick={handleBggImport}
              disabled={!bggFile || bggImporting}
              className='rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50'
            >
              {bggImporting ? 'Importing…' : 'Import'}
            </button>
          </div>

          {settings.bgg_last_updated && (
            <div className='mt-4'>
              <button
                onClick={() => {
                  setShowBggDeleteConfirm(true)
                  setBggDeleteText('')
                }}
                className='rounded-lg border border-destructive/40 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10'
              >
                Delete BGG data
              </button>
            </div>
          )}
        </div>

        <div className='mt-12 border-t border-border pt-8'>
          <h2 className='mb-1 text-sm font-semibold text-destructive'>Danger Zone</h2>
          <p className='mb-4 text-xs text-muted-foreground'>Permanently deletes all games, sessions, players, and uploaded files. This cannot be undone.</p>
          <button
            onClick={() => {
              setShowResetConfirm(true)
              setResetConfirmText('')
            }}
            className='rounded-lg border border-destructive/40 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10'
          >
            Delete all data
          </button>
        </div>

        <Dialog
          open={showBggDeleteConfirm}
          onOpenChange={(open) => {
            if (!open) {
              setShowBggDeleteConfirm(false)
              setBggDeleteText('')
            }
          }}
        >
          <DialogContent size='sm'>
            <DialogHeader>
              <DialogTitle>Delete BGG data?</DialogTitle>
              <DialogDescription>All BoardGameGeek catalog data will be removed. Your library games are not affected.</DialogDescription>
            </DialogHeader>
            <DialogBody>
              <Field>
                <FieldLabel htmlFor='bgg-delete-confirm'>
                  Type <span className='font-mono text-destructive'>DELETE</span> to confirm
                </FieldLabel>
                <Input id='bgg-delete-confirm' type='text' value={bggDeleteText} onChange={(e) => setBggDeleteText(e.target.value)} placeholder='DELETE' autoFocus />
              </Field>
            </DialogBody>
            <DialogFooter>
              <Button
                variant='outline'
                color='secondary'
                onClick={() => {
                  setShowBggDeleteConfirm(false)
                  setBggDeleteText('')
                }}
                disabled={bggDeleting}
              >
                Cancel
              </Button>
              <Button color='destructive' onClick={handleBggDelete} disabled={bggDeleting || bggDeleteText !== 'DELETE'}>
                {bggDeleting ? 'Deleting…' : 'Delete BGG data'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={showResetConfirm}
          onOpenChange={(open) => {
            if (!open) {
              setShowResetConfirm(false)
              setResetConfirmText('')
            }
          }}
        >
          <DialogContent size='sm'>
            <DialogHeader>
              <DialogTitle>Delete all data?</DialogTitle>
              <DialogDescription>All games, sessions, players, and uploaded files will be permanently removed. This cannot be undone.</DialogDescription>
            </DialogHeader>
            <DialogBody>
              <Field>
                <FieldLabel htmlFor='reset-confirm'>
                  Type <span className='font-mono text-destructive'>DELETE</span> to confirm
                </FieldLabel>
                <Input id='reset-confirm' type='text' value={resetConfirmText} onChange={(e) => setResetConfirmText(e.target.value)} placeholder='DELETE' autoFocus />
              </Field>
            </DialogBody>
            <DialogFooter>
              <Button
                variant='outline'
                color='secondary'
                onClick={() => {
                  setShowResetConfirm(false)
                  setResetConfirmText('')
                }}
                disabled={resetting}
              >
                Cancel
              </Button>
              <Button color='destructive' onClick={handleReset} disabled={resetting || resetConfirmText !== 'DELETE'}>
                {resetting ? 'Deleting…' : 'Delete everything'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    )
  )
}
