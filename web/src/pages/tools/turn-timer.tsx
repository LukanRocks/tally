import { useEffect, useRef, useState } from 'react'
import { useTimer, TimerState } from '@/hooks/useTimer'
import { Button } from '@/components/1-atoms/button'
import { Plus, Minus } from 'lucide-react'

const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

function bgColor(pct: number): string {
  if (pct > 0.4) return 'bg-green-500'
  if (pct > 0.2) return 'bg-yellow-400'
  return 'bg-red-500'
}

interface TimerDisplayProps {
  remaining: number
  pct: number
  state: TimerState
  resetting: boolean
}

function TimerDisplay({ remaining, pct, state, resetting }: TimerDisplayProps) {
  const colorClass = state === 'expired' ? 'bg-red-500' : bgColor(pct)
  const fillHeight = state === 'expired' ? '100%' : `${(1 - pct) * 100}%`
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (state !== 'expired') {
      setVisible(true)
      return
    }
    const id = setInterval(() => setVisible((v) => !v), 500)
    return () => clearInterval(id)
  }, [state])

  return (
    <div className='relative h-full w-full'>
      <div
        className={`absolute top-0 left-0 w-full ${colorClass}`}
        style={{
          height: fillHeight,
          transition: resetting ? 'height 500ms ease, background-color 500ms' : 'height 1000ms linear, background-color 500ms',
        }}
      />
      <div className='relative z-10 flex h-full items-center justify-center'>
        <span className='text-[18vw] font-bold text-ink-primary tabular-nums drop-shadow-lg transition-opacity duration-100 select-none' style={{ opacity: visible ? 1 : 0 }}>
          {fmt(remaining)}
        </span>
      </div>
    </div>
  )
}

interface TimerControlsProps {
  state: TimerState
  onStop: () => void
  onRestart: () => void
  onPauseResume: () => void
  onAdd: (n: number) => void
}

function TimerControls({ state, onStop, onRestart, onPauseResume, onAdd }: TimerControlsProps) {
  const expired = state === 'expired'

  return (
    <div className='relative z-10 w-full space-y-2 p-4'>
      <div className='flex gap-2'>
        <Button color='secondary' className='flex-1' onClick={onStop}>
          Stop
        </Button>
        <Button color='secondary' className='flex-1' onClick={onRestart}>
          Restart
        </Button>
        <Button className='flex-1' onClick={onPauseResume}>
          {state === 'running' ? 'Pause' : 'Play'}
        </Button>
      </div>
      <div className='flex gap-2'>
        <Button variant='outline' className='flex-1' disabled={expired} onClick={() => onAdd(10)}>
          +10s
        </Button>
        <Button variant='outline' className='flex-1' disabled={expired} onClick={() => onAdd(30)}>
          +30s
        </Button>
        <Button variant='outline' className='flex-1' disabled={expired} onClick={() => onAdd(60)}>
          +60s
        </Button>
      </div>
    </div>
  )
}

const PRESETS = [
  { label: '30s', minutes: 0, seconds: 30 },
  { label: '1m', minutes: 1, seconds: 0 },
  { label: '2m', minutes: 2, seconds: 0 },
  { label: '5m', minutes: 5, seconds: 0 },
]

export default function TimerPage() {
  const timer = useTimer()
  const [minutes, setMinutes] = useState(1)
  const [seconds, setSeconds] = useState(0)
  const [resetting, setResetting] = useState(false)
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleStart = () => {
    const total = minutes * 60 + seconds
    if (total > 0) timer.start(total)
  }

  const handlePauseResume = () => {
    if (timer.state === 'running') timer.pause()
    else timer.resume()
  }

  const handleRestart = () => {
    if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current)
    setResetting(true)
    timer.restart()
    resetTimeoutRef.current = setTimeout(() => setResetting(false), 600)
  }

  if (timer.state === 'idle') {
    return (
      <div className='flex min-h-[calc(100vh-6rem)] flex-col items-center justify-center gap-6 p-6 md:min-h-screen'>
        <h1 className='text-2xl font-bold'>Turn Timer</h1>
        <div className='flex items-center gap-2'>
          <div className='flex flex-col items-center gap-1'>
            <Button color='secondary' className='w-20' onClick={() => setMinutes((m) => Math.min(99, m + 1))}>
              <Plus size={16} />
            </Button>
            <input
              type='number'
              min={0}
              max={99}
              value={minutes}
              onChange={(e) => setMinutes(Math.min(99, Math.max(0, Number(e.target.value))))}
              className='w-20 [appearance:textfield] rounded-lg border border-paper-muted bg-paper-primary p-2 text-center text-4xl font-bold tabular-nums focus:ring-2 focus:ring-primary focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
            />
            <Button color='secondary' className='w-20' onClick={() => setMinutes((m) => Math.max(0, m - 1))}>
              <Minus size={16} />
            </Button>
          </div>
          <span className='text-4xl font-bold'>:</span>
          <div className='flex flex-col items-center gap-1'>
            <Button color='secondary' className='w-20' onClick={() => setSeconds((s) => Math.min(59, s + 10))}>
              <Plus size={16} />
            </Button>
            <input
              type='text'
              inputMode='numeric'
              pattern='[0-9]*'
              value={String(seconds).padStart(2, '0')}
              onChange={(e) => setSeconds(Math.min(59, Math.max(0, Number(e.target.value))))}
              onKeyDown={(e) => {
                if (e.key === 'ArrowUp') {
                  e.preventDefault()
                  setSeconds((s) => Math.min(59, s + 1))
                }
                if (e.key === 'ArrowDown') {
                  e.preventDefault()
                  setSeconds((s) => Math.max(0, s - 1))
                }
              }}
              className='w-20 rounded-lg border border-paper-muted bg-paper-primary p-2 text-center text-4xl font-bold tabular-nums focus:ring-2 focus:ring-primary focus:outline-none'
            />
            <Button color='secondary' className='w-20' onClick={() => setSeconds((s) => Math.max(0, s - 10))}>
              <Minus size={16} />
            </Button>
          </div>
        </div>
        <div className='flex gap-2'>
          {PRESETS.map((p) => (
            <Button
              key={p.label}
              variant='outline'
              onClick={() => {
                setMinutes(p.minutes)
                setSeconds(p.seconds)
              }}
            >
              {p.label}
            </Button>
          ))}
        </div>
        <Button size='big' onClick={handleStart} disabled={minutes * 60 + seconds === 0}>
          Start
        </Button>
      </div>
    )
  }

  return (
    <div className='flex h-[calc(100vh-6rem)] flex-col gap-4 p-4 md:h-screen'>
      <div className='flex-1 overflow-hidden rounded-2xl'>
        <TimerDisplay remaining={timer.remaining} pct={timer.pct} state={timer.state} resetting={resetting} />
      </div>
      <TimerControls state={timer.state} onStop={timer.stop} onRestart={handleRestart} onPauseResume={handlePauseResume} onAdd={timer.addSeconds} />
    </div>
  )
}
