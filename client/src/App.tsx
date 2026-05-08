import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/shadcn/components/ui/sonner'
import { SettingsProvider } from './contexts/SettingsContext'
import { useSettings } from './contexts/SettingsContext'
import Layout from './components/Layout'
import Dashboard from './pages/Home'
import Library from './pages/Library'
import GameDetail from './pages/GameDetail'
import GameForm from './pages/GameForm'
import SessionLogger from './pages/SessionLogger'
import Players from './pages/Players'
import PlayerProfile from './pages/PlayerProfile'
import Leaderboard from './pages/Leaderboard'
import SettingsPage from './pages/Settings'
import Onboarding from './pages/Onboarding'
import DesignSystem from './pages/DesignSystem'

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { settings, isLoading } = useSettings()
  if (isLoading) return <div className='flex min-h-screen items-center justify-center text-sm text-muted-foreground'>Loading…</div>
  if (!settings || settings.onboarded === 0) return <Navigate to='/onboarding' replace />
  return <>{children}</>
}

function OnboardingRoute() {
  const { settings, isLoading } = useSettings()
  if (isLoading) return <div className='flex min-h-screen items-center justify-center text-sm text-muted-foreground'>Loading…</div>
  if (settings?.onboarded === 1) return <Navigate to='/home' replace />
  return <Onboarding />
}

export default function App() {
  return (
    <SettingsProvider>
      <BrowserRouter>
        <Routes>
          <Route path='onboarding' element={<OnboardingRoute />} />
          <Route
            element={
              <OnboardingGuard>
                <Layout />
              </OnboardingGuard>
            }
          >
            <Route index element={<Navigate to='/home' replace />} />
            <Route path='home' element={<Dashboard />} />
            <Route path='library' element={<Library />} />
            <Route path='library/new' element={<GameForm />} />
            <Route path='library/:id' element={<GameDetail />} />
            <Route path='library/:id/edit' element={<GameForm />} />
            <Route path='library/:id/session/new' element={<SessionLogger />} />
            <Route path='sessions/new' element={<SessionLogger />} />
            <Route path='players' element={<Players />} />
            <Route path='players/:id' element={<PlayerProfile />} />
            <Route path='leaderboard' element={<Leaderboard />} />
            <Route path='settings' element={<SettingsPage />} />
            <Route path='design-system' element={<DesignSystem />} />
          </Route>
        </Routes>
        <Toaster />
      </BrowserRouter>
    </SettingsProvider>
  )
}
