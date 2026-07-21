import { useEffect, useState } from 'react'
import {
  getCoPlaySnapshot,
  subscribeCoPlay,
  type CoPlaySnapshot,
} from './session'

/** React hook for Co-déco presence (TopBar chip, modal). */
export function useCoPlayPresence(): CoPlaySnapshot {
  const [snap, setSnap] = useState(getCoPlaySnapshot)
  useEffect(() => subscribeCoPlay(setSnap), [])
  return snap
}
