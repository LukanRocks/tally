import { Avatar, AvatarGroup } from '@/components/1-atoms/avatar'
import { Plus } from 'lucide-react'

export function AvatarsSection() {
  return (
    <section className='space-y-6'>
      <div>
        <h2 className='text-2xl font-bold'>Avatars</h2>
        <p className='mt-1 text-sm text-ink-secondary'>
          With initials as a fallback, each player is assigned a color randomly that never changes — that's how someone becomes "the pink one".
        </p>
      </div>

      <div className='space-y-4 rounded-xl border border-border bg-card p-5'>
        <p className='caption text-ink-muted'>Sizes</p>
        <div className='flex flex-wrap items-center gap-4'>
          <Avatar size='xs' id={0} name='Alice' />
          <Avatar size='sm' id={0} name='Alice' />
          <Avatar size='md' id={0} name='Alice' />
          <Avatar size='lg' id={0} name='Alice' />
          <Avatar size='xl' id={0} name='Alice' />
          <span className='text-xs text-ink-muted'>xs 20 · sm 28 · md 36 · lg 56 · xl 88</span>
        </div>

        <p className='caption text-ink-muted'>Player palette</p>
        <div className='flex flex-wrap items-center gap-3'>
          {(
            [
              { id: 1, name: 'Alice' },
              { id: 2, name: 'Marcus' },
              { id: 3, name: 'Grace' },
              { id: 4, name: 'Leo' },
              { id: 5, name: 'Julia' },
              { id: 6, name: 'Karl' },
            ] as const
          ).map(({ id, name }) => (
            <Avatar key={id} size='lg' id={id} name={name} />
          ))}
        </div>

        <p className='caption text-ink-muted'>Avatar Group</p>
        <div className='flex flex-wrap items-center gap-8'>
          <AvatarGroup
            players={[
              { id: 1, name: 'Alice' },
              { id: 2, name: 'Marcus' },
              { id: 3, name: 'Grace' },
            ]}
          />
          <AvatarGroup
            players={[
              { id: 1, name: 'Alice' },
              { id: 2, name: 'Marcus' },
              { id: 3, name: 'Grace' },
            ]}
          >
            +2
          </AvatarGroup>
          <AvatarGroup
            players={[
              { id: 1, name: 'Alice' },
              { id: 2, name: 'Marcus' },
              { id: 3, name: 'Grace' },
            ]}
          >
            <Plus size={16} />
          </AvatarGroup>
        </div>
      </div>
    </section>
  )
}
