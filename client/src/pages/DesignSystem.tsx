import Page from '../components/Page'
import Badge from '../components/badge'
import { useTheme, type ThemeSetting } from '../hooks/useTheme'
import { cn } from '../lib/utils'

const COLORS = ['gold', 'silver', 'bronze', 'own', 'friend', 'rented', 'success', 'warning', 'info', 'destructive', 'primary'] as const
const VARIANTS = ['default', 'outline', 'ghost'] as const

const THEMES: ThemeSetting[] = ['light', 'dark', 'system']

export default function DesignSystem() {
  const { setting, set } = useTheme()

  return (
    <Page>
      <div className='flex items-start justify-between'>
        <div>
          <h1 className='text-2xl font-bold'>Design System</h1>
          <p className='mt-1 text-sm text-muted-foreground'>Internal reference — not linked from the nav.</p>
        </div>
        <div className='flex overflow-hidden rounded-lg border border-border'>
          {THEMES.map((t) => (
            <button
              key={t}
              onClick={() => set(t)}
              className={cn(
                'eyebrow px-3 py-1.5 transition-colors',
                t === setting ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted',
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Badges */}
      <section className='space-y-4'>
        <h2 className='text-lg font-semibold'>Badges</h2>

        <div className='overflow-auto rounded-xl border border-border bg-ds-surface-elevated'>
          <table className='w-full text-sm'>
            <thead className='bg-muted/50'>
              <tr>
                <th className='eyebrow px-4 py-3 text-left text-muted-foreground'>Variant</th>
                {COLORS.map((c) => (
                  <th key={c} className='eyebrow px-3 py-3 text-center text-muted-foreground'>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className='divide-y divide-border'>
              {VARIANTS.map((variant) => (
                <tr key={variant} className='hover:bg-muted/30'>
                  <td className='eyebrow px-4 py-3 text-muted-foreground'>{variant}</td>
                  {COLORS.map((color) => (
                    <td key={color} className='px-3 py-3 text-center'>
                      <Badge variant={variant} color={color}>
                        {color}
                      </Badge>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </Page>
  )
}
