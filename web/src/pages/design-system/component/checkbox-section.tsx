import { Checkbox } from '@/components/1-atoms/checkbox'

export function CheckboxSection() {
  return (
    <section className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold'>Checkbox</h2>
        <p className='mt-1 text-sm text-ink-secondary'>Paper-secondary fill with border, yellow when checked, yellow focus ring.</p>
      </div>

      <div className='space-y-4 rounded-xl border border-paper-muted bg-paper-primary p-5'>
        <p className='caption text-ink-muted'>States</p>
        <div className='flex flex-wrap gap-6'>
          <Checkbox label='Unchecked' />
          <Checkbox label='Checked' defaultChecked />
          <Checkbox label='Disabled' disabled />
          <Checkbox label='Disabled checked' disabled defaultChecked />
        </div>
      </div>
    </section>
  )
}
