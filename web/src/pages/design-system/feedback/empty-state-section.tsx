import { Dices, Library } from 'lucide-react'
import { EmptyState } from '@/components/2-molecules/empty-state'
import { Button } from '@/components/1-atoms/button'

export const EmptyStateSection = () => (
  <section className='space-y-6'>
    <div>
      <h2 className='text-2xl font-bold'>Empty state</h2>
      <p className='mt-1 text-sm text-ink-secondary'>
        Always offers <em>the next action</em>. Never a sad mascot.
      </p>
    </div>

    <div className='grid grid-cols-2 gap-4'>
      <EmptyState icon={Dices} description='Log your first game and the leaderboard starts filling in.'>
        <Button>+ Log first session</Button>
      </EmptyState>

      <EmptyState icon={Library} description="Add a game you own, or one you've played at a friend's place.">
        <Button size='small'>+ Add game</Button>
        <Button size='small' variant='ghost' color='secondary'>
          Browse BGG
        </Button>
      </EmptyState>
    </div>
  </section>
)
