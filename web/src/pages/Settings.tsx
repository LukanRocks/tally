import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { api, Player } from '@/lib/http-transport/api'
import { ThemeSetting } from '@/hooks/useTheme'
import { useSettings } from '@/contexts/settings-context'
import { Field, FieldLabel, FieldDescription } from '@/components/atoms/field'
import { Input } from '@/components/atoms/input'
import { DeleteDialog } from '@/components/molecules/delete-dialog'

export default () => {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.players
      .list()
      .then((playerList) => setPlayers(playerList))
      .catch((error) => toast.error(error instanceof Error ? error.message : 'Failed to load data'))
      .finally(() => setLoading(false))
  }, [])

  const { settings, updateSetting, DELETE_ALL_DATA } = useSettings()

  const set = (patch: Parameters<typeof updateSetting>[0]) =>
    updateSetting(patch)
      .then(() => toast.success('Settings saved'))
      .catch((error) => toast.error(error instanceof Error ? error.message : 'Failed to load data'))

  const [bggFile, setBggFile] = useState<File | null>(null)
  const [bggImporting, setBggImporting] = useState(false)
  const [showBggDeleteConfirm, setShowBggDeleteConfirm] = useState(false)

  const handleBggImport = () => {
    if (!bggFile) return

    setBggImporting(true)

    api.bgg
      .import(bggFile)
      .then((result) => toast.success(`BGG data updated — ${result.imported} games imported.`))
      .catch((error) => toast.error(error instanceof Error ? error.message : 'Failed to import BGG data'))
      .finally(() => {
        setBggImporting(false)
        setBggFile(null)
      })
  }

  const handleBggDelete = () =>
    api.bgg.delete()
      .then(() => toast.success('BGG data deleted.'))
      .catch((error) => toast.error(error instanceof Error ? error.message : 'Failed to delete BGG data.'))

  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const navigate = useNavigate()

  const handleReset = () =>
    DELETE_ALL_DATA()
      .then(() => {
        toast.success('All data deleted.')
        navigate('/onboarding', { replace: true })
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : 'Failed to delete workspace data.'))

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
                onClick={() => setShowBggDeleteConfirm(true)}
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
            onClick={() => setShowResetConfirm(true)}
            className='rounded-lg border border-destructive/40 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10'
          >
            Delete all data
          </button>
        </div>

        <DeleteDialog
          open={showBggDeleteConfirm}
          onOpenChange={setShowBggDeleteConfirm}
          title='Delete BGG data?'
          description='All BoardGameGeek catalog data will be removed. Your library games are not affected.'
          cta='Delete BGG data'
          important
          onConfirm={handleBggDelete}
        />

        <DeleteDialog
          open={showResetConfirm}
          onOpenChange={setShowResetConfirm}
          title='Delete all data?'
          description='All games, sessions, players, and uploaded files will be permanently removed. This cannot be undone.'
          cta='Delete everything'
          important
          onConfirm={handleReset}
        />
      </div>
    )
  )
}
