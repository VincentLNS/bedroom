/** Soft haptic + richer WebAudio feedback (no external assets). */

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

function resume(ctx: AudioContext) {
  if (ctx.state === 'suspended') void ctx.resume()
}

/** Soft filtered noise puff — woodblock-ish. */
function playNoisePuff(
  ctx: AudioContext,
  dest: AudioNode,
  t0: number,
  duration: number,
  gainPeak: number,
) {
  const frames = Math.max(1, Math.floor(ctx.sampleRate * duration))
  const buffer = ctx.createBuffer(1, frames, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < frames; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / frames)
  }
  const src = ctx.createBufferSource()
  src.buffer = buffer
  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 900
  filter.Q.value = 1.2
  const gain = ctx.createGain()
  gain.gain.value = 0.0001
  src.connect(filter)
  filter.connect(gain)
  gain.connect(dest)
  gain.gain.exponentialRampToValueAtTime(gainPeak, t0 + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  src.start(t0)
  src.stop(t0 + duration + 0.02)
}

function playTone(
  ctx: AudioContext,
  dest: AudioNode,
  t0: number,
  freq: number,
  duration: number,
  type: OscillatorType,
  peak: number,
) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.value = freq
  gain.gain.value = 0.0001
  osc.connect(gain)
  gain.connect(dest)
  gain.gain.exponentialRampToValueAtTime(peak, t0 + 0.018)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  osc.start(t0)
  osc.stop(t0 + duration + 0.02)
}

/** Pleasant place / reject blip. */
export function playSnapSound(ok = true) {
  if (!soundsAllowed()) return
  const ctx = getAudioCtx()
  if (!ctx) return
  resume(ctx)

  const master = ctx.createGain()
  master.gain.value = 0.9
  master.connect(ctx.destination)
  const now = ctx.currentTime

  if (ok) {
    playNoisePuff(ctx, master, now, 0.08, 0.045)
    playTone(ctx, master, now, 523.25, 0.1, 'triangle', 0.06)
    playTone(ctx, master, now + 0.05, 783.99, 0.14, 'sine', 0.05)
  } else {
    playNoisePuff(ctx, master, now, 0.12, 0.05)
    playTone(ctx, master, now, 196, 0.16, 'sawtooth', 0.035)
    playTone(ctx, master, now + 0.04, 155.56, 0.18, 'triangle', 0.04)
  }
}

/** Little star fanfare when a challenge completes. */
export function playChallengeFanfare() {
  if (!soundsAllowed()) return
  const ctx = getAudioCtx()
  if (!ctx) return
  resume(ctx)

  const master = ctx.createGain()
  master.gain.value = 0.85
  master.connect(ctx.destination)

  // Soft delay for sparkle
  const delay = ctx.createDelay(0.4)
  delay.delayTime.value = 0.12
  const delayGain = ctx.createGain()
  delayGain.gain.value = 0.28
  delay.connect(delayGain)
  delayGain.connect(master)

  const notes = [
    { f: 523.25, t: 0 },
    { f: 659.25, t: 0.08 },
    { f: 783.99, t: 0.16 },
    { f: 1046.5, t: 0.26 },
    { f: 1318.5, t: 0.38 },
  ]
  const now = ctx.currentTime
  notes.forEach(({ f, t }) => {
    playTone(ctx, master, now + t, f, 0.28, 'triangle', 0.055)
    playTone(ctx, delay, now + t, f * 2, 0.22, 'sine', 0.025)
  })
  playNoisePuff(ctx, master, now + 0.38, 0.15, 0.03)
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
  filter: BiquadFilterNode
  lfo: OscillatorNode
  timer?: ReturnType<typeof setInterval>
} | null = null

const AMBIENT_NOTES = [196, 233.08, 293.66, 349.23, 392] // G Bb D F G

export function startAmbientMusic() {
  stopAmbientMusic()
  const ctx = getAudioCtx()
  if (!ctx) return
  resume(ctx)

  const master = ctx.createGain()
  master.gain.value = 0.0001
  master.connect(ctx.destination)

  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 900
  filter.Q.value = 0.6
  filter.connect(master)

  const oscillators: OscillatorNode[] = []
  AMBIENT_NOTES.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = i % 2 === 0 ? 'sine' : 'triangle'
    osc.frequency.value = freq
    g.gain.value = 0.028 - i * 0.003
    osc.connect(g)
    g.connect(filter)
    osc.start()
    oscillators.push(osc)
  })

  const lfo = ctx.createOscillator()
  const lfoGain = ctx.createGain()
  lfo.type = 'sine'
  lfo.frequency.value = 0.07
  lfoGain.gain.value = 180
  lfo.connect(lfoGain)
  lfoGain.connect(filter.frequency)
  lfo.start()

  const now = ctx.currentTime
  master.gain.exponentialRampToValueAtTime(0.038, now + 2.2)

  const timer = setInterval(() => {
    if (!soundsAllowed() || !useRoomStore.getState().musicOn) return
    const c = getAudioCtx()
    if (!c || !ambientNodes) return
    const note =
      AMBIENT_NOTES[Math.floor(Math.random() * AMBIENT_NOTES.length)] *
      (Math.random() > 0.55 ? 2 : 1)
    playTone(c, ambientNodes.filter, c.currentTime, note, 1.6, 'sine', 0.022)
  }, 4800)

  ambientNodes = { master, oscillators, filter, lfo, timer }
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
    master.gain.exponentialRampToValueAtTime(0.0001, now + 0.7)
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
  }, 800)
}

export function syncAmbientMusic(musicOn: boolean) {
  if (musicOn) startAmbientMusic()
  else stopAmbientMusic()
}
