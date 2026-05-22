import { NavLink, Outlet } from 'react-router-dom'
import { House, Library, Settings, Trophy, Users, Wrench } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/home', label: 'Home', Icon: House },
  { to: '/leaderboard', label: 'Leaderboard', Icon: Trophy },
  { to: '/library', label: 'Library', Icon: Library },
  { to: '/players', label: 'Players', Icon: Users },
  { to: '/tools', label: 'Tools', Icon: Wrench },
  { to: '/settings', label: 'Settings', Icon: Settings },
]

const DesktopNav = () => {
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
      isActive ? 'bg-primary/20 text-foreground' : 'text-muted-foreground hover:text-foreground',
    )

  return (
    <aside className='bg-surface-elevated hidden w-56 shrink-0 border-r border-border text-foreground md:flex md:flex-col'>
      <NavLink to={navItems[0].to} className='hover:bg-surface-sunken flex items-center gap-1 border-b border-border px-4 py-2 transition-colors'>
        <svg width='32' height='32' viewBox='0 0 64 64' className='text-foreground' aria-hidden='true'>
          <rect x='13' y='16' width='5' height='32' rx='1.5' fill='currentColor' />
          <rect x='22' y='16' width='5' height='32' rx='1.5' fill='currentColor' />
          <rect x='31' y='16' width='5' height='32' rx='1.5' fill='currentColor' />
          <rect x='40' y='16' width='5' height='32' rx='1.5' fill='currentColor' />
          <path d='M9 49 L52 15' stroke='currentColor' strokeWidth='6' strokeLinecap='round' />
        </svg>
        <span className='font-callout text-2xl tracking-tight text-foreground'>Tally</span>
      </NavLink>

      <nav className='flex-1 space-y-1 px-3 py-4'>
        {navItems.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to} className={navLinkClass}>
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

const MobileNav = () => {
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn('flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs font-medium transition-colors', isActive ? 'bg-primary/20 text-foreground' : 'text-muted-foreground')

  return (
    <nav className='bg-surface-elevated fixed right-4 bottom-4 left-4 z-50 flex overflow-hidden rounded-2xl border border-border shadow-lg md:hidden'>
      {navItems.map(({ to, label, Icon }) => (
        <NavLink key={to} to={to} className={navLinkClass}>
          <Icon size={20} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export const Layout = () => {
  useTheme()

  return (
    <div className='flex h-screen bg-background text-foreground'>
      <DesktopNav />
      <main className='flex-1 overflow-auto bg-background pb-28 md:pb-0'>
        <Outlet />
      </main>
      <MobileNav />
    </div>
  )
}
