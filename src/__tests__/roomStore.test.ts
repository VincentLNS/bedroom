import { beforeEach, describe, expect, it } from 'vitest'
import { useRoomStore } from '../store/roomStore'

describe('roomStore', () => {
  beforeEach(() => {
    useRoomStore.setState({
      parentLock: false,
      undoStack: [],
      redoStack: [],
      toast: null,
      soundOn: true,
      musicOn: false,
      roomTitle: 'Chambre de Louise',
      challengesDone: [],
      activeRoom: 'bedroom',
      historyByRoom: {
        bedroom: { undo: [], redo: [] },
        hall: { undo: [], redo: [] },
        salon: { undo: [], redo: [] },
        cuisine: { undo: [], redo: [] },
        bathroom: { undo: [], redo: [] },
      },
    })
    useRoomStore.getState().clearRoom()
    useRoomStore.getState().clearPending()
    useRoomStore.getState().select(null)
    useRoomStore.getState().clearImportWarnings()
    useRoomStore.getState().setCurtainsOpen(true)
    useRoomStore.getState().setWallMode('cut')
    useRoomStore.getState().setViewMode('dollhouse')
    useRoomStore.getState().setShowGrid(true)
    useRoomStore.getState().setWallsAutoHide(true)
  })

  it('places an item when free', () => {
    const ok = useRoomStore.getState().place('bed-louise', 2, 3, 0)
    expect(ok).toBe(true)
    expect(useRoomStore.getState().items).toHaveLength(1)
    expect(useRoomStore.getState().items[0].catalogId).toBe('bed-louise')
  })

  it('rejects overlapping floor furniture', () => {
    expect(useRoomStore.getState().place('bed-louise', 2, 3, 0)).toBe(true)
    expect(useRoomStore.getState().place('desk-louise', 2, 3, 0)).toBe(false)
    expect(useRoomStore.getState().items).toHaveLength(1)
  })

  it('stacks nestable props on a bed surface', () => {
    expect(useRoomStore.getState().place('bed-louise', 6, 4, 0)).toBe(true)
    const bedId = useRoomStore.getState().items[0].instanceId
    expect(useRoomStore.getState().place('stitch-blue', 6, 5, 0)).toBe(true)
    const stitch = useRoomStore.getState().items.find(
      (i) => i.catalogId === 'stitch-blue',
    )
    expect(stitch?.parentId).toBe(bedId)
    expect(useRoomStore.getState().place('angel-pink', 6, 5, 0)).toBe(false)
    expect(useRoomStore.getState().place('angel-pink', 7, 5, 0)).toBe(true)
  })

  it('deletes stacked children with their host', () => {
    useRoomStore.getState().place('bed-louise', 6, 4, 0)
    const bedId = useRoomStore.getState().items[0].instanceId
    useRoomStore.getState().place('stitch-blue', 6, 5, 0)
    expect(useRoomStore.getState().items).toHaveLength(2)
    useRoomStore.getState().select(bedId)
    useRoomStore.getState().deleteSelected()
    expect(useRoomStore.getState().items).toHaveLength(0)
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
      'Meuble inconnu ignoré : unknown-sofa',
    ])
  })

  it('rotatePending cycles placement rotation', () => {
    useRoomStore.getState().armPlace('bed-louise')
    expect(useRoomStore.getState().pendingRot).toBe(0)
    useRoomStore.getState().rotatePending()
    expect(useRoomStore.getState().pendingRot).toBe(90)
    useRoomStore.getState().rotatePending()
    expect(useRoomStore.getState().pendingRot).toBe(180)
  })

  it('toggles curtains open and closed', () => {
    useRoomStore.getState().setCurtainsOpen(true)
    expect(useRoomStore.getState().curtainsOpen).toBe(true)
    useRoomStore.getState().toggleCurtains()
    expect(useRoomStore.getState().curtainsOpen).toBe(false)
    useRoomStore.getState().setCurtainsOpen(true)
    expect(useRoomStore.getState().curtainsOpen).toBe(true)
  })

  it('cancelInteraction clears pending, selection, and dragging', () => {
    useRoomStore.getState().armPlace('bed-louise')
    useRoomStore.getState().setDragging(true)
    expect(useRoomStore.getState().mode).toBe('place')

    useRoomStore.getState().cancelInteraction()

    const state = useRoomStore.getState()
    expect(state.pendingCatalogId).toBeNull()
    expect(state.selectedId).toBeNull()
    expect(state.dragging).toBe(false)
    expect(state.mode).toBe('orbit')
  })

  it('undo restores previous items after place and delete', () => {
    expect(useRoomStore.getState().place('lightbox-louise', 5, 5, 0)).toBe(true)
    expect(useRoomStore.getState().items).toHaveLength(1)
    const id = useRoomStore.getState().items[0].instanceId

    useRoomStore.getState().select(id)
    useRoomStore.getState().deleteSelected()
    expect(useRoomStore.getState().items).toHaveLength(0)

    expect(useRoomStore.getState().undo()).toBe(true)
    expect(useRoomStore.getState().items).toHaveLength(1)
    expect(useRoomStore.getState().items[0].catalogId).toBe('lightbox-louise')

    expect(useRoomStore.getState().undo()).toBe(true)
    expect(useRoomStore.getState().items).toHaveLength(0)

    expect(useRoomStore.getState().redo()).toBe(true)
    expect(useRoomStore.getState().items).toHaveLength(1)
  })

  it('duplicates selected into a free neighbour cell', () => {
    expect(useRoomStore.getState().place('lightbox-louise', 5, 5, 0)).toBe(true)
    const id = useRoomStore.getState().items[0].instanceId
    useRoomStore.getState().select(id)
    expect(useRoomStore.getState().duplicateSelected()).toBe(true)
    expect(useRoomStore.getState().items).toHaveLength(2)
  })

  it('locks selected item against delete', () => {
    expect(useRoomStore.getState().place('lightbox-louise', 5, 5, 0)).toBe(true)
    const id = useRoomStore.getState().items[0].instanceId
    useRoomStore.getState().select(id)
    useRoomStore.getState().toggleLockSelected()
    expect(useRoomStore.getState().items[0].locked).toBe(true)
    useRoomStore.getState().deleteSelected()
    expect(useRoomStore.getState().items).toHaveLength(1)
  })

  it('completes cat-garden challenge when devon is outdoors', () => {
    useRoomStore.setState({ challengesDone: [] })
    expect(useRoomStore.getState().place('cat-devon-rex', -2, 5, 0)).toBe(true)
    expect(useRoomStore.getState().challengesDone).toContain('cat-garden')
  })

  it('parent lock blocks armPlace, clearRoom, delete, move, replaceLayout', () => {
    useRoomStore.getState().setParentLock(true)
    useRoomStore.getState().armPlace('bed-louise')
    expect(useRoomStore.getState().pendingCatalogId).toBeNull()
    expect(useRoomStore.getState().mode).toBe('orbit')

    useRoomStore.getState().setParentLock(false)
    expect(useRoomStore.getState().place('lightbox-louise', 5, 5, 0)).toBe(true)
    const id = useRoomStore.getState().items[0].instanceId
    useRoomStore.getState().select(id)

    useRoomStore.getState().setParentLock(true)
    useRoomStore.getState().clearRoom()
    expect(useRoomStore.getState().items).toHaveLength(1)

    useRoomStore.getState().deleteSelected()
    expect(useRoomStore.getState().items).toHaveLength(1)

    expect(useRoomStore.getState().move(id, 4, 5)).toBe(false)
    expect(useRoomStore.getState().items[0].cx).toBe(5)

    useRoomStore.getState().replaceLayout([])
    expect(useRoomStore.getState().items).toHaveLength(1)
  })

  it('replaceLayout does not auto-complete décor challenges', () => {
    useRoomStore.setState({ challengesDone: [], parentLock: false })
    useRoomStore.getState().replaceLayout(
      // Louise-like: garden cat would complete cat-garden if we refreshed
      [
        {
          instanceId: 'c1',
          catalogId: 'cat-devon-rex',
          cx: -2,
          cz: 5,
          rot: 0,
        },
      ],
    )
    expect(useRoomStore.getState().challengesDone).not.toContain('cat-garden')
    expect(useRoomStore.getState().place('cat-devon-rex', -1, 5, 0)).toBe(true)
    expect(useRoomStore.getState().challengesDone).toContain('cat-garden')
  })

  it('renames room title with fallback', () => {
    useRoomStore.getState().setRoomTitle('  Chambre de Léa  ')
    expect(useRoomStore.getState().roomTitle).toBe('Chambre de Léa')
    useRoomStore.getState().setRoomTitle('   ')
    expect(useRoomStore.getState().roomTitle).toBe('Chambre de Louise')
  })

  it('keeps per-room undo history when switching wings', () => {
    useRoomStore.setState({ parentLock: false, challengesDone: [] })

    useRoomStore.getState().clearRoom()
    expect(useRoomStore.getState().place('lightbox-louise', 5, 5, 0)).toBe(true)
    expect(useRoomStore.getState().items).toHaveLength(1)

    useRoomStore.getState().setActiveRoom('cuisine')
    useRoomStore.getState().clearRoom()
    expect(useRoomStore.getState().place('plant-succulent', 5, 5, 0)).toBe(true)

    useRoomStore.getState().setActiveRoom('bedroom')
    expect(useRoomStore.getState().items).toHaveLength(1)
    expect(useRoomStore.getState().undo()).toBe(true)
    expect(useRoomStore.getState().items).toHaveLength(0)

    useRoomStore.getState().setActiveRoom('cuisine')
    expect(useRoomStore.getState().items).toHaveLength(1)
    expect(useRoomStore.getState().undo()).toBe(true)
    expect(useRoomStore.getState().items).toHaveLength(0)
  })
})
