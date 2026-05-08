import { useCallback, useEffect, useRef, useState } from 'react'

export type TimerState = 'idle' | 'running' | 'paused' | 'expired'

export interface TimerValue {
  state: TimerState
  remaining: number
  total: number
  pct: number
  start: (seconds: number) => void
  pause: () => void
  resume: () => void
  stop: () => void
  restart: () => void
  addSeconds: (n: number) => void
}

export function useTimer(): TimerValue {
  const [state, setState] = useState<TimerState>('idle')
  const [remaining, setRemaining] = useState(0)
  const [total, setTotal] = useState(0)

  const endTimeRef = useRef<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTick = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const startTick = (endTime: number) => {
    clearTick()
    intervalRef.current = setInterval(() => {
      const left = Math.max(0, Math.round((endTime - Date.now()) / 1000))
      setRemaining(left)
      if (left === 0) {
        clearTick()
        setState('expired')
      }
    }, 1000)
  }

  const start = useCallback((seconds: number) => {
    const end = Date.now() + seconds * 1000
    endTimeRef.current = end
    setTotal(seconds)
    setRemaining(seconds)
    setState('running')
    startTick(end)
  }, [])

  const pause = useCallback(() => {
    if (endTimeRef.current !== null) {
      const left = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000))
      setRemaining(left)
    }
    clearTick()
    setState('paused')
  }, [])

  const resume = useCallback(() => {
    setRemaining(prev => {
      const end = Date.now() + prev * 1000
      endTimeRef.current = end
      startTick(end)
      return prev
    })
    setState('running')
  }, [])

  const stop = useCallback(() => {
    clearTick()
    endTimeRef.current = null
    setRemaining(0)
    setTotal(0)
    setState('idle')
  }, [])

  const restart = useCallback(() => {
    setTotal(prev => {
      const end = Date.now() + prev * 1000
      endTimeRef.current = end
      setRemaining(prev)
      setState('running')
      startTick(end)
      return prev
    })
  }, [])

  const addSeconds = useCallback((n: number) => {
    setState(currentState => {
      if (currentState === 'running' && endTimeRef.current !== null) {
        endTimeRef.current += n * 1000
        const left = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000))
        setRemaining(left)
      } else if (currentState === 'paused') {
        setRemaining(prev => prev + n)
      }
      return currentState
    })
  }, [])

  useEffect(() => {
    return () => clearTick()
  }, [])

  const pct = total > 0 ? remaining / total : 0

  return { state, remaining, total, pct, start, pause, resume, stop, restart, addSeconds }
}
