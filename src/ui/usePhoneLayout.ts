import { useEffect, useState } from 'react'

const PHONE_MQ = '(max-width: 560px)'

function readPhoneLayout(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false
  }
  return window.matchMedia(PHONE_MQ).matches
}

/** True on narrow viewports (phones / small portrait). */
export function usePhoneLayout(): boolean {
  const [phone, setPhone] = useState(readPhoneLayout)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const mq = window.matchMedia(PHONE_MQ)
    const sync = () => setPhone(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  return phone
}

export function isPhoneViewport(): boolean {
  return readPhoneLayout()
}
