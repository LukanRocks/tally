import { useSyncExternalStore } from 'react'

const MOBILE_WIDTH = 767
const MEDIA_QUERY = window.matchMedia(`(max-width: ${MOBILE_WIDTH}px)`)

const subscribe = (cb: () => void) => {
  MEDIA_QUERY.addEventListener('change', cb)

  return () => MEDIA_QUERY.removeEventListener('change', cb)
}

export const useIsMobile = () => {
  return useSyncExternalStore(subscribe, () => MEDIA_QUERY.matches)
}
