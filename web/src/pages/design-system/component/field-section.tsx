import { Label } from '@/components/atoms/label'
import { Separator } from '@/components/atoms/separator'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSeparator } from '@/components/atoms/field'
import { Input } from '@/components/atoms/input'
import { Checkbox } from '@/components/atoms/checkbox'

export function FieldSection() {
  return (
    <section className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold'>Label, Separator & Field</h2>
        <p className='mt-1 text-sm text-ink-secondary'>Semantic primitives for labelling inputs and laying out form fields.</p>
      </div>

      <div className='space-y-3'>
        <p className='caption text-ink-muted'>Label</p>
        <div className='flex flex-wrap items-center gap-6 rounded-xl border border-border bg-card p-5'>
          <Label>Default label</Label>
          <Label className='pointer-events-none opacity-50'>Disabled</Label>
        </div>
      </div>

      <div className='space-y-3'>
        <p className='caption text-ink-muted'>Separator</p>
        <div className='space-y-5 rounded-xl border border-border bg-card p-5'>
          <Separator />
          <div className='flex h-6 items-center gap-3'>
            <span className='text-sm text-ink-muted'>Section A</span>
            <Separator orientation='vertical' />
            <span className='text-sm text-ink-muted'>Section B</span>
            <Separator orientation='vertical' />
            <span className='text-sm text-ink-muted'>Section C</span>
          </div>
          <FieldSeparator>or</FieldSeparator>
        </div>
      </div>

      <div className='space-y-3'>
        <p className='caption text-ink-muted'>Field — vertical (default)</p>
        <div className='rounded-xl border border-border bg-card p-5'>
          <FieldGroup>
            <Field>
              <FieldLabel>Game name</FieldLabel>
              <Input type='text' placeholder='Carcassonne' />
              <FieldDescription>The full name as listed on BoardGameGeek.</FieldDescription>
            </Field>
            <Field data-invalid='true'>
              <FieldLabel>Player count</FieldLabel>
              <Input type='number' defaultValue='0' />
              <FieldError errors={[{ message: 'Must be at least 1 player.' }]} />
            </Field>
          </FieldGroup>
        </div>
      </div>

      <div className='space-y-3'>
        <p className='caption text-ink-muted'>Field — horizontal</p>
        <div className='rounded-xl border border-border bg-card p-5'>
          <FieldGroup>
            <Field orientation='horizontal'>
              <FieldLabel>Notify me</FieldLabel>
              <Checkbox label='Receive an email when a game session is logged.' />
            </Field>
          </FieldGroup>
        </div>
      </div>
    </section>
  )
}
