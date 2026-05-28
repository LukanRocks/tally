import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useSettings } from '@/contexts/settings-context'
import { Button } from '@/components/atoms/button'
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
    <>
      <div className='mt-12 border-t border-border pt-8'>
        <h2 className='mb-1 text-sm font-semibold text-destructive'>Danger Zone</h2>
        <p className='mb-4 text-xs text-muted-foreground'>Permanently deletes all games, sessions, players, and uploaded files. This cannot be undone.</p>
        <Button variant='outline' color='destructive' onClick={() => setShowResetConfirm(true)}>
          Delete all data
        </Button>
      </div>

      <DeleteDialog
        open={showResetConfirm}
        onOpenChange={setShowResetConfirm}
        title='Delete all data?'
        description='All games, sessions, players, and uploaded files will be permanently removed. This cannot be undone.'
        cta='Delete everything'
        important
        onConfirm={handleReset}
      />
    </>
  )
}
