import { toast } from 'sonner'
import { ThemeSetting } from '@/theme'
import { useSettings } from '@/contexts/settings-context'
import { Card, CardHeader, CardContent, CardTitle, CardCaption } from '@/components/1-atoms/card'
import { Field, FieldContent, FieldTitle, FieldDescription } from '@/components/1-atoms/field'
import { ThemeToggle } from '@/theme/theme-toggle'

const THEME_LABEL: Record<ThemeSetting, string> = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
}

export const AppearanceManagement = () => {
  const { settings, updateSetting } = useSettings()

  const set = (patch: Parameters<typeof updateSetting>[0]) =>
    updateSetting(patch)
      .then(() => toast.success('Settings saved'))
      .catch((error) => toast.error(error instanceof Error ? error.message : 'Failed to load data'))

  return (
    <Card>
      <CardHeader>
        <CardCaption>Display &amp; localization</CardCaption>
        <CardTitle>Appearance</CardTitle>
      </CardHeader>

      <CardContent className='flex flex-col divide-y divide-border'>
        <Field orientation='horizontal' className='py-4 first:pt-0 last:pb-0'>
          <FieldContent>
            <FieldTitle>Currency</FieldTitle>
            <FieldDescription>Used for price display throughout the app.</FieldDescription>
          </FieldContent>
          <select id='currency' value={settings.currency} onChange={(e) => set({ currency: e.target.value as 'USD' | 'BRL' })} className='input w-auto'>
            <option value='USD'>USD — US Dollar</option>
            <option value='BRL'>BRL — Brazilian Real</option>
          </select>
        </Field>

        <Field orientation='horizontal' className='py-4 first:pt-0 last:pb-0'>
          <FieldContent>
            <FieldTitle>Language</FieldTitle>
            <FieldDescription>Affects dates, numbers, and UI text.</FieldDescription>
          </FieldContent>
          <select id='language' value={settings.language} onChange={(e) => set({ language: e.target.value as 'en' | 'pt' })} className='input w-auto'>
            <option value='en'>English</option>
            <option value='pt'>Português</option>
          </select>
        </Field>

        <Field orientation='horizontal' className='py-4 first:pt-0 last:pb-0'>
          <FieldContent>
            <FieldTitle>Theme</FieldTitle>
            <FieldDescription>Light, dark, or match your system setting.</FieldDescription>
          </FieldContent>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-ink-muted'>{THEME_LABEL[settings.theme]}</span>
            <ThemeToggle />
          </div>
        </Field>
      </CardContent>
    </Card>
  )
}
