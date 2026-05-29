import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/1-atoms/button'
import { PROMPTS, type Prompt } from '@/lib/prompts'

type Phase = 'idle' | 'animating' | 'revealed'

function pick(): Prompt {
  return PROMPTS[Math.floor(Math.random() * PROMPTS.length)]
}

export default function FirstPlayerPage() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [displayText, setDisplayText] = useState<string>('')
  const [finalPrompt, setFinalPrompt] = useState<Prompt | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  function startAnimation(result: Prompt) {
    setFinalPrompt(result)
    setPhase('animating')

    intervalRef.current = setInterval(() => {
      setDisplayText(pick().prompt)
    }, 60)

    setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current)

      setDisplayText(result.prompt)
      setPhase('revealed')
    }, 2000)
  }

  function handleDraw() {
    startAnimation(pick())
  }

  if (phase === 'idle') {
    return (
      <div className='flex min-h-[calc(100vh-6rem)] flex-col items-center justify-center gap-6 p-6 md:min-h-screen'>
        <h1 className='text-2xl font-bold'>Who Goes First?</h1>
        <p className='text-sm text-muted-foreground'>Draw a prompt — whoever it fits goes first</p>
        <Button size='big' onClick={handleDraw}>
          Draw
        </Button>
      </div>
    )
  }

  return (
    <div className='flex min-h-[calc(100vh-6rem)] flex-col items-center justify-center gap-8 p-6 md:min-h-screen'>
      <div className='flex flex-col items-center justify-center gap-4 px-4'>
        {phase === 'revealed' && finalPrompt && <span className='rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary capitalize'>{finalPrompt.category}</span>}
        <p className='text-center text-4xl font-bold'>{displayText}</p>
      </div>
      {phase === 'revealed' && (
        <Button size='big' onClick={handleDraw}>
          Re-roll
        </Button>
      )}
    </div>
  )
}
