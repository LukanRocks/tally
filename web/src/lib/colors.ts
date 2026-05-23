export const componentColorKeys = [
  // Medals
  'gold',
  'silver',
  'bronze',

  // Player status
  'self',
  'friend',
  'store',

  // Feedback
  'success',
  'warning',
  'info',
  'destructive',

  // Neutral
  'primary',
] as const

export type ComponentColor = (typeof componentColorKeys)[number]
