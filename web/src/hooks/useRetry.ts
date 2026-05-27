import { useCallback, useRef, useState } from 'react'

export const useRetry = (fn: () => void | Promise<void>) => {
  const [retryCount, setRetryCount] = useState(0)
  const [lastAttemptAt, setLastAttemptAt] = useState<Date>(() => new Date())
  const fnRef = useRef(fn)

  fnRef.current = fn

  const retry = useCallback(async () => {
    setRetryCount((c) => c + 1)
    setLastAttemptAt(new Date())

    await fnRef.current()
  }, [])

  const reset = useCallback(() => {
    setRetryCount(0)
  }, [])

  return { retry, retryCount, lastAttemptAt, reset }
}
