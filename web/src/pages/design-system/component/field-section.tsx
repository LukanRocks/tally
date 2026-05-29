import { Search, AtSign, Eye, Send } from 'lucide-react'
import { Label } from '@/components/1-atoms/label'
import { Separator } from '@/components/1-atoms/separator'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSeparator } from '@/components/1-atoms/field'
import { Input, InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText, InputGroupTextarea } from '@/components/1-atoms/input'
import { Checkbox } from '@/components/1-atoms/checkbox'

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

      <div className='space-y-3'>
        <p className='caption text-ink-muted'>InputGroup — inline addons</p>
        <div className='flex flex-row gap-3 rounded-xl border border-border bg-card p-5'>
          <InputGroup>
            <InputGroupAddon align='inline-start'>
              <InputGroupText>
                <Search size={15} />
              </InputGroupText>
            </InputGroupAddon>
            <InputGroupInput placeholder='Search games…' />
          </InputGroup>

          <InputGroup>
            <InputGroupAddon align='inline-start'>
              <InputGroupText>
                <AtSign size={15} />
              </InputGroupText>
            </InputGroupAddon>
            <InputGroupInput placeholder='username' />
            <InputGroupAddon align='inline-end'>
              <InputGroupText>.bgg.com</InputGroupText>
            </InputGroupAddon>
          </InputGroup>

          <InputGroup>
            <InputGroupInput type='password' placeholder='Password' />
            <InputGroupAddon align='inline-end'>
              <InputGroupButton size='icon-xs'>
                <Eye size={14} />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </div>
      </div>

      <div className='space-y-3'>
        <p className='caption text-ink-muted'>InputGroup — block addons</p>
        <div className='flex flex-col gap-3 rounded-xl border border-border bg-card p-5'>
          <InputGroup>
            <InputGroupAddon align='block-start'>
              <InputGroupText>Notes</InputGroupText>
            </InputGroupAddon>
            <InputGroupTextarea placeholder='Add a note about this session…' rows={3} />
          </InputGroup>

          <InputGroup>
            <InputGroupTextarea placeholder='Write a message…' rows={3} />
            <InputGroupAddon align='block-end'>
              <InputGroupButton size='xs'>
                <Send size={12} />
                Send
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </div>
      </div>
    </section>
  )
}
