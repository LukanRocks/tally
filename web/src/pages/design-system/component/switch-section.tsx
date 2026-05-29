import { Switch } from '@/components/1-atoms/switch'

export const SwitchSection = () => (
  <section className='space-y-6'>
    <div>
      <h2 className='text-2xl font-bold'>Switch</h2>
      <p className='mt-1 text-sm text-ink-secondary'>Paper-muted track, yellow when on, paper-primary thumb.</p>
    </div>

    <div className='space-y-4 rounded-xl border border-border bg-card p-5'>
      <p className='caption text-ink-muted'>States</p>
      <div className='flex flex-wrap gap-6'>
        <Switch label='Off' />
        <Switch label='On' defaultChecked />
        <Switch label='Disabled' disabled />
        <Switch label='Disabled on' disabled defaultChecked />
      </div>
    </div>

    <div className='space-y-4 rounded-xl border border-border bg-card p-5'>
      <p className='caption text-ink-muted'>Sizes</p>
      <div className='flex flex-wrap items-center gap-6'>
        <Switch label='Default' />
        <Switch label='Small' size='sm' />
      </div>
    </div>
  </section>
)
