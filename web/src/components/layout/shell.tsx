import { Outlet } from 'react-router-dom'
import { DesktopNav } from './desktop-nav'
import { MobileNav } from './mobile-nav'

export const Shell = () => (
  <div className='flex h-screen bg-background text-foreground'>
    <DesktopNav />
    <main className='flex-1 overflow-auto bg-background pb-28 md:pb-0'>
      <Outlet />
    </main>
    <MobileNav />
  </div>
)
