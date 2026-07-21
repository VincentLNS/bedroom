import { describe, expect, it } from 'vitest'
import { createLouiseLayout } from '../presets/louise'
import {
  fileToPlacedItems,
  serializeHouseFromState,
  serializeLayout,
} from '../persist'
import {
  decodeShareToken,
  encodeShareToken,
} from '../persist/shareLink'
import { emptyHouseRooms } from '../house/rooms'

describe('shareLink', () => {
  it('round-trips a Louise room and migrates to house', async () => {
    const file = serializeLayout(createLouiseLayout())
    const token = await encodeShareToken(file)
    expect(token.startsWith('z') || token.startsWith('j')).toBe(true)
    const decoded = await decodeShareToken(token)
    expect(decoded.ok).toBe(true)
    if (!decoded.ok) return
    expect(decoded.kind).toBe('room')
    expect(decoded.file.version).toBe(2)
    expect(decoded.file.rooms.bedroom.length).toBe(file.items.length)
    expect(
      fileToPlacedItems({
        version: 1,
        roomId: 'girl-bedroom-v1',
        items: decoded.file.rooms.bedroom,
      }).map((i) => i.catalogId),
    ).toEqual(fileToPlacedItems(file).map((i) => i.catalogId))
  })

  it('round-trips a full house', async () => {
    const rooms = emptyHouseRooms()
    rooms.bedroom = createLouiseLayout()
    const house = serializeHouseFromState({
      rooms,
      activeRoom: 'bedroom',
      items: rooms.bedroom,
      roomTitle: 'Maison test',
    })
    const token = await encodeShareToken(house)
    const decoded = await decodeShareToken(token)
    expect(decoded.ok).toBe(true)
    if (!decoded.ok) return
    expect(decoded.kind).toBe('house')
    expect(decoded.file.title).toBe('Maison test')
    expect(decoded.file.rooms.bedroom.length).toBe(rooms.bedroom.length)
    expect(decoded.file.rooms.hall.length).toBe(rooms.hall.length)
    expect(decoded.file.rooms.salon.length).toBe(rooms.salon.length)
  })
})
