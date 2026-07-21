import { detectDeviceTier } from './detect'
import type { ShadowQuality } from '../store/roomStore'

/** Resolve `auto` against the current device. */
export function resolveShadowQuality(
  quality: ShadowQuality,
): Exclude<ShadowQuality, 'auto'> {
  if (quality !== 'auto') return quality
  return detectDeviceTier() === 'weak' ? 'low' : 'high'
}

/** Full Kenney OBJ only on high quality — elsewhere use tinted placeholders. */
export function useLiteFurniture(
  quality: ShadowQuality,
): boolean {
  return resolveShadowQuality(quality) !== 'high'
}

export function nextShadowQuality(q: ShadowQuality): ShadowQuality {
  if (q === 'auto') return 'high'
  if (q === 'high') return 'low'
  if (q === 'low') return 'off'
  return 'auto'
}

export function shadowQualityLabel(q: ShadowQuality): string {
  if (q === 'auto') return 'Auto'
  if (q === 'high') return 'Ombres ↑'
  if (q === 'low') return 'Ombres ↓'
  return 'Ombres off'
}

export function defaultShadowQuality(): ShadowQuality {
  return 'auto'
}
