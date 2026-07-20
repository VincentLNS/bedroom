/** Soft haptic + audio feedback for placement snaps. */

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

/** Short pleasant blip — optional, fails silently. */
export function playSnapSound(ok = true) {
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

export function feedbackPlaceOk() {
  softHaptic(10)
  playSnapSound(true)
}

export function feedbackPlaceBad() {
  softHaptic(18)
  playSnapSound(false)
}
