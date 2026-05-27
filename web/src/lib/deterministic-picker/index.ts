import bg0 from './backgrounds/bg-0.svg'
import bg1 from './backgrounds/bg-1.svg'
import bg2 from './backgrounds/bg-2.svg'
import bg3 from './backgrounds/bg-3.svg'
import bg4 from './backgrounds/bg-4.svg'
import bg5 from './backgrounds/bg-5.svg'
import bg6 from './backgrounds/bg-6.svg'
import bg7 from './backgrounds/bg-7.svg'
import bg8 from './backgrounds/bg-8.svg'
import bg9 from './backgrounds/bg-9.svg'
import bg10 from './backgrounds/bg-10.svg'
import bg11 from './backgrounds/bg-11.svg'

export const FALLBACK_BACKGROUNDS = [bg0, bg1, bg2, bg3, bg4, bg5, bg6, bg7, bg8, bg9, bg10, bg11]
export const PLAYER_COLOR_KEYS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'] as const

export const useDeterministicPick = <T>(items: readonly T[], id: number): T => items[id % items.length]

export const getPlayerColor = (id: number): string => `var(--player-${useDeterministicPick(PLAYER_COLOR_KEYS, id)})`
export const getFallbackBackground = (id: number): string => `var(--player-${useDeterministicPick(FALLBACK_BACKGROUNDS, id)})`
