import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Library, Trophy, Users } from 'lucide-react'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/library', label: 'Library', Icon: Library },
  { to: '/leaderboard', label: 'Leaderboard', Icon: Trophy },
  { to: '/players', label: 'Players', Icon: Users },
]

export default function Layout() {
  return (
    <div className='flex h-screen bg-gray-50'>
      <aside className='w-56 bg-white border-r border-gray-200 flex flex-col shrink-0'>
        <div className='px-6 py-5 border-b border-gray-100'>
          <span className='text-xl font-bold tracking-tight text-brand-600'>Tally</span>
        </div>
        <nav className='flex-1 px-3 py-4 space-y-1'>
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-brand-50 text-brand-600' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className='flex-1 overflow-auto'>
        <Outlet />
      </main>
    </div>
  )
}
