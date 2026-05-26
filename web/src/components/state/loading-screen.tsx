import { useState } from 'react'

const PHRASES = [
  'ROLLING DICE',
  'SHUFFLING THE DECK',
  'COUNTING POINTS',
  'SETTING THE BOARD',
  'DEALING IN',
  'LAYING THE TILES',
  'MARKING THE SCORE',
  'DRAWING A CARD',
  'PICKING UP PIECES',
  'FINDING A SEAT',
  'READING THE RULES',
  'CLAIMING THE FIRST MOVE',
  'FLIPPING THE HOURGLASS',
  'CHECKING THE STANDINGS',
  'OPENING THE BOX',
  'LINING UP THE PAWNS',
  'PLACING YOUR BET',
  'SORTING THE MEEPLES',
  'COUNTING TOKENS',
  'STACKING THE CHIPS',
  'CLAIMING A TERRITORY',
  'DRAWING FROM THE PILE',
  'WARMING THE BENCH',
  'FILLING THE COFFERS',
  'SPINNING THE WHEEL',
  'GATHERING ROUND',
  'CLEARING THE TABLE',
  'FINDING THE RULEBOOK',
  'POLISHING THE DICE',
  'SEATING THE PLAYERS',
  'CUTTING THE DECK',
  'TRACKING THE SCORE',
  'TAKING INVENTORY',
  'CALLING ALL PLAYERS',
]

export const Loading = () => {
  const [phrase] = useState(() => PHRASES[Math.floor(Math.random() * PHRASES.length)])

  return (
    <div className='flex min-h-screen flex-col items-center justify-center gap-6 bg-background'>
      <img src='/logo-paper.svg' width={180} height={180} className='hidden dark:block' />
      <img src='/logo-ink.svg' width={180} height={180} className='dark:hidden' />

      <div className='flex flex-col items-center gap-1'>
        <p className='callout text-5xl text-foreground'>Tally</p>
      </div>

      <div className='w-56 border-t border-dashed border-border' />

      <p className='caption flex items-center gap-2 text-muted-foreground'>
        {phrase}
        <span className='flex gap-1'>
          {[0, 1, 2].map((i) => (
            <span key={i} className='size-1.5 animate-pulse rounded-full bg-current' style={{ animationDelay: `${i * 200}ms` }} />
          ))}
        </span>
      </p>
    </div>
  )
}
