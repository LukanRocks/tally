import { ComponentProps } from 'react'
import { Switch as SwitchPrimitive } from 'radix-ui'
import { cn } from '@/lib/utils'

export type SWITCH_SIZE = 'sm' | 'default'
export const SWITCH_SIZES: SWITCH_SIZE[] = ['sm', 'default']

export type SwitchProps = ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: SWITCH_SIZE
  label?: string
}

export const Switch = ({ label, disabled, size = 'default', className, ...props }: SwitchProps) => {
  const wrapperClasses = cn('inline-flex items-center gap-2 select-none', disabled ? 'cursor-not-allowed' : 'cursor-pointer')
  const classes = cn(
    'peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-transparent transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[size=default]:h-[18.4px] data-[size=default]:w-8 data-[size=sm]:h-3.5 data-[size=sm]:w-6 data-checked:bg-yellow-primary data-unchecked:bg-paper-muted data-disabled:cursor-not-allowed data-disabled:opacity-50',
    className,
  )
  const labelClasses = cn('text-sm text-ink-primary', disabled && 'opacity-50')

  return (
    <label className={wrapperClasses}>
      <SwitchPrimitive.Root data-slot='switch' data-size={size} disabled={disabled} className={classes} {...props}>
        <SwitchPrimitive.Thumb
          data-slot='switch-thumb'
          className='pointer-events-none block rounded-full bg-paper-primary ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 group-data-[size=default]/switch:data-checked:translate-x-[calc(100%-2px)] group-data-[size=sm]/switch:data-checked:translate-x-[calc(100%-2px)] group-data-[size=default]/switch:data-unchecked:translate-x-0 group-data-[size=sm]/switch:data-unchecked:translate-x-0 dark:data-unchecked:bg-ink-primary'
        />
      </SwitchPrimitive.Root>
      {label && <span className={labelClasses}>{label}</span>}
    </label>
  )
}
