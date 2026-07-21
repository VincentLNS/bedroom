/** Soft haptic + audio feedback for placement snaps, challenges, ambient. */

import { useRoomStore } from '../store/roomStore'

export function softHaptic(ms = 10) {
  try {
    navigator.vibrate?.(ms)
  } catch {
    /* unsupported */
  }
}

let audioCtx: AudioContext | null = null

function getAudioCtx(): AudioContext | null {
  try {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    if (!AC) return null
    if (!audioCtx) audioCtx = new AC()
    return audioCtx
  } catch {
    return null
  }
}

function soundsAllowed(): boolean {
  try {
    return useRoomStore.getState().soundOn
  } catch {
    return true
  }
}

/** Short pleasant blip — optional, fails silently. */
export function playSnapSound(ok = true) {
  if (!soundsAllowed()) return
  const ctx = getAudioCtx()
  if (!ctx) return
  if (ctx.state === 'suspended') void ctx.resume()

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.value = ok ? 660 : 220
  gain.gain.value = 0.0001
  osc.connect(gain)
  gain.connect(ctx.destination)

  const now = ctx.currentTime
  gain.gain.exponentialRampToValueAtTime(0.08, now + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + (ok ? 0.12 : 0.18))
  osc.start(now)
  osc.stop(now + 0.2)
}

/** Little star fanfare when a challenge completes. */
export function playChallengeFanfare() {
  if (!soundsAllowed()) return
  const ctx = getAudioCtx()
  if (!ctx) return
  if (ctx.state === 'suspended') void ctx.resume()

  const notes = [523.25, 659.25, 783.99, 1046.5]
  const now = ctx.currentTime
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.value = freq
    gain.gain.value = 0.0001
    osc.connect(gain)
    gain.connect(ctx.destination)
    const t0 = now + i * 0.09
    gain.gain.exponentialRampToValueAtTime(0.07, t0 + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.28)
    osc.start(t0)
    osc.stop(t0 + 0.32)
  })
  softHaptic(14)
}

export function feedbackPlaceOk() {
  softHaptic(10)
  playSnapSound(true)
}

export function feedbackPlaceBad() {
  softHaptic(18)
  playSnapSound(false)
}

/* ── Soft ambient pad (no external assets) ───────────────── */

let ambientNodes: {
  master: GainNode
  oscillators: OscillatorNode[]
  lfo: OscillatorNode
  timer?: ReturnType<typeof setInterval>
} | null = null

const AMBIENT_NOTES = [196, 246.94, 293.66, 392] // G3 A3 D4 G4

export function startAmbientMusic() {
  stopAmbientMusic()
  const ctx = getAudioCtx()
  if (!ctx) return
  if (ctx.state === 'suspended') void ctx.resume()

  const master = ctx.createGain()
  master.gain.value = 0.0001
  master.connect(ctx.destination)

  const oscillators: OscillatorNode[] = []
  AMBIENT_NOTES.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = i % 2 === 0 ? 'sine' : 'triangle'
    osc.frequency.value = freq
    g.gain.value = 0.035
    osc.connect(g)
    g.connect(master)
    osc.start()
    oscillators.push(osc)
  })

  const lfo = ctx.createOscillator()
  const lfoGain = ctx.createGain()
  lfo.frequency.value = 0.08
  lfoGain.gain.value = 0.012
  lfo.connect(lfoGain)
  lfoGain.connect(master.gain)
  lfo.start()

  const now = ctx.currentTime
  master.gain.exponentialRampToValueAtTime(0.045, now + 1.8)

  // Gentle arpeggio tick every few seconds
  const timer = setInterval(() => {
    if (!soundsAllowed() || !useRoomStore.getState().musicOn) return
    const c = getAudioCtx()
    if (!c || !ambientNodes) return
    const note = AMBIENT_NOTES[Math.floor(Math.random() * AMBIENT_NOTES.length)]
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.type = 'sine'
    osc.frequency.value = note * 2
    g.gain.value = 0.0001
    osc.connect(g)
    g.connect(ambientNodes.master)
    const t = c.currentTime
    g.gain.exponentialRampToValueAtTime(0.028, t + 0.05)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4)
    osc.start(t)
    osc.stop(t + 1.5)
  }, 4200)

  ambientNodes = { master, oscillators, lfo, timer }
}

export function stopAmbientMusic() {
  if (!ambientNodes) return
  const { master, oscillators, lfo, timer } = ambientNodes
  ambientNodes = null
  if (timer) clearInterval(timer)
  const ctx = getAudioCtx()
  const now = ctx?.currentTime ?? 0
  try {
    master.gain.cancelScheduledValues(now)
    master.gain.exponentialRampToValueAtTime(0.0001, now + 0.6)
  } catch {
    /* ignore */
  }
  window.setTimeout(() => {
    oscillators.forEach((o) => {
      try {
        o.stop()
      } catch {
        /* ignore */
      }
    })
    try {
      lfo.stop()
    } catch {
      /* ignore */
    }
  }, 700)
}

export function syncAmbientMusic(musicOn: boolean) {
  if (musicOn) startAmbientMusic()
  else stopAmbientMusic()
}
