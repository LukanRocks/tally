import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import { RouteGuard } from '@/components/routing/route-guard'
import { useSettings } from '@/contexts/settings-context'
import { Layout } from '@/components/layout/layout'

import Onboarding from '@/pages/Onboarding'
import Dashboard from '@/pages/Home'
import Library from '@/pages/Library'
import GameDetail from '@/pages/GameDetail'
import GameForm from '@/pages/GameForm'
import SessionLogger from '@/pages/SessionLogger'
import Players from '@/pages/Players'
import PlayerProfile from '@/pages/PlayerProfile'
import Leaderboard from '@/pages/Leaderboard'
import SettingsPage from '@/pages/Settings'
import DesignSystem from '@/pages/DesignSystem'
import Tools from '@/pages/Tools'
import Dice from '@/pages/Dice'
import FirstPlayer from '@/pages/FirstPlayer'
import Timer from '@/pages/Timer'

export const AppRoutes = () => {
  const { settings } = useSettings()

  return (
    <BrowserRouter>
      <Routes>
        <Route path='onboarding' element={<RouteGuard redirectWhen={settings.onboarded} redirectTo='/home' element={<Onboarding />} />} />
        <Route element={<RouteGuard redirectWhen={!settings.onboarded} redirectTo='/onboarding' element={<Layout />} />}>
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
          <Route path='tools' element={<Tools />} />
          <Route path='tools/dice' element={<Dice />} />
          <Route path='tools/first-player' element={<FirstPlayer />} />
          <Route path='tools/timer' element={<Timer />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
