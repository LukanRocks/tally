import { Link } from 'react-router-dom'
import { Timer } from 'lucide-react'

export default function ToolsPage() {
  return (
    <div className='p-6 space-y-4'>
      <h1 className='text-2xl font-bold'>Tools</h1>
      <Link to='/tools/timer'>
        <div className='flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:bg-accent'>
          <div className='flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary'>
            <Timer size={20} />
          </div>
          <div>
            <p className='font-semibold'>Turn Timer</p>
            <p className='text-sm text-muted-foreground'>Countdown timer for timed turns</p>
          </div>
        </div>
      </Link>
    </div>
  )
}
