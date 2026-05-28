import { toast } from 'sonner'
import { ThemeSetting } from '@/hooks/useTheme'
import { useSettings } from '@/contexts/settings-context'
import { Field, FieldLabel } from '@/components/atoms/field'

export const AppearanceManagement = () => {
  const { settings, updateSetting } = useSettings()

  const set = (patch: Parameters<typeof updateSetting>[0]) =>
    updateSetting(patch)
      .then(() => toast.success('Settings saved'))
      .catch((error) => toast.error(error instanceof Error ? error.message : 'Failed to load data'))

  return (
    <div className='space-y-6'>
      <Field>
        <FieldLabel htmlFor='currency'>Currency</FieldLabel>
        <select id='currency' value={settings.currency} onChange={(e) => set({ currency: e.target.value as 'USD' | 'BRL' })} className='input'>
          <option value='USD'>USD — US Dollar</option>
          <option value='BRL'>BRL — Brazilian Real</option>
        </select>
      </Field>

      <Field>
        <FieldLabel htmlFor='language'>Language</FieldLabel>
        <select id='language' value={settings.language} onChange={(e) => set({ language: e.target.value as 'en' | 'pt' })} className='input'>
          <option value='en'>English</option>
          <option value='pt'>Português</option>
        </select>
      </Field>

      <Field>
        <FieldLabel htmlFor='theme'>Theme</FieldLabel>
        <select id='theme' value={settings.theme} onChange={(e) => set({ theme: e.target.value as ThemeSetting })} className='input'>
          <option value='system'>System</option>
          <option value='light'>Light</option>
          <option value='dark'>Dark</option>
        </select>
      </Field>
    </div>
  )
}
