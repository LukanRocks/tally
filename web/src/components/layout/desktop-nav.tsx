import { NavLink } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { navConfig } from './nav-config'

const navItems = navConfig.filter((r) => r.desktop !== false)

export const DesktopNav = () => {
  return (
    <aside className='bg-surface-elevated hidden w-56 shrink-0 border-r border-paper-muted text-ink-primary md:flex md:flex-col'>
      <NavLink to={navItems[0].path} className='hover:bg-surface-sunken flex items-center gap-2 px-4 py-3 transition-colors'>
        <svg width='32' height='32' viewBox='0 0 64 64' className='shrink-0 text-ink-primary' aria-hidden='true'>
          <rect x='13' y='16' width='5' height='32' rx='1.5' fill='currentColor' />
          <rect x='22' y='16' width='5' height='32' rx='1.5' fill='currentColor' />
          <rect x='31' y='16' width='5' height='32' rx='1.5' fill='currentColor' />
          <rect x='40' y='16' width='5' height='32' rx='1.5' fill='currentColor' />
          <path d='M9 49 L52 15' stroke='currentColor' strokeWidth='6' strokeLinecap='round' />
        </svg>
        <div className='flex flex-col'>
          <span className='font-callout text-2xl leading-tight tracking-tight text-ink-primary'>Tally</span>
        </div>
      </NavLink>

      <div className='h-px w-full bg-paper-muted' />

      <nav className='flex-1 space-y-1 px-3 py-4'>
        {navItems.map(({ path, label, Icon }) => {
          return (
            <NavLink key={path} to={path}>
              {({ isActive }) => (
                <div
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium capitalize transition-all',
                    isActive ? 'bg-primary/10 text-ink-primary shadow-[-2px_0_0_var(--color-primary)]' : 'text-ink-muted hover:text-ink-primary',
                  )}
                >
                  <Icon size={16} />
                  <span className='flex-1'>{label}</span>
                </div>
              )}
            </NavLink>
          )
        })}
      </nav>

      <div className='px-3 pb-4'>
        <NavLink
          to='/sessions/new'
          className='flex items-center gap-3 rounded-xl border border-ink-primary bg-paper-primary px-3 py-2.5 shadow-stamp transition-[transform,box-shadow] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--ink-primary)] active:translate-x-px active:translate-y-px'
        >
          <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-yellow-primary text-ink-on-yellow'>
            <Plus size={16} strokeWidth={2.5} />
          </span>
          <span className='flex-1 text-sm font-semibold text-ink-primary capitalize'>add session</span>
          {/* <span className='text-xs text-ink-muted'>⌘N</span> */}
        </NavLink>
      </div>
    </aside>
  )
}
