import { ComponentProps } from 'react'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const DIALOG_CONTENT_VARIANTS_CONFIG = cva(
  'fixed top-1/2 left-1/2 z-50 flex -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl bg-paper-primary text-sm text-ink-primary shadow-md ring-1 ring-ink-primary/5 outline-none duration-100 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
  {
    variants: {
      size: {
        sm: 'w-[min(calc(100vw-2rem),24rem)]',
        default: 'w-[min(calc(100vw-2rem),32rem)]',
        lg: 'w-[min(calc(100vw-2rem),48rem)]',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
)

export type DIALOG_CONTENT_VARIANTS_PROPS = VariantProps<typeof DIALOG_CONTENT_VARIANTS_CONFIG>

export type DIALOG_CONTENT_SIZE = NonNullable<DIALOG_CONTENT_VARIANTS_PROPS['size']>
export const DIALOG_CONTENT_SIZES: DIALOG_CONTENT_SIZE[] = ['sm', 'default', 'lg']

export const Dialog = ({ ...props }: ComponentProps<typeof DialogPrimitive.Root>) => (
  <DialogPrimitive.Root data-slot='dialog' {...props} />
)

export const DialogTrigger = ({ ...props }: ComponentProps<typeof DialogPrimitive.Trigger>) => (
  <DialogPrimitive.Trigger data-slot='dialog-trigger' {...props} />
)

export const DialogPortal = ({ ...props }: ComponentProps<typeof DialogPrimitive.Portal>) => (
  <DialogPrimitive.Portal data-slot='dialog-portal' {...props} />
)

export const DialogClose = ({ ...props }: ComponentProps<typeof DialogPrimitive.Close>) => (
  <DialogPrimitive.Close data-slot='dialog-close' {...props} />
)

export const DialogOverlay = ({ className, ...props }: ComponentProps<typeof DialogPrimitive.Overlay>) => {
  const classes = cn(
    'fixed inset-0 z-50 bg-black/50 duration-100 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
    className,
  )
  return <DialogPrimitive.Overlay data-slot='dialog-overlay' className={classes} {...props} />
}

export type DialogContentProps = ComponentProps<typeof DialogPrimitive.Content> & DIALOG_CONTENT_VARIANTS_PROPS

export const DialogContent = ({ size, className, children, ...props }: DialogContentProps) => {
  const classes = cn(DIALOG_CONTENT_VARIANTS_CONFIG({ size }), className)
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content data-slot='dialog-content' data-size={size} className={classes} {...props}>
        {children}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

export const DialogHeader = ({ className, ...props }: ComponentProps<'div'>) => {
  const classes = cn('flex flex-col gap-1.5 px-6 pt-6', className)
  return <div data-slot='dialog-header' className={classes} {...props} />
}

export const DialogTitle = ({ className, ...props }: ComponentProps<typeof DialogPrimitive.Title>) => {
  const classes = cn('text-base font-semibold text-ink-primary', className)
  return <DialogPrimitive.Title data-slot='dialog-title' className={classes} {...props} />
}

export const DialogDescription = ({ className, ...props }: ComponentProps<typeof DialogPrimitive.Description>) => {
  const classes = cn('text-sm text-ink-muted', className)
  return <DialogPrimitive.Description data-slot='dialog-description' className={classes} {...props} />
}

export const DialogBody = ({ className, ...props }: ComponentProps<'div'>) => {
  const classes = cn('px-6 py-4', className)
  return <div data-slot='dialog-body' className={classes} {...props} />
}

export const DialogFooter = ({ className, ...props }: ComponentProps<'div'>) => {
  const classes = cn('flex items-center justify-end gap-3 px-6 pb-6', className)
  return <div data-slot='dialog-footer' className={classes} {...props} />
}
