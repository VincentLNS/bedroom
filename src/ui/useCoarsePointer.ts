import { useEffect, useState } from 'react'

function readCoarsePointer(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false
  }
  return window.matchMedia('(pointer: coarse)').matches
}

/** True on touch-first devices (tablets / phones). */
export function useCoarsePointer(): boolean {
  const [coarse, setCoarse] = useState(readCoarsePointer)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const mq = window.matchMedia('(pointer: coarse)')
    const sync = () => setCoarse(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  return coarse
}
