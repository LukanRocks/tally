import { Moon, Sun, SunMoon } from 'lucide-react'
import { useTheme, AVAILABLE_THEMES, ThemeSetting } from '@/hooks/useTheme'

const ThemeIcon = ({ theme }: { theme: ThemeSetting }) => {
  if (theme === 'dark') return <Moon size={18} />
  if (theme === 'light') return <Sun size={18} />

  return <SunMoon size={18} />
}

export const ThemeToggle = () => {
  const { userTheme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(AVAILABLE_THEMES[(AVAILABLE_THEMES.indexOf(userTheme) + 1) % AVAILABLE_THEMES.length])}
      className='inline-flex items-center rounded-sm border border-paper-muted p-2 text-ink-primary transition-colors hover:bg-muted'
      title={userTheme}
    >
      <ThemeIcon theme={userTheme} />
    </button>
  )
}
