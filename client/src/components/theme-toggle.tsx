import { Moon, Sun, SunMoon } from 'lucide-react'
import { useTheme, THEMES, ThemeSetting } from '../hooks/useTheme'

const ThemeIcon = ({ setting }: { setting: ThemeSetting }) => {
  if (setting === 'dark') return <Moon size={18} />
  if (setting === 'system') return <SunMoon size={18} />

  return <Sun size={18} />
}

export const ThemeToggle = () => {
  const { setting, set } = useTheme()

  return (
    <button
      onClick={() => set(THEMES[(THEMES.indexOf(setting) + 1) % THEMES.length])}
      className='inline-flex items-center rounded-sm border border-paper-muted p-2 text-ink-primary transition-colors hover:bg-muted'
      title={setting}
    >
      <ThemeIcon setting={setting} />
    </button>
  )
}
