import { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export type TextareaProps = ComponentProps<'textarea'>

export const Textarea = ({ className, ...props }: TextareaProps) => {
  const classes = cn(
    'field-sizing-content min-h-16 w-full resize-none rounded-2xl border border-transparent bg-paper-muted/50 px-3 py-3 text-base transition-[color,box-shadow,background-color] outline-none placeholder:text-ink-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 md:text-sm',
    className,
  )

  return <textarea data-slot='textarea' className={classes} {...props} />
}
