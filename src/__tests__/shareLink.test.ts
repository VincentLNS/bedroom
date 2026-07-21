import { describe, expect, it } from 'vitest'
import { serializeLayout } from '../persist'
import {
  decodeShareToken,
  encodeShareToken,
} from '../persist/shareLink'
import { createLouiseLayout } from '../presets/louise'
import { fileToPlacedItems } from '../persist'

describe('shareLink', () => {
  it('round-trips a Louise layout', async () => {
    const file = serializeLayout(createLouiseLayout())
    const token = await encodeShareToken(file)
    expect(token.startsWith('z') || token.startsWith('j')).toBe(true)
    const decoded = await decodeShareToken(token)
    expect(decoded.ok).toBe(true)
    if (!decoded.ok) return
    expect(decoded.file.items.length).toBe(file.items.length)
    expect(fileToPlacedItems(decoded.file).map((i) => i.catalogId)).toEqual(
      fileToPlacedItems(file).map((i) => i.catalogId),
    )
  })
})
