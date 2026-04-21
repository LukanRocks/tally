import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/shadcn/components/ui/sonner';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Library from './pages/Library';
import GameDetail from './pages/GameDetail';
import GameForm from './pages/GameForm';
import SessionLogger from './pages/SessionLogger';
import Players from './pages/Players';
import PlayerProfile from './pages/PlayerProfile';
import Leaderboard from './pages/Leaderboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="home" element={<Dashboard />} />
          <Route path="library" element={<Library />} />
          <Route path="library/new" element={<GameForm />} />
          <Route path="library/:id" element={<GameDetail />} />
          <Route path="library/:id/edit" element={<GameForm />} />
          <Route path="library/:id/session/new" element={<SessionLogger />} />
          <Route path="sessions/new" element={<SessionLogger />} />
          <Route path="players" element={<Players />} />
          <Route path="players/:id" element={<PlayerProfile />} />
          <Route path="leaderboard" element={<Leaderboard />} />
        </Route>
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}
