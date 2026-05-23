import { useEffect, useState } from 'react'

export const useTimeAgo = (date: Date) => {
  const [label, setLabel] = useState('')

  useEffect(() => {
    const update = () => {
      const secs = Math.floor((Date.now() - date.getTime()) / 1000)

      if (secs < 5) setLabel('just now')
      else if (secs < 60) setLabel(`${secs}s ago`)
      else if (secs < 3600) setLabel(`${Math.floor(secs / 60)}m ago`)
      else if (secs < 86400) setLabel(`${Math.floor(secs / 3600)}h ago`)
      else if (secs < 2592000) setLabel(`${Math.floor(secs / 86400)}d ago`)
      else if (secs < 31536000) setLabel(`${Math.floor(secs / 2592000)}mo ago`)
      else setLabel(`${Math.floor(secs / 31536000)}y ago`)
    }

    update()

    const id = setInterval(update, 1000)

    return () => clearInterval(id)
  }, [date])

  return label
}
