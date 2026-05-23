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
    // !todo import the logo component that auto switch the theme
    <div className='flex min-h-screen flex-col items-center justify-center gap-6 bg-background'>
      <svg width='180' height='180' viewBox='0 0 1000 1000' xmlns='http://www.w3.org/2000/svg' style={{ fillRule: 'evenodd', clipRule: 'evenodd' }}>
        <path
          d='M1000.333,218.562l0,562.875c0,120.812 -98.084,218.896 -218.896,218.896l-562.875,0c-120.812,0 -218.896,-98.084 -218.896,-218.896l0,-562.875c0,-120.812 98.084,-218.896 218.896,-218.896l562.875,0c120.812,0 218.896,98.084 218.896,218.896Z'
          fill='#1a1a1a'
        />
        <path
          d='M328.01,273.286l0,453.427c0,12.944 -10.509,23.453 -23.453,23.453l-31.271,0c-12.944,0 -23.453,-10.509 -23.453,-23.453l0,-453.427c0,-12.944 10.509,-23.453 23.453,-23.453l31.271,0c12.944,0 23.453,10.509 23.453,23.453Z'
          fill='#faf7ee'
        />
        <path
          d='M468.729,273.286l0,453.427c0,12.944 -10.509,23.453 -23.453,23.453l-31.271,0c-12.944,0 -23.453,-10.509 -23.453,-23.453l0,-453.427c0,-12.944 10.509,-23.453 23.453,-23.453l31.271,0c12.944,0 23.453,10.509 23.453,23.453Z'
          fill='#faf7ee'
        />
        <path
          d='M609.448,273.286l0,453.427c0,12.944 -10.509,23.453 -23.453,23.453l-31.271,0c-12.944,0 -23.453,-10.509 -23.453,-23.453l0,-453.427c0,-12.944 10.509,-23.453 23.453,-23.453l31.271,0c12.944,0 23.453,10.509 23.453,23.453Z'
          fill='#faf7ee'
        />
        <path
          d='M750.167,273.286l0,453.427c0,12.944 -10.509,23.453 -23.453,23.453l-31.271,0c-12.944,0 -23.453,-10.509 -23.453,-23.453l0,-453.427c0,-12.944 10.509,-23.453 23.453,-23.453l31.271,0c12.944,0 23.453,10.509 23.453,23.453Z'
          fill='#faf7ee'
        />
        <path d='M163.839,765.802l672.323,-531.604' fill='none' stroke='#f7c24a' strokeWidth='93.81' strokeLinecap='round' />
      </svg>

      <div className='flex flex-col items-center gap-1'>
        <p className='callout text-5xl text-foreground'>Tally</p>
      </div>

      <div className='w-56 border-t border-dashed border-border' />

      <p className='eyebrow flex items-center gap-2 text-muted-foreground'>
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
