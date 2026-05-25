export const componentColorKeys = [
  // Medals
  'gold',
  'silver',
  'bronze',

  // Session
  'win',
  'loss',
  'tie',

  // Player status
  'owned',
  'borrowed',
  'rented',

  // Feedback
  'success',
  'warning',
  'info',
  'destructive',

  // Neutral
  'primary',
  'secondary',
] as const

export type ComponentColor = (typeof componentColorKeys)[number]
