import { NavLink, Outlet } from 'react-router-dom'
import { House, Library, Moon, Sun, Swords, Trophy, Users } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'

const navItems = [
  { to: '/home', label: 'Home', Icon: House },
  { to: '/leaderboard', label: 'Leaderboard', Icon: Trophy },
  { to: '/library', label: 'Library', Icon: Library },
  { to: '/players', label: 'Players', Icon: Users },
]

export default function Layout() {
  const { theme, toggle } = useTheme()

  return (
    <div className='flex h-screen bg-background text-foreground'>
      <aside className='hidden md:flex md:flex-col w-56 bg-sidebar text-sidebar-foreground border-r border-border shrink-0'>
        <NavLink to={navItems[0].to} className='px-6 py-5 border-b border-border flex items-center gap-2 hover:bg-sidebar-accent transition-colors'>
          <Swords size={20} className='text-sidebar-primary' />
          <span className='text-xl font-bold tracking-tight text-sidebar-primary'>Tally</span>
        </NavLink>
        <nav className='flex-1 px-3 py-4 space-y-1'>
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ?
                    'bg-sidebar-primary/15 text-sidebar-primary'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className='px-3 py-4 border-t border-border'>
          <button
            onClick={toggle}
            className='flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors'
          >
            {theme === 'dark' ?
              <Sun size={16} />
            : <Moon size={16} />}
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
        </div>
      </aside>
      <main className='flex-1 overflow-auto bg-background pb-16 md:pb-0'>
        <Outlet />
      </main>
      <nav className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-sidebar border-t border-border flex">
        {navItems.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-2 gap-1 text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-sidebar-primary/15 text-sidebar-primary'
                  : 'text-sidebar-foreground/70'
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
