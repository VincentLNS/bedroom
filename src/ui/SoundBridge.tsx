import { useEffect } from 'react'
import { useRoomStore } from '../store/roomStore'
import {
  playChallengeFanfare,
  syncAmbientMusic,
} from './feedback'

/** Wires store events → SFX / ambient music. */
export function SoundBridge() {
  const musicOn = useRoomStore((s) => s.musicOn)

  useEffect(() => {
    syncAmbientMusic(musicOn)
    return () => syncAmbientMusic(false)
  }, [musicOn])

  useEffect(() => {
    return useRoomStore.subscribe((state, prev) => {
      if (state.challengesDone.length > prev.challengesDone.length) {
        playChallengeFanfare()
      }
    })
  }, [])

  return null
}
