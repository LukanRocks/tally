import { House, Library, Settings, Trophy, Users, Wrench } from 'lucide-react'
import type { ComponentColor } from '@/lib/colors'

export type NavConfig = {
  path: string
  label: string
  Icon: React.ElementType
  desktop?: boolean
  mobile?: boolean
  badge?: { label: string; color: ComponentColor }
}

export const navConfig: NavConfig[] = [
  { path: 'home', label: 'Home', Icon: House },
  { path: 'leaderboard', label: 'Leaderboard', Icon: Trophy },
  { path: 'library', label: 'Library', Icon: Library },
  { path: 'players', label: 'Players', Icon: Users },
  { path: 'tools', label: 'Tools', Icon: Wrench },
  { path: 'settings', label: 'Settings', Icon: Settings },
]
