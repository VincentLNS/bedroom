import { beforeEach, describe, expect, it } from 'vitest'
import { useRoomStore } from '../store/roomStore'

describe('roomStore', () => {
  beforeEach(() => {
    useRoomStore.getState().clearRoom()
    useRoomStore.getState().clearPending()
    useRoomStore.getState().select(null)
    useRoomStore.getState().clearImportWarnings()
  })

  it('places an item when free', () => {
    const ok = useRoomStore.getState().place('bed-louise', 2, 3, 0)
    expect(ok).toBe(true)
    expect(useRoomStore.getState().items).toHaveLength(1)
    expect(useRoomStore.getState().items[0].catalogId).toBe('bed-louise')
  })

  it('rejects overlapping place', () => {
    expect(useRoomStore.getState().place('bed-louise', 2, 3, 0)).toBe(true)
    expect(useRoomStore.getState().place('stitch-blue', 2, 3, 0)).toBe(false)
    expect(useRoomStore.getState().items).toHaveLength(1)
  })

  it('rotates selected by 90 degrees', () => {
    useRoomStore.getState().place('chair-swivel-white', 5, 5, 0)
    const id = useRoomStore.getState().items[0].instanceId
    useRoomStore.getState().select(id)
    expect(useRoomStore.getState().rotateSelected()).toBe(true)
    expect(useRoomStore.getState().items[0].rot).toBe(90)
  })

  it('deletes selected', () => {
    useRoomStore.getState().place('lightbox-louise', 5, 5, 0)
    const id = useRoomStore.getState().items[0].instanceId
    useRoomStore.getState().select(id)
    useRoomStore.getState().deleteSelected()
    expect(useRoomStore.getState().items).toHaveLength(0)
    expect(useRoomStore.getState().selectedId).toBeNull()
  })

  it('moves selected ignoring self collision', () => {
    useRoomStore.getState().place('lightbox-louise', 5, 5, 0)
    const id = useRoomStore.getState().items[0].instanceId
    expect(useRoomStore.getState().move(id, 4, 5)).toBe(true)
    expect(useRoomStore.getState().items[0].cx).toBe(4)
  })

  it('clearRoom empties items', () => {
    useRoomStore.getState().place('lightbox-louise', 5, 5, 0)
    useRoomStore.getState().clearRoom()
    expect(useRoomStore.getState().items).toHaveLength(0)
  })

  it('clearRoom also clears selectedId', () => {
    useRoomStore.getState().place('lightbox-louise', 5, 5, 0)
    const id = useRoomStore.getState().items[0].instanceId
    useRoomStore.getState().select(id)
    expect(useRoomStore.getState().selectedId).toBe(id)
    useRoomStore.getState().clearRoom()
    expect(useRoomStore.getState().selectedId).toBeNull()
  })

  it('clearRoom clears importWarnings', () => {
    useRoomStore.getState().replaceLayout([
      {
        instanceId: 'a',
        catalogId: 'unknown-sofa',
        cx: 4,
        cz: 5,
        rot: 90,
      },
    ])
    expect(useRoomStore.getState().importWarnings).toHaveLength(1)
    useRoomStore.getState().clearRoom()
    expect(useRoomStore.getState().importWarnings).toEqual([])
  })

  it('select enters edit mode and clears pending', () => {
    useRoomStore.getState().armPlace('bed-louise')
    useRoomStore.getState().place('lightbox-louise', 5, 5, 0)
    const id = useRoomStore.getState().items[0].instanceId
    useRoomStore.getState().select(id)
    const state = useRoomStore.getState()
    expect(state.selectedId).toBe(id)
    expect(state.mode).toBe('edit')
    expect(state.pendingCatalogId).toBeNull()
  })

  it('replaceLayout skips unknown catalog ids', () => {
    useRoomStore.getState().replaceLayout([
      {
        instanceId: 'a',
        catalogId: 'bed-louise',
        cx: 2,
        cz: 3,
        rot: 0,
      },
      {
        instanceId: 'b',
        catalogId: 'unknown-sofa',
        cx: 4,
        cz: 5,
        rot: 90,
      },
    ])
    const state = useRoomStore.getState()
    expect(state.items).toHaveLength(1)
    expect(state.items[0].catalogId).toBe('bed-louise')
    expect(state.importWarnings).toEqual([
      'Skipped unknown furniture: unknown-sofa',
    ])
  })
})
