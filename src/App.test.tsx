import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from './App'
import { useRoomStore } from './store/roomStore'

vi.mock('./scene/BedroomScene', () => ({
  BedroomScene: () => <div data-testid="bedroom-scene" />,
}))

describe('App', () => {
  beforeEach(() => {
    useRoomStore.setState({
      items: [],
      selectedId: null,
      mode: 'orbit',
      pendingCatalogId: null,
      dragging: false,
      importWarnings: [],
    })
  })

  it('renders bedroom title and catalogue chrome', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Chambre de Louise' })).toBeTruthy()
    expect(screen.getByRole('group', { name: 'Mode d’interaction' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Naviguer' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Poser' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Vider' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Exporter' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Importer' })).toBeTruthy()
    expect(screen.getByRole('navigation', { name: 'Catégories du catalogue' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Lit Louise' })).toBeTruthy()
  })

  it('arms place mode when a catalogue card is clicked', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Lit Louise' }))
    const state = useRoomStore.getState()
    expect(state.pendingCatalogId).toBe('bed-louise')
    expect(state.mode).toBe('place')
  })

  it('clears pending via Naviguer toggle, Annuler, and Escape', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Lit Louise' }))
    expect(useRoomStore.getState().mode).toBe('place')
    expect(screen.getByRole('button', { name: 'Annuler' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Annuler' }))
    expect(useRoomStore.getState().pendingCatalogId).toBeNull()
    expect(useRoomStore.getState().mode).toBe('orbit')

    fireEvent.click(screen.getByRole('button', { name: 'Lit Louise' }))
    fireEvent.click(screen.getByRole('button', { name: 'Naviguer' }))
    expect(useRoomStore.getState().pendingCatalogId).toBeNull()
    expect(useRoomStore.getState().mode).toBe('orbit')

    fireEvent.click(screen.getByRole('button', { name: 'Lit Louise' }))
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(useRoomStore.getState().pendingCatalogId).toBeNull()
    expect(useRoomStore.getState().mode).toBe('orbit')
  })

  it('clears room after confirm', () => {
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
    fireEvent.click(screen.getByRole('button', { name: 'Vider' }))

    expect(confirmSpy).toHaveBeenCalled()
    const state = useRoomStore.getState()
    expect(state.items).toEqual([])
    expect(state.pendingCatalogId).toBeNull()
    expect(state.mode).toBe('orbit')
    expect(state.selectedId).toBeNull()
    confirmSpy.mockRestore()
  })

  it('shows selection toolbar when an item is selected', () => {
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
    expect(screen.getByRole('toolbar', { name: 'Sélection' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Tourner' }))
    expect(useRoomStore.getState().items[0].rot).toBe(90)
    fireEvent.click(screen.getByRole('button', { name: 'Supprimer' }))
    expect(useRoomStore.getState().items).toHaveLength(0)
    expect(useRoomStore.getState().selectedId).toBeNull()
  })
})
