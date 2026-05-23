import { useCallback, useEffect, useRef, useState } from 'react'

export const useAutoRetry = (fn: () => void, interval = 30) => {
  const [enabled, setEnabled] = useState(true)
  const [countdown, setCountdown] = useState(interval)
  const fnRef = useRef(fn)

  fnRef.current = fn

  const fire = useCallback(() => {
    setCountdown(interval)
    fnRef.current()
  }, [interval])

  const toggle = useCallback(() => {
    setEnabled((e) => !e)
    setCountdown(interval)
  }, [interval])

  useEffect(() => {
    setCountdown(interval)
  }, [interval])

  useEffect(() => {
    if (!enabled) return
    const id = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          fnRef.current()
          return interval
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [enabled, interval])

  const formatted = `${Math.floor(countdown / 60)}:${String(countdown % 60).padStart(2, '0')}`

  return { enabled, toggle, formatted, fire }
}
