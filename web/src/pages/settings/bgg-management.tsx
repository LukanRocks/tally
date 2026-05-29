import { useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/lib/http-transport/api'
import { useSettings } from '@/contexts/settings-context'
import { Card, CardContent, CardCaption, CardTitle, CardHeader, CardDescription, CardAction } from '@/components/1-atoms/card'
import { Button } from '@/components/1-atoms/button'
import { InputGroup, InputGroupInput, InputGroupAddon, InputGroupButton } from '@/components/1-atoms/input'
import { Field, FieldDescription } from '@/components/1-atoms/field'
import { DeleteDialog } from '@/components/2-molecules/delete-dialog'

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
    api.bgg
      .delete()
      .then(() => toast.success('BGG data deleted.'))
      .catch((error) => toast.error(error instanceof Error ? error.message : 'Failed to delete BGG data.'))

  return (
    <Card>
      <CardHeader>
        <CardCaption>Enrich games dataset</CardCaption>
        <CardTitle>BGG Integration</CardTitle>
        <CardAction>
          <a href='https://boardgamegeek.com' target='_blank' rel='noopener noreferrer'>
            <img src='/bgg-logo.png' alt='BoardGameGeek' className='h-14' />
          </a>
        </CardAction>
      </CardHeader>

      <CardContent className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
        <Card size='sm' color='secondary'>
          <CardContent className='flex flex-col gap-4'>
            <div className='flex flex-col gap-1'>
              <CardTitle>Import dataset dump</CardTitle>
              <CardDescription className='[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-ink-primary'>
                <a href='https://boardgamegeek.com' target='_blank' rel='noopener noreferrer'>
                  BoardGameGeek{' '}
                </a>
                provides that{' '}
                <a href='https://boardgamegeek.com/data_dumps/bg_ranks' target='_blank' rel='noopener noreferrer'>
                  dataset dump that can be downloaded
                </a>{' '}
                and imported here.
              </CardDescription>
            </div>

            <Field orientation='vertical'>
              <InputGroup>
                <InputGroupInput type='file' accept='.csv' className='cursor-pointer file:hidden' onChange={(e) => setBggFile(e.target.files?.[0] ?? null)} />
                <InputGroupAddon align='inline-end'>
                  <InputGroupButton color='primary' onClick={handleBggImport} disabled={!bggFile || bggImporting}>
                    {bggImporting ? 'Importing…' : 'Import'}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              {settings.bgg_last_updated && (
                <FieldDescription>Last updated: {new Date(settings.bgg_last_updated).toLocaleString(settings.language === 'pt' ? 'pt-BR' : 'en-US')}</FieldDescription>
              )}
            </Field>

            {settings.bgg_last_updated && (
              <Button variant='outline' color='destructive' size='small' onClick={() => setShowBggDeleteConfirm(true)}>
                Delete data dump
              </Button>
            )}
            <DeleteDialog
              open={showBggDeleteConfirm}
              onOpenChange={setShowBggDeleteConfirm}
              title='Delete BGG data?'
              description='All BoardGameGeek catalog data will be removed. Your library games are not affected.'
              cta='Delete BGG data'
              important
              onConfirm={handleBggDelete}
            />
          </CardContent>
        </Card>

        <Card size='sm' color='secondary'>
          <CardContent className='flex flex-col gap-4'>
            <div className='flex flex-col gap-1'>
              <CardTitle>API integration</CardTitle>
              <CardDescription>Coming soon</CardDescription>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
