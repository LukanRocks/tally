import { Link } from 'react-router-dom'
import { Timer, Dices, type LucideIcon } from 'lucide-react'

interface Tool {
  path: string
  icon: LucideIcon
  label: string
  description: string
}

const TOOLS: Tool[] = [
  { path: '/tools/timer', icon: Timer, label: 'Go faster!', description: 'Keep turns moving with a countdown timer.' },
  { path: '/tools/first-player', icon: Dices, label: 'Who Goes First?', description: 'Decide who starts playing with a random prompt.' },
]

function ToolCard({ path, icon: Icon, label, description }: Tool) {
  return (
    <Link to={path}>
      <div className='flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:bg-accent'>
        <div className='flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary'>
          <Icon size={20} />
        </div>
        <div>
          <p className='font-semibold'>{label}</p>
          <p className='text-sm text-muted-foreground'>{description}</p>
        </div>
      </div>
    </Link>
  )
}

export default function ToolsPage() {
  return (
    <div className='flex flex-col gap-6 p-6'>
      <h1 className='text-2xl font-bold'>Tools</h1>
      <div className='flex flex-col gap-3'>
        {TOOLS.map(({ path, icon, label, description }) => (
          <ToolCard key={path} path={path} icon={icon} label={label} description={description} />
        ))}
      </div>
    </div>
  )
}
