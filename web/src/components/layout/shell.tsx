import { Outlet } from 'react-router-dom'
import { DesktopNav } from './desktop-nav'
import { MobileNav } from './mobile-nav'

export const Shell = () => (
  <div className='flex h-screen bg-paper-primary text-ink-primary'>
    <DesktopNav />
    <main className='flex-1 overflow-auto bg-paper-primary pb-28 md:pb-0'>
      <Outlet />
    </main>
    <MobileNav />
  </div>
)
