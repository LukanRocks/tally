import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { api, Player } from '@/lib/http-transport/api'
import { useSettings } from '@/contexts/settings-context'
import { Card, CardHeader, CardContent, CardTitle, CardCaption } from '@/components/1-atoms/card'
import { Field, FieldContent, FieldTitle, FieldDescription } from '@/components/1-atoms/field'

export const WorkspaceManagement = () => {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.players
      .list()
      .then((playerList) => setPlayers(playerList))
      .catch((error) => toast.error(error instanceof Error ? error.message : 'Failed to load data'))
      .finally(() => setLoading(false))
  }, [])

  const { settings, updateSetting } = useSettings()

  const set = (patch: Parameters<typeof updateSetting>[0]) =>
    updateSetting(patch)
      .then(() => toast.success('Settings saved'))
      .catch((error) => toast.error(error instanceof Error ? error.message : 'Failed to load data'))

  if (loading) return null

  return (
    <Card>
      <CardHeader>
        <CardCaption>Players &amp; defaults</CardCaption>
        <CardTitle>Workspace</CardTitle>
      </CardHeader>

      <CardContent className='flex flex-col divide-y divide-border'>
        <Field orientation='horizontal' className='py-4 first:pt-0 last:pb-0'>
          <FieldContent>
            <FieldTitle>Default Owner</FieldTitle>
            <FieldDescription>Automatically set as the owner when adding new games.</FieldDescription>
          </FieldContent>
          <select
            id='default_owner_id'
            value={settings.default_owner_id != null ? String(settings.default_owner_id) : ''}
            onChange={(e) => set({ default_owner_id: Number(e.target.value) })}
            className='input w-auto'
          >
            {players.map((p) => (
              <option key={p.id} value={String(p.id)}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
      </CardContent>
    </Card>
  )
}
