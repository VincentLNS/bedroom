/** Lightweight device tier for default graphics quality. */

export type DeviceTier = 'weak' | 'ok'

export function detectDeviceTier(): DeviceTier {
  if (typeof navigator === 'undefined') return 'ok'

  const nav = navigator as Navigator & {
    deviceMemory?: number
    connection?: { saveData?: boolean; effectiveType?: string }
  }

  if (nav.connection?.saveData) return 'weak'
  if (nav.deviceMemory != null && nav.deviceMemory <= 4) return 'weak'
  if ((navigator.hardwareConcurrency ?? 8) <= 2) return 'weak'

  const coarse =
    typeof matchMedia === 'function' &&
    matchMedia('(pointer: coarse)').matches
  if (coarse && (navigator.hardwareConcurrency ?? 8) <= 4) return 'weak'

  const slowNet =
    nav.connection?.effectiveType === '2g' ||
    nav.connection?.effectiveType === 'slow-2g'
  if (slowNet) return 'weak'

  return 'ok'
}
