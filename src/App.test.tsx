import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from './App'
import { useRoomStore } from './store/roomStore'

vi.mock('./scene/BedroomScene', () => ({
  BedroomScene: () => <div data-testid="bedroom-scene" />,
}))

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('minideco-gesture-coach-v1', 'done')
    useRoomStore.setState({
      items: [],
      selectedId: null,
      mode: 'orbit',
      pendingCatalogId: null,
      pendingRot: 0,
      dragging: false,
      curtainsOpen: true,
      wallMode: 'cut',
      viewMode: 'dollhouse',
      showGrid: true,
      wallsAutoHide: true,
      cameraHomeTick: 0,
      importWarnings: [],
      undoStack: [],
      redoStack: [],
      toast: null,
      snapPulse: null,
      photoMode: false,
      shadowQuality: 'high',
      bigFingers: false,
      highContrast: false,
      catalogSheet: 'half',
      favorites: [],
      recents: [],
      challengesDone: [],
      roomTitle: 'Chambre de Louise',
      soundOn: true,
      musicOn: false,
      parentLock: false,
    })
  })

  it('renders Mini Déco chrome and catalogue', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Mini Déco' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Chambre de Louise' })).toBeTruthy()
    expect(screen.getByText('Astuce déco')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Boîte à meubles' })).toBeTruthy()
    expect(screen.getByRole('group', { name: 'Mode d’interaction' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Regarder' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Placer' })).toBeTruthy()
    expect(screen.getByRole('group', { name: 'Vue' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '3D' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Plan' })).toBeTruthy()
    expect(screen.getByRole('group', { name: 'Murs' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Coupés' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Sans' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Complets' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Grille' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Recentrer' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Chambre vide' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Modèle Louise' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Sauver' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Ouvrir' })).toBeTruthy()
    expect(screen.getByRole('navigation', { name: 'Catégories du catalogue' })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Placer Lit Louise/ })).toBeTruthy()
  })

  it('switches wall modes from the segmented control', () => {
    render(<App />)
    expect(useRoomStore.getState().wallMode).toBe('cut')
    fireEvent.click(screen.getByRole('button', { name: 'Sans' }))
    expect(useRoomStore.getState().wallMode).toBe('hidden')
    fireEvent.click(screen.getByRole('button', { name: 'Complets' }))
    expect(useRoomStore.getState().wallMode).toBe('full')
    fireEvent.click(screen.getByRole('button', { name: 'Coupés' }))
    expect(useRoomStore.getState().wallMode).toBe('cut')
  })

  it('toggles plan view and grid from the top bar', () => {
    render(<App />)
    expect(useRoomStore.getState().viewMode).toBe('dollhouse')
    fireEvent.click(screen.getByRole('button', { name: 'Plan' }))
    expect(useRoomStore.getState().viewMode).toBe('plan')
    fireEvent.click(screen.getByRole('button', { name: '3D' }))
    expect(useRoomStore.getState().viewMode).toBe('dollhouse')

    expect(useRoomStore.getState().showGrid).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Grille' }))
    expect(useRoomStore.getState().showGrid).toBe(false)
  })

  it('supports keyboard rotate, delete, grid, and home', () => {
    useRoomStore.setState({
      items: [
        {
          instanceId: 'a',
          catalogId: 'lightbox-louise',
          cx: 5,
          cz: 5,
          rot: 0,
        },
      ],
      selectedId: 'a',
      mode: 'edit',
    })
    render(<App />)
    fireEvent.keyDown(window, { key: 'r' })
    expect(useRoomStore.getState().items[0].rot).toBe(90)
    fireEvent.keyDown(window, { key: 'g' })
    expect(useRoomStore.getState().showGrid).toBe(false)
    const tick = useRoomStore.getState().cameraHomeTick
    fireEvent.keyDown(window, { key: 'h' })
    expect(useRoomStore.getState().cameraHomeTick).toBe(tick + 1)
    fireEvent.keyDown(window, { key: 'Delete' })
    expect(useRoomStore.getState().items).toHaveLength(0)
  })

  it('toggles curtains from the top bar when walls are full', () => {
    useRoomStore.setState({ wallMode: 'full' })
    render(<App />)
    expect(useRoomStore.getState().curtainsOpen).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Rideaux ouverts' }))
    expect(useRoomStore.getState().curtainsOpen).toBe(false)
    expect(screen.getByRole('button', { name: 'Rideaux fermés' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Rideaux fermés' }))
    expect(useRoomStore.getState().curtainsOpen).toBe(true)
  })

  it('boots with Chambre Louise when there is no saved layout', async () => {
    render(<App />)
    await vi.waitFor(() => {
      expect(useRoomStore.getState().items.length).toBeGreaterThanOrEqual(12)
    })
    expect(
      useRoomStore.getState().items.some((item) => item.catalogId === 'bed-louise'),
    ).toBe(true)
  })

  it('arms place mode when a catalogue card is clicked', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Placer Lit Louise/ }))
    const state = useRoomStore.getState()
    expect(state.pendingCatalogId).toBe('bed-louise')
    expect(state.mode).toBe('place')
  })

  it('collapses and expands the catalogue panel', () => {
    render(<App />)
    expect(screen.getByRole('navigation', { name: 'Catégories du catalogue' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Cacher' }))
    expect(screen.queryByRole('navigation', { name: 'Catégories du catalogue' })).toBeNull()
    expect(screen.getByRole('button', { name: /Boîte à meubles/ })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Boîte à meubles/ }))
    expect(screen.getByRole('navigation', { name: 'Catégories du catalogue' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Cacher' })).toBeTruthy()
  })

  it('clears pending via Regarder toggle, Annuler, and Escape', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Placer Lit Louise/ }))
    expect(useRoomStore.getState().mode).toBe('place')
    expect(screen.getByRole('button', { name: 'Annuler' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Annuler' }))
    expect(useRoomStore.getState().pendingCatalogId).toBeNull()
    expect(useRoomStore.getState().mode).toBe('orbit')

    fireEvent.click(screen.getByRole('button', { name: /Placer Lit Louise/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Regarder' }))
    expect(useRoomStore.getState().pendingCatalogId).toBeNull()
    expect(useRoomStore.getState().mode).toBe('orbit')

    fireEvent.click(screen.getByRole('button', { name: /Placer Lit Louise/ }))
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(useRoomStore.getState().pendingCatalogId).toBeNull()
    expect(useRoomStore.getState().mode).toBe('orbit')
  })

  it('loads empty and Louise presets after confirm', () => {
    useRoomStore.setState({
      items: [
        {
          instanceId: 'a',
          catalogId: 'bed-louise',
          cx: 1,
          cz: 1,
          rot: 0,
        },
      ],
      pendingCatalogId: 'bed-louise',
      mode: 'place',
      selectedId: 'a',
    })
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Chambre vide' }))

    expect(confirmSpy).toHaveBeenCalled()
    let state = useRoomStore.getState()
    expect(state.items).toEqual([])
    expect(state.pendingCatalogId).toBeNull()
    expect(state.mode).toBe('orbit')
    expect(state.selectedId).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Modèle Louise' }))
    state = useRoomStore.getState()
    expect(state.items.length).toBeGreaterThanOrEqual(12)
    expect(state.items.some((item) => item.catalogId === 'bed-louise')).toBe(true)
    expect(state.pendingCatalogId).toBeNull()
    expect(state.selectedId).toBeNull()
    confirmSpy.mockRestore()
  })

  it('shows action dock when an item is selected', () => {
    useRoomStore.setState({
      items: [
        {
          instanceId: 'a',
          catalogId: 'lightbox-louise',
          cx: 5,
          cz: 5,
          rot: 0,
        },
      ],
      selectedId: 'a',
      mode: 'edit',
    })
    render(<App />)
    expect(screen.getByRole('toolbar', { name: 'Actions rapides' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Tourner/ }))
    expect(useRoomStore.getState().items[0].rot).toBe(90)
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    fireEvent.click(screen.getByRole('button', { name: /Enlever/ }))
    expect(confirmSpy).toHaveBeenCalled()
    expect(useRoomStore.getState().items).toHaveLength(0)
    expect(useRoomStore.getState().selectedId).toBeNull()
    confirmSpy.mockRestore()
  })
})
