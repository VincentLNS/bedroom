import { describe, expect, it } from 'vitest'
import {
  bedroomFileToHouse,
  fileToPlacedItems,
  houseFileToRooms,
  parseAnySave,
  parseLayout,
  serializeHouse,
  serializeHouseFromState,
  serializeLayout,
} from '../persist'
import { emptyHouseRooms } from '../house/rooms'
import { createLouiseLayout } from '../presets/louise'

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

  it('round-trips a layout with parentId', () => {
    const file = serializeLayout([
      {
        instanceId: 'bed',
        catalogId: 'bed-louise',
        cx: 6,
        cz: 4,
        rot: 0,
      },
      {
        instanceId: 'stitch',
        catalogId: 'stitch-blue',
        cx: 6,
        cz: 5,
        rot: 0,
        parentId: 'bed',
      },
    ])
    expect(file.items[1].parentId).toBe('bed')
    const parsed = parseLayout(file)
    expect(parsed.ok).toBe(true)
    if (parsed.ok) {
      expect(fileToPlacedItems(parsed.file)[1].parentId).toBe('bed')
    }
  })

  it('round-trips a full house', () => {
    const rooms = emptyHouseRooms()
    rooms.bedroom = createLouiseLayout()
    const file = serializeHouse(rooms, 'hall', 'Maison de Léa')
    expect(file.version).toBe(2)
    expect(file.activeRoom).toBe('hall')
    expect(file.title).toBe('Maison de Léa')
    expect(file.rooms.bedroom.length).toBeGreaterThanOrEqual(12)
    expect(file.rooms.hall.length).toBeGreaterThanOrEqual(6)
    expect(file.rooms.salon.length).toBeGreaterThanOrEqual(8)
    expect(file.rooms.cuisine.length).toBeGreaterThanOrEqual(8)
    expect(file.rooms.bathroom.length).toBeGreaterThanOrEqual(8)

    const parsed = parseAnySave(file)
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    const restored = houseFileToRooms(parsed.file)
    expect(restored.bedroom[0]?.catalogId).toBe(rooms.bedroom[0]?.catalogId)
    expect(restored.hall).toHaveLength(rooms.hall.length)
    expect(restored.salon).toHaveLength(rooms.salon.length)
    expect(restored.cuisine).toHaveLength(rooms.cuisine.length)
    expect(restored.bathroom).toHaveLength(rooms.bathroom.length)
  })

  it('soft-migrates old 3-wing house files with cuisine/bathroom presets', () => {
    const rooms = emptyHouseRooms()
    const legacy = {
      version: 2 as const,
      kind: 'mini-deco-house' as const,
      activeRoom: 'bedroom' as const,
      rooms: {
        bedroom: serializeLayout(rooms.bedroom).items,
        hall: serializeLayout(rooms.hall).items,
        salon: serializeLayout(rooms.salon).items,
      },
    }
    const parsed = parseAnySave(legacy)
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    expect(parsed.file.rooms.cuisine.length).toBeGreaterThan(0)
    expect(parsed.file.rooms.bathroom.length).toBeGreaterThan(0)
  })

  it('migrates legacy v1 bedroom into house with default wings', () => {
    const legacy = serializeLayout(createLouiseLayout())
    const migrated = bedroomFileToHouse(legacy)
    expect(migrated.version).toBe(2)
    expect(migrated.activeRoom).toBe('bedroom')
    expect(migrated.rooms.bedroom).toHaveLength(legacy.items.length)
    expect(migrated.rooms.hall.length).toBeGreaterThan(0)
    expect(migrated.rooms.salon.length).toBeGreaterThan(0)
    expect(migrated.rooms.cuisine.length).toBeGreaterThan(0)
    expect(migrated.rooms.bathroom.length).toBeGreaterThan(0)

    const viaParse = parseAnySave(legacy)
    expect(viaParse.ok).toBe(true)
    if (viaParse.ok) {
      expect(viaParse.file.rooms.bedroom).toHaveLength(legacy.items.length)
    }
  })

  it('serializeHouseFromState prefers live items for active room', () => {
    const rooms = emptyHouseRooms()
    const live = [
      {
        instanceId: 'only',
        catalogId: 'lightbox-louise',
        cx: 4,
        cz: 4,
        rot: 0 as const,
      },
    ]
    const file = serializeHouseFromState({
      rooms,
      activeRoom: 'bedroom',
      items: live,
      roomTitle: 'Test',
    })
    expect(file.rooms.bedroom).toHaveLength(1)
    expect(file.rooms.bedroom[0].catalogId).toBe('lightbox-louise')
    expect(file.title).toBe('Test')
  })
})
