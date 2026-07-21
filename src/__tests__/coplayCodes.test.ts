import { describe, expect, it } from 'vitest'
import {
  displayCodeFromPeerId,
  generateSalonCode,
  toPeerId,
} from '../coplay/session'

describe('coplay short codes', () => {
  it('generates 4-char codes without ambiguous characters', () => {
    for (let i = 0; i < 40; i++) {
      const code = generateSalonCode()
      expect(code).toHaveLength(4)
      expect(code).toMatch(/^[2-9A-HJ-NP-Z]{4}$/)
    }
  })

  it('normalizes short codes and legacy peer ids', () => {
    expect(toPeerId('ab2c')).toBe('md-AB2C')
    expect(toPeerId('AB2C')).toBe('md-AB2C')
    expect(toPeerId('md-xy9k')).toBe('md-XY9K')
    expect(toPeerId('  md-AB2C  ')).toBe('md-AB2C')
    expect(toPeerId('legacy-uuid-style-id')).toBe('legacy-uuid-style-id')
    expect(toPeerId('')).toBe('')
  })

  it('displays kid-facing short code from peer id', () => {
    expect(displayCodeFromPeerId('md-AB2C')).toBe('AB2C')
    expect(displayCodeFromPeerId('md-ab2c')).toBe('AB2C')
    expect(displayCodeFromPeerId('long-legacy-id')).toBe('long-legacy-id')
  })
})
