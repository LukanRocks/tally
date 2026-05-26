import { Fragment } from 'react'
import { Plus } from 'lucide-react'
import { Button, buttonColorGroups } from '@/components/atoms/button'

export function ButtonsSection() {
  return (
    <section className='space-y-6'>
      <div>
        <p className='caption text-ink-muted'>02 — Components</p>
        <h2 className='mt-1 text-2xl font-bold'>Buttons</h2>
        <p className='mt-1 text-sm text-ink-secondary'>
          One primary per surface. Yellow is loud; reserve it for the single most important action. Four variants × three colors × four sizes.
        </p>
      </div>

      {/* Sizes & states */}
      <div className='space-y-4 rounded-xl border border-border bg-card p-5'>
        <p className='caption text-ink-muted'>Sizes</p>
        <div className='flex flex-wrap items-end gap-4'>
          {(
            [
              { size: 'small', label: '+ Log' },
              { size: 'default', label: '+ Log session' },
              { size: 'big', label: '+ Log session tonight' },
            ] as const
          ).map(({ size, label }) => (
            <div key={size} className='flex flex-col items-center gap-1.5'>
              <Button size={size}>{label}</Button>
              <span className='caption text-[10px] text-ink-muted'>{size}</span>
            </div>
          ))}
          <div className='flex flex-col items-center gap-1.5'>
            <Button size='icon' aria-label='Add session'>
              <Plus />
            </Button>
            <span className='caption text-[10px] text-ink-muted'>icon</span>
          </div>
        </div>

        <p className='caption text-ink-muted'>States</p>
        <div className='flex flex-wrap items-center gap-2'>
          <Button>Active</Button>
          <Button disabled>Disabled</Button>
          <Button variant='outline' color='secondary'>
            Active
          </Button>
          <Button variant='outline' color='secondary' disabled>
            Disabled
          </Button>
          <Button variant='ghost' color='secondary'>
            Active
          </Button>
          <Button variant='ghost' color='secondary' disabled>
            Disabled
          </Button>
          <Button variant='link'>Active</Button>
          <Button variant='link' disabled>
            Disabled
          </Button>
        </div>
      </div>

      {/* Color × variant matrix */}
      <div className='overflow-auto rounded-xl border border-border bg-card'>
        <table className='w-full'>
          <thead>
            <tr className='border-b border-border'>
              <th className='caption px-4 py-3 text-left text-ink-muted'>color</th>
              <th className='caption px-4 py-3 text-center text-ink-muted'>default</th>
              <th className='caption px-4 py-3 text-center text-ink-muted'>outline</th>
              <th className='caption px-4 py-3 text-center text-ink-muted'>ghost</th>
              <th className='caption px-4 py-3 text-center text-ink-muted'>link</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-dashed divide-border'>
            {buttonColorGroups.map(({ label, colors }) => (
              <Fragment key={label}>
                <tr className='bg-paper-secondary/40'>
                  <td colSpan={5} className='px-4 py-1.5'>
                    <span className='caption text-[10px] text-ink-muted'>{label}</span>
                  </td>
                </tr>
                {colors.map((color) => (
                  <tr key={color} className='hover:bg-paper-secondary/40'>
                    <td className='px-4 py-2.5'>
                      <code className='font-mono text-xs text-ink-muted'>{color}</code>
                    </td>
                    <td className='px-4 py-2.5 text-center'>
                      <Button color={color} size='small'>
                        {color}
                      </Button>
                    </td>
                    <td className='px-4 py-2.5 text-center'>
                      <Button variant='outline' color={color} size='small'>
                        {color}
                      </Button>
                    </td>
                    <td className='px-4 py-2.5 text-center'>
                      <Button variant='ghost' color={color} size='small'>
                        {color}
                      </Button>
                    </td>
                    <td className='px-4 py-2.5 text-center'>
                      <Button variant='link' color={color} size='small'>
                        {color}
                      </Button>
                    </td>
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
