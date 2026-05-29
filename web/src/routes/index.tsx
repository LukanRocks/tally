import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import { RouteGuard } from '@/routes/route-guard'
import { useSettings } from '@/contexts/settings-context'
import { Shell } from '@/components/layout/shell'

import Onboarding from '@/pages/Onboarding'

import Dashboard from '@/pages/Home'

import Library from '@/pages/library'
import GameDetail from '@/pages/GameDetail'
import GameForm from '@/pages/GameForm'
import SessionLogger from '@/pages/SessionLogger'

import Players from '@/pages/Players'
import PlayerProfile from '@/pages/PlayerProfile'

import Leaderboard from '@/pages/Leaderboard'

import SettingsPage from '@/pages/settings'

import Tools from '@/pages/tools'
import Dice from '@/pages/tools/dice-roll'
import FirstPlayer from '@/pages/tools/first-player-picker'
import Timer from '@/pages/tools/turn-timer'
import ScoreCounter from '@/pages/tools/score-counter'

import DesignSystem from '@/pages/design-system'

export const AppRoutes = () => {
  const { settings } = useSettings()

  return (
    <BrowserRouter>
      <Routes>
        <Route path='onboarding' element={<RouteGuard redirectWhen={settings.onboarded} redirectTo='/home' element={<Onboarding />} />} />
        <Route element={<RouteGuard redirectWhen={!settings.onboarded} redirectTo='/onboarding' element={<Shell />} />}>
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
          <Route path='tools' element={<Tools />} />
          <Route path='tools/roll-dice' element={<Dice />} />
          <Route path='tools/first-player-picker' element={<FirstPlayer />} />
          <Route path='tools/turn-timer' element={<Timer />} />
          <Route path='tools/score-counter' element={<ScoreCounter />} />
          <Route path='design-system' element={<DesignSystem />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
