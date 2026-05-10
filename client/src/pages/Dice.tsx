import { useEffect, useRef, useState } from 'react'
import { Button } from '@/shadcn/components/ui/button'
import { Plus, Minus } from 'lucide-react'

type Phase = 'setup' | 'rolling' | 'results'

const SIDE_PRESETS = [2, 4, 6, 8, 10, 12, 20, 100]

const ANIMATION_DURATION = 1800
const FAST_INTERVAL = 50
const SLOW_INTERVAL = 400

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 2)
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function rollDie(faces: number): number {
  return Math.floor(Math.random() * faces) + 1
}

function generateResults(faces: number, count: number): number[] {
  return Array.from({ length: count }, () => rollDie(faces))
}

function total(results: number[]): number {
  return results.reduce((sum, r) => sum + r, 0)
}

function getGridCols(count: number): string {
  if (count === 1) return 'grid-cols-1 max-w-[160px] mx-auto'
  if (count <= 4) return 'grid-cols-2'
  if (count <= 6) return 'grid-cols-3'
  return 'grid-cols-4'
}

interface DieCellProps {
  value: number
  animating?: boolean
}

function DieCell({ value, animating }: DieCellProps) {
  return (
    <div className={`rounded-xl border border-border bg-card flex items-center justify-center aspect-square text-2xl font-bold tabular-nums${animating ? ' animate-pulse' : ''}`}>
      {value}
    </div>
  )
}

interface DiceGridProps {
  displayValues: number[]
  animating?: boolean
}

function DiceGrid({ displayValues, animating }: DiceGridProps) {
  return (
    <div className='w-full max-w-sm mx-auto'>
      <div className={`grid gap-2 ${getGridCols(displayValues.length)}`}>
        {displayValues.map((v, i) => (
          <DieCell key={i} value={v} animating={animating} />
        ))}
      </div>
    </div>
  )
}

const inputClass = 'w-20 rounded-lg border border-border bg-background p-2 text-center text-4xl font-bold tabular-nums focus:ring-2 focus:ring-primary focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'

interface SetupViewProps {
  count: number
  sides: number
  onCountChange: (n: number) => void
  onSidesChange: (n: number) => void
  onRoll: () => void
}

function SetupView({ count, sides, onCountChange, onSidesChange, onRoll }: SetupViewProps) {
  return (
    <div className='flex min-h-[calc(100vh-6rem)] flex-col items-center justify-center gap-6 p-6 md:min-h-screen'>
      <h1 className='text-2xl font-bold'>Dice Roller</h1>
      <div className='flex items-center gap-2'>
        <div className='flex flex-col items-center gap-1'>
          <Button variant='secondary' className='w-20' onClick={() => onCountChange(Math.min(10, count + 1))}>
            <Plus size={16} />
          </Button>
          <input
            type='number'
            min={1}
            max={10}
            value={count}
            onChange={(e) => onCountChange(Math.min(10, Math.max(1, Number(e.target.value))))}
            className={inputClass}
          />
          <Button variant='secondary' className='w-20' onClick={() => onCountChange(Math.max(1, count - 1))}>
            <Minus size={16} />
          </Button>
        </div>
        <span className='text-4xl font-bold'>d</span>
        <div className='flex flex-col items-center gap-1'>
          <Button variant='secondary' className='w-20' onClick={() => onSidesChange(Math.min(999, sides + 1))}>
            <Plus size={16} />
          </Button>
          <input
            type='number'
            min={2}
            max={999}
            value={sides}
            onChange={(e) => onSidesChange(Math.min(999, Math.max(2, Number(e.target.value))))}
            className={inputClass}
          />
          <Button variant='secondary' className='w-20' onClick={() => onSidesChange(Math.max(2, sides - 1))}>
            <Minus size={16} />
          </Button>
        </div>
      </div>
      <div className='flex flex-wrap justify-center gap-2'>
        {SIDE_PRESETS.map((n) => (
          <Button key={n} variant='outline' onClick={() => onSidesChange(n)}>
            d{n}
          </Button>
        ))}
      </div>
      <Button size='lg' onClick={onRoll} disabled={count < 1 || sides < 2}>
        Roll
      </Button>
    </div>
  )
}

function RollingView({ displayValues }: { displayValues: number[] }) {
  return (
    <div className='flex min-h-[calc(100vh-6rem)] flex-col items-center justify-center gap-6 p-6 md:min-h-screen'>
      <DiceGrid displayValues={displayValues} animating />
    </div>
  )
}

interface ResultsViewProps {
  results: number[]
  onRollAgain: () => void
  onNewRoll: () => void
}

function ResultsView({ results, onRollAgain, onNewRoll }: ResultsViewProps) {
  return (
    <div className='flex min-h-[calc(100vh-6rem)] flex-col items-center justify-center gap-6 p-6 md:min-h-screen'>
      <DiceGrid displayValues={results} />
      <p className='text-[min(20vw,8rem)] font-bold tabular-nums leading-none'>{total(results)}</p>
      <div className='flex flex-col gap-3 w-full max-w-xs'>
        <Button size='lg' onClick={onRollAgain}>Roll Again</Button>
        <Button size='lg' variant='outline' onClick={onNewRoll}>New Roll</Button>
      </div>
    </div>
  )
}

export default function DicePage() {
  const [phase, setPhase] = useState<Phase>('setup')
  const [count, setCount] = useState<number>(1)
  const [sides, setSides] = useState<number>(6)
  const [displayValues, setDisplayValues] = useState<number[]>([])
  const [results, setResults] = useState<number[]>([])
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  function startRolling() {
    if (intervalRef.current) clearInterval(intervalRef.current)

    const finalResults = generateResults(sides, count)

    setResults(finalResults)
    setDisplayValues(Array(count).fill(1))
    setPhase('rolling')

    const startTime = Date.now()
    let lastDisplayUpdate = 0

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const t = Math.min(elapsed / ANIMATION_DURATION, 1)

      if (t >= 1) {
        clearInterval(intervalRef.current!)
        setDisplayValues(finalResults)
        setPhase('results')
        return
      }

      const throttleMs = lerp(FAST_INTERVAL, SLOW_INTERVAL, easeOut(t))
      const now = Date.now()

      if (now - lastDisplayUpdate >= throttleMs) {
        lastDisplayUpdate = now
        setDisplayValues(Array(count).fill(0).map(() => rollDie(sides)))
      }
    }, 16)
  }

  return (
    <>
      {phase === 'setup' && (
        <SetupView
          count={count}
          sides={sides}
          onCountChange={setCount}
          onSidesChange={setSides}
          onRoll={startRolling}
        />
      )}
      {phase === 'rolling' && <RollingView displayValues={displayValues} />}
      {phase === 'results' && (
        <ResultsView
          results={results}
          onRollAgain={startRolling}
          onNewRoll={() => setPhase('setup')}
        />
      )}
    </>
  )
}
