import { describe, expect, it, vi, afterEach } from 'vitest'
import {
  nextShadowQuality,
  resolveShadowQuality,
  shadowQualityLabel,
  useLiteFurniture,
} from '../perf/quality'

describe('perf quality', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('cycles auto → high → low → off → auto', () => {
    expect(nextShadowQuality('auto')).toBe('high')
    expect(nextShadowQuality('high')).toBe('low')
    expect(nextShadowQuality('low')).toBe('off')
    expect(nextShadowQuality('off')).toBe('auto')
  })

  it('resolves explicit qualities unchanged', () => {
    expect(resolveShadowQuality('high')).toBe('high')
    expect(resolveShadowQuality('low')).toBe('low')
    expect(resolveShadowQuality('off')).toBe('off')
  })

  it('auto picks low on weak devices', () => {
    vi.stubGlobal('navigator', {
      hardwareConcurrency: 2,
      deviceMemory: 2,
      connection: { saveData: false },
    })
    vi.stubGlobal('matchMedia', () => ({ matches: true }))
    expect(resolveShadowQuality('auto')).toBe('low')
    expect(useLiteFurniture('auto')).toBe(true)
  })

  it('labels stay short for the top bar', () => {
    expect(shadowQualityLabel('auto')).toBe('Auto')
    expect(shadowQualityLabel('off')).toContain('off')
  })
})
