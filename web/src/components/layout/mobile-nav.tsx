import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { navConfig } from './nav-config'

const mobileNav = navConfig.filter(r => r.mobile !== false)

export const MobileNav = () => {
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn('flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs font-medium transition-colors', isActive ? 'bg-primary/20 text-foreground' : 'text-muted-foreground')

  return (
    <nav className='fixed right-4 bottom-4 left-4 z-50 flex overflow-hidden rounded-2xl border border-border bg-card md:hidden'>
      {mobileNav.map(({ path, label, Icon }) => (
        <NavLink key={path} to={path} className={navLinkClass}>
          <Icon size={20} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
