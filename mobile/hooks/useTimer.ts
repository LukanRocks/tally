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
  const [state, setStateRaw] = useState<TimerState>('idle')
  const stateRef = useRef<TimerState>('idle')
  const setState = (s: TimerState) => {
    stateRef.current = s
    setStateRaw(s)
  }
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

  const startTick = () => {
    clearTick()
    intervalRef.current = setInterval(() => {
      if (endTimeRef.current === null) return
      const left = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000))
      setRemaining(left)
      if (left === 0) {
        clearTick()
        setState('expired')
      }
    }, 1000)
  }

  const start = useCallback((seconds: number) => {
    endTimeRef.current = Date.now() + seconds * 1000
    setTotal(seconds)
    setRemaining(seconds)
    setState('running')
    startTick()
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
    setRemaining((prev) => {
      endTimeRef.current = Date.now() + prev * 1000
      startTick()
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
    setTotal((prev) => {
      endTimeRef.current = Date.now() + prev * 1000
      setRemaining(prev)
      setState('running')
      startTick()
      return prev
    })
  }, [])

  const addSeconds = useCallback((n: number) => {
    if (stateRef.current === 'running' && endTimeRef.current !== null) {
      endTimeRef.current += n * 1000
      const left = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000))
      setRemaining(left)
    } else if (stateRef.current === 'paused') {
      setRemaining((prev) => prev + n)
    }
  }, [])

  useEffect(() => {
    return () => clearTick()
  }, [])

  const pct = total > 0 ? remaining / total : 0

  return { state, remaining, total, pct, start, pause, resume, stop, restart, addSeconds }
}
