import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileDown, FileUp, Radiation } from 'lucide-react'
import { toast } from 'sonner'
import { useSettings } from '@/contexts/settings-context'
import { Button } from '@/components/atoms/button'
import { Card, CardContent, CardCaption, CardTitle, CardHeader, CardDescription } from '@/components/atoms/card'
import { DeleteDialog } from '@/components/molecules/delete-dialog'

export const DataManagement = () => {
  const { DELETE_ALL_DATA } = useSettings()
  const navigate = useNavigate()

  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const handleReset = () =>
    DELETE_ALL_DATA()
      .then(() => {
        toast.success('All data deleted.')
        navigate('/onboarding', { replace: true })
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : 'Failed to delete workspace data.'))

  return (
    <Card>
      <CardHeader>
        <CardCaption>Export · Import · Danger</CardCaption>
        <CardTitle>Data Management</CardTitle>
      </CardHeader>

      <CardContent className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
        <Card size='sm' color='secondary'>
          <CardContent className='flex flex-col gap-4'>
            <FileDown className='size-6 text-ink-muted' />
            <div className='flex flex-col gap-1'>
              <CardTitle>Export everything</CardTitle>
              <CardDescription>Download a backup of players, games, and every session.</CardDescription>
            </div>
            <Button disabled variant='outline' color='secondary' size='small'>
              Coming soon
            </Button>
          </CardContent>
        </Card>

        <Card size='sm' color='secondary'>
          <CardContent className='flex flex-col gap-4'>
            <FileUp className='size-6 text-ink-muted' />
            <div className='flex flex-col gap-1'>
              <CardTitle>Import anything</CardTitle>
              <CardDescription>Bring play history over from a spreadsheet or another tracker.</CardDescription>
            </div>
            <Button disabled variant='outline' color='secondary' size='small'>
              Coming soon
            </Button>
          </CardContent>
        </Card>

        <Card size='sm' color='secondary' className='bg-destructive/5 ring-destructive/15'>
          <CardContent className='flex flex-col gap-4'>
            <Radiation className='size-6 text-destructive' />
            <div className='flex flex-col gap-1'>
              <CardTitle>Delete workspace</CardTitle>
              <CardDescription>Permanently remove your profile and every session you've ever logged.</CardDescription>
            </div>

            <Button variant='outline' color='destructive' size='small' onClick={() => setShowResetConfirm(true)}>
              Delete workspace...
            </Button>

            <DeleteDialog
              open={showResetConfirm}
              onOpenChange={setShowResetConfirm}
              title='Delete all data?'
              description='All games, sessions, players, and uploaded files will be permanently removed. This cannot be undone.'
              cta='Delete everything'
              important
              onConfirm={handleReset}
            />
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
