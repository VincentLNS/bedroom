import { detectDeviceTier } from './detect'
import type { ShadowQuality } from '../store/roomStore'

/** Resolve `auto` against the current device. */
export function resolveShadowQuality(
  quality: ShadowQuality,
): Exclude<ShadowQuality, 'auto'> {
  if (quality !== 'auto') return quality
  return detectDeviceTier() === 'weak' ? 'low' : 'high'
}

/**
 * Extreme lite: tinted boxes instead of Kenney OBJ.
 * Only when shadows are fully off — Auto/low still load Kenney (lighter shadows).
 */
export function useLiteFurniture(quality: ShadowQuality): boolean {
  return resolveShadowQuality(quality) === 'off'
}

/** Cast/receive shadows on furniture meshes (high only — Auto→high on strong devices). */
export function furnitureCastShadow(quality: ShadowQuality): boolean {
  return resolveShadowQuality(quality) === 'high'
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
