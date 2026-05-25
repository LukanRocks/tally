export const componentColorKeys = [
  // Medals
  'gold',
  'silver',
  'bronze',

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
