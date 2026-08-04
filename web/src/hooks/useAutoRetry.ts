import { useCallback, useEffect, useRef, useState } from 'react'

export const useAutoRetry = (fn: () => void, interval = 30) => {
  const [enabled, setEnabled] = useState(true)
  const [countdown, setCountdown] = useState(interval)
  const fnRef = useRef(fn)
  // The countdown is kept in a ref and mirrored into state for display. The tick
  // has to read the current value and decide whether this is the attempt, and
  // that decision cannot live inside a setCountdown updater: React runs updaters
  // lazily, during the render phase of the component holding the state. Firing
  // the retry from in there called setState on whoever owns the callback while
  // this component was rendering — the "Cannot update a component while
  // rendering a different component" warning — and StrictMode's double
  // invocation of updaters ran the whole retry twice per cycle.
  const countdownRef = useRef(interval)

  fnRef.current = fn

  const reset = useCallback(() => {
    countdownRef.current = interval
    setCountdown(interval)
  }, [interval])

  const fire = useCallback(() => {
    reset()
    fnRef.current()
  }, [reset])

  const toggle = useCallback(() => {
    setEnabled((e) => !e)
    reset()
  }, [reset])

  useEffect(() => {
    reset()
  }, [reset])

  useEffect(() => {
    if (!enabled) return

    const id = setInterval(() => {
      if (countdownRef.current <= 1) return fire()

      countdownRef.current -= 1
      setCountdown(countdownRef.current)
    }, 1000)

    return () => clearInterval(id)
  }, [enabled, fire])

  const formatted = `${Math.floor(countdown / 60)}:${String(countdown % 60).padStart(2, '0')}`

  return { enabled, toggle, formatted, fire }
}
