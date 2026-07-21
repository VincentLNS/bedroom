import { describe, expect, it, vi, afterEach } from 'vitest'
import { isPhoneViewport } from '../ui/usePhoneLayout'

describe('usePhoneLayout', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('detects narrow phone viewports', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query.includes('max-width: 560px'),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }))
    expect(isPhoneViewport()).toBe(true)
  })

  it('is false on wide screens', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: false,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }))
    expect(isPhoneViewport()).toBe(false)
  })
})
