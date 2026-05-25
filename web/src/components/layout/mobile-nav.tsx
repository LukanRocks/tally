import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { navConfig } from './nav-config'

const mobileNav = navConfig.filter((r) => r.mobile !== false)

export const MobileNav = () => {
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn('flex flex-1 flex-col items-center justify-center gap-1 py-2 font-mono text-xs font-medium lowercase transition-colors', isActive ? 'text-yellow-primary' : 'text-paper-secondary')

  return (
    <nav className='fixed right-2 bottom-2 left-2 z-50 flex overflow-hidden rounded-2xl border border-paper-primary/20 bg-ink-primary md:hidden'>
      {mobileNav.map(({ path, label, Icon }) => (
        <NavLink key={path} to={path} className={navLinkClass}>
          <Icon size={20} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
