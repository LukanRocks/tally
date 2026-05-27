import { ComponentProps } from 'react'
import { Checkbox as CheckboxPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'
import { CheckIcon } from 'lucide-react'

export type CheckboxProps = ComponentProps<typeof CheckboxPrimitive.Root> & { label?: string }

export const Checkbox = ({ label, disabled, className, ...props }: CheckboxProps) => {
  const classes = cn(
    'peer relative flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-[5px] border border-border bg-paper-secondary transition-all outline-none group-has-disabled/field:opacity-50 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-checked:border-yellow-tertiary data-checked:bg-yellow-primary data-checked:text-ink-on-yellow aria-invalid:data-checked:border-destructive',
    className,
  )

  return (
    <label className={cn('inline-flex items-center gap-2 select-none', disabled ? 'cursor-not-allowed' : 'cursor-pointer')}>
      <CheckboxPrimitive.Root data-slot='checkbox' disabled={disabled} className={classes} {...props}>
        <CheckboxPrimitive.Indicator data-slot='checkbox-indicator' className='grid place-content-center text-current transition-none [&>svg]:size-3.5'>
          <CheckIcon />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {label && <span className={cn('text-sm text-ink-primary', disabled && 'opacity-50')}>{label}</span>}
    </label>
  )
}
