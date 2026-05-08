import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { api } from '../lib/api'

function greeting() {
  const hours = new Date().getHours()

  if (hours < 5) return 'Good night'
  if (hours < 12) return 'Good morning'
  if (hours < 18) return 'Good afternoon'

  return 'Good evening'
}

export const GreetingBanner = () => {
  const [ownerName, setOwnerName] = useState<string | null>(null)

  useEffect(() => {
    api.settings.get().then(async (settings) => {
      if (!settings.default_owner_id) return

      const players = await api.players.list()
      const owner = players.find((p) => p.id === settings.default_owner_id)

      if (owner) setOwnerName(owner.name)
    })
  }, [])

  return (
    <div className='flex items-center justify-between rounded-xl border border-border bg-ds-surface-elevated px-4 py-3'>
      <p>
        {greeting()}
        {ownerName ? `, ${ownerName}` : ''}.
      </p>

      <Link
        to='/sessions/new'
        className='flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90'
      >
        <Plus size={12} />
        Log session
      </Link>
    </div>
  )
}
