import { describe, expect, it } from 'vitest'
import { parseLayout, serializeLayout } from '../persist'

describe('persist', () => {
  it('round-trips a layout', () => {
    const file = serializeLayout([
      {
        instanceId: 'a',
        catalogId: 'bed-louise',
        cx: 2,
        cz: 3,
        rot: 90,
      },
    ])
    expect(file.version).toBe(1)
    expect(file.roomId).toBe('girl-bedroom-v1')
    expect(file.items[0]).toEqual({
      instanceId: 'a',
      catalogId: 'bed-louise',
      x: 2,
      z: 3,
      rot: 90,
    })
    const parsed = parseLayout(file)
    expect(parsed.ok).toBe(true)
    if (parsed.ok) {
      expect(parsed.file.items[0].x).toBe(2)
    }
  })

  it('rejects wrong version', () => {
    const parsed = parseLayout({
      version: 99,
      roomId: 'girl-bedroom-v1',
      items: [],
    })
    expect(parsed.ok).toBe(false)
  })

  it('rejects non-objects', () => {
    expect(parseLayout(null).ok).toBe(false)
    expect(parseLayout('nope').ok).toBe(false)
  })
})
