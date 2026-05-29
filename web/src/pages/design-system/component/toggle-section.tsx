import { Toggle } from '@/components/1-atoms/toggle'
import { Star } from 'lucide-react'

export const ToggleSection = () => (
  <section className='space-y-6'>
    <div>
      <h2 className='text-2xl font-bold'>Toggle</h2>
      <p className='mt-1 text-sm text-ink-secondary'>Button with pressed state. Off = secondary, on = primary. Supports variant and size props.</p>
    </div>

    <div className='space-y-4 rounded-xl border border-border bg-card p-5'>
      <p className='caption text-ink-muted'>States</p>
      <div className='flex flex-wrap items-center gap-2'>
        <Toggle>Off</Toggle>
        <Toggle defaultPressed>On</Toggle>
        <Toggle disabled>Disabled</Toggle>
        <Toggle variant='outline'>Off</Toggle>
        <Toggle variant='outline' defaultPressed>
          On
        </Toggle>
        <Toggle variant='outline' disabled>
          Disabled
        </Toggle>
        <Toggle variant='ghost'>
          <Star />
        </Toggle>
        <Toggle variant='ghost' defaultPressed>
          <Star />
        </Toggle>
        <Toggle variant='ghost' disabled>
          <Star />
        </Toggle>
      </div>
    </div>

    <div className='space-y-4 rounded-xl border border-border bg-card p-5'>
      <p className='caption text-ink-muted'>Sizes</p>
      <div className='flex flex-wrap items-end gap-4'>
        {(['small', 'default', 'big'] as const).map((size) => (
          <div key={size} className='flex flex-col items-center gap-1.5'>
            <Toggle size={size}>Label</Toggle>
            <span className='caption text-[10px] text-ink-muted'>{size}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Variant matrix */}
    <div className='overflow-auto rounded-xl border border-border bg-card'>
      <table className='w-full'>
        <thead>
          <tr className='border-b border-border'>
            <th className='px-4 py-3 text-left caption text-ink-muted'>variant</th>
            <th className='px-4 py-3 text-center caption text-ink-muted'>off</th>
            <th className='px-4 py-3 text-center caption text-ink-muted'>on</th>
            <th className='px-4 py-3 text-center caption text-ink-muted'>disabled</th>
          </tr>
        </thead>
        <tbody className='divide-y divide-dashed divide-border'>
          {(['default', 'outline', 'ghost'] as const).map((variant) => (
            <tr key={variant} className='hover:bg-paper-secondary/40'>
              <td className='px-4 py-2.5'>
                <code className='font-mono text-xs text-ink-muted'>{variant}</code>
              </td>
              <td className='px-4 py-2.5 text-center'>
                <Toggle variant={variant} size='small'>
                  {variant}
                </Toggle>
              </td>
              <td className='px-4 py-2.5 text-center'>
                <Toggle variant={variant} size='small' defaultPressed>
                  {variant}
                </Toggle>
              </td>
              <td className='px-4 py-2.5 text-center'>
                <Toggle variant={variant} size='small' disabled>
                  {variant}
                </Toggle>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
)
