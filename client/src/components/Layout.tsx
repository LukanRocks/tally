import { NavLink, Outlet } from 'react-router-dom'
import { House, Library, Settings, Swords, Trophy, Users, Wrench } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

const navItems = [
  { to: '/home', label: 'Home', Icon: House },
  { to: '/leaderboard', label: 'Leaderboard', Icon: Trophy },
  { to: '/library', label: 'Library', Icon: Library },
  { to: '/players',  label: 'Players',  Icon: Users },
  { to: '/tools',    label: 'Tools',    Icon: Wrench },
  { to: '/settings', label: 'Settings', Icon: Settings },
]

export default function Layout() {
  useTheme()

  return (
    <div className='flex h-screen bg-background text-foreground'>
      <aside className='hidden w-56 shrink-0 border-r border-border bg-sidebar text-sidebar-foreground md:flex md:flex-col'>
        <NavLink to={navItems[0].to} className='flex items-center gap-2 border-b border-border px-6 py-5 transition-colors hover:bg-sidebar-accent'>
          <Swords size={20} className='text-sidebar-primary' />
          <span className='text-xl font-bold tracking-tight text-sidebar-primary'>Tally</span>
        </NavLink>
        <nav className='flex-1 space-y-1 px-3 py-4'>
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-sidebar-primary/15 text-sidebar-primary' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className='flex-1 overflow-auto bg-background pb-24 md:pb-0'>
        <Outlet />
      </main>
      <nav className='fixed bottom-4 left-4 right-4 z-50 flex overflow-hidden rounded-2xl border border-border bg-sidebar shadow-lg md:hidden'>
        {navItems.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs font-medium transition-colors ${
                isActive ? 'bg-sidebar-primary/15 text-sidebar-primary' : 'text-sidebar-foreground/70'
              }`
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
