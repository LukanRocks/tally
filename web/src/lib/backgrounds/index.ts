import bg0 from './bg-0.svg'
import bg1 from './bg-1.svg'
import bg2 from './bg-2.svg'
import bg3 from './bg-3.svg'
import bg4 from './bg-4.svg'
import bg5 from './bg-5.svg'
import bg6 from './bg-6.svg'
import bg7 from './bg-7.svg'
import bg8 from './bg-8.svg'
import bg9 from './bg-9.svg'
import bg10 from './bg-10.svg'
import bg11 from './bg-11.svg'

const backgrounds = [bg0, bg1, bg2, bg3, bg4, bg5, bg6, bg7, bg8, bg9, bg10, bg11]

export const getBackgroundFallback = (gameId: number): string => backgrounds[gameId % backgrounds.length]
