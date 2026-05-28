import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { api, Player } from '@/lib/http-transport/api'
import { useSettings } from '@/contexts/settings-context'
import { Field, FieldLabel, FieldDescription } from '@/components/atoms/field'

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
    <div className='space-y-6'>
      <Field>
        <FieldLabel htmlFor='default_owner_id'>Default Owner</FieldLabel>
        <select
          id='default_owner_id'
          value={settings.default_owner_id != null ? String(settings.default_owner_id) : ''}
          onChange={(e) => set({ default_owner_id: Number(e.target.value) })}
          className='input'
        >
          {players.map((p) => (
            <option key={p.id} value={String(p.id)}>
              {p.name}
            </option>
          ))}
        </select>
        <FieldDescription>Automatically set as the owner when adding new games.</FieldDescription>
      </Field>
    </div>
  )
}
