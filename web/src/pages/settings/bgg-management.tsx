import { useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/lib/http-transport/api'
import { useSettings } from '@/contexts/settings-context'
import { Button } from '@/components/atoms/button'
import { Input } from '@/components/atoms/input'
import { DeleteDialog } from '@/components/molecules/delete-dialog'

export const BggManagement = () => {
  const { settings } = useSettings()

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

  return (
    <>
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
          <Button onClick={handleBggImport} disabled={!bggFile || bggImporting}>
            {bggImporting ? 'Importing…' : 'Import'}
          </Button>
        </div>

        {settings.bgg_last_updated && (
          <div className='mt-4'>
            <Button variant='outline' color='destructive' onClick={() => setShowBggDeleteConfirm(true)}>
              Delete BGG data
            </Button>
          </div>
        )}
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
    </>
  )
}
