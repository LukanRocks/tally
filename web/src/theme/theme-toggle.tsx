import { Moon, Sun, SunMoon } from 'lucide-react'
import { useTheme, AVAILABLE_THEMES, ThemeSetting } from '@/theme'
import { Button } from '@/components/1-atoms/button'

const ThemeIcon = ({ theme }: { theme: ThemeSetting }) => {
  if (theme === 'dark') return <Moon />
  if (theme === 'light') return <Sun />

  return <SunMoon />
}

export const ThemeToggle = () => {
  const { userTheme, setTheme } = useTheme()

  return (
    <Button
      variant='outline'
      color='secondary'
      size='icon'
      title={userTheme}
      onClick={() => setTheme(AVAILABLE_THEMES[(AVAILABLE_THEMES.indexOf(userTheme) + 1) % AVAILABLE_THEMES.length])}
    >
      <ThemeIcon theme={userTheme} />
    </Button>
  )
}
