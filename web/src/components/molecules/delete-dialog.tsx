import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter } from '@/components/atoms/dialog'
import { Button } from '@/components/atoms/button'
import { Field, FieldLabel } from '@/components/atoms/field'
import { Input } from '@/components/atoms/input'

export type DeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  cta?: string
  important?: boolean
  onConfirm: () => unknown
}

export const DeleteDialog = ({ open, onOpenChange, title, description, cta = 'Delete', important = false, onConfirm }: DeleteDialogProps) => {
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) return

    setConfirmText('')
    setLoading(false)
  }, [open])

  const handleConfirm = async () => {
    setLoading(true)

    try {
      await onConfirm()
      onOpenChange(false)
    } catch {
      setLoading(false)
    }
  }

  const confirmDisabled = loading || (important && confirmText !== 'DELETE')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size='sm'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {important && (
          <DialogBody>
            <Field>
              <FieldLabel htmlFor='delete-dialog-confirm'>
                Type <span className='font-mono text-destructive'>DELETE</span> to confirm
              </FieldLabel>
              <Input id='delete-dialog-confirm' type='text' value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder='DELETE' autoFocus />
            </Field>
          </DialogBody>
        )}
        <DialogFooter>
          <Button variant='outline' color='secondary' onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button color='destructive' onClick={handleConfirm} disabled={confirmDisabled}>
            {loading ? 'Deleting…' : cta}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
