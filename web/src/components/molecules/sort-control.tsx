import { ComponentProps } from 'react'
import { ArrowDownAZ, ArrowUpZA } from 'lucide-react'

import { Button, ButtonGroup } from '@/components/1-atoms/button'
import { cn } from '@/lib/utils'

export type SORT_CONTROL_ORDER = 'asc' | 'desc'

export type SortOption = { value: string; label: string }

export type SortControlProps = Omit<ComponentProps<'div'>, 'onChange'> & {
  sort: string
  order: SORT_CONTROL_ORDER
  options: SortOption[]
  onSortChange: (sort: string) => void
  onOrderChange: (order: SORT_CONTROL_ORDER) => void
}

export const SortControl = ({ sort, order, options, onSortChange, onOrderChange, className, ...props }: SortControlProps) => {
  const classes = cn(className)

  return (
    <ButtonGroup data-slot='sort-control' className={classes} {...props}>
      <select value={sort} onChange={(e) => onSortChange(e.target.value)} className='input w-36 cursor-pointer'>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <Button variant='outline' color='secondary' size='icon' onClick={() => onOrderChange(order === 'asc' ? 'desc' : 'asc')}>
        {order === 'asc' ? <ArrowDownAZ /> : <ArrowUpZA />}
      </Button>
    </ButtonGroup>
  )
}
