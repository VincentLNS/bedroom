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
    expect(screen.getByRole('heading', { name: 'Bedroom' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Clear room' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Export' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Import' })).toBeTruthy()
    expect(screen.getByRole('navigation', { name: 'Furniture categories' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Twin Bed' })).toBeTruthy()
  })

  it('arms place mode when a catalogue card is clicked', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Twin Bed' }))
    const state = useRoomStore.getState()
    expect(state.pendingCatalogId).toBe('bed-twin')
    expect(state.mode).toBe('place')
  })

  it('clears room after confirm', () => {
    useRoomStore.setState({
      items: [
        {
          instanceId: 'a',
          catalogId: 'bed-twin',
          cx: 1,
          cz: 1,
          rot: 0,
        },
      ],
      pendingCatalogId: 'bed-twin',
      mode: 'place',
      selectedId: 'a',
    })
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Clear room' }))

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
          catalogId: 'plant-pot',
          cx: 5,
          cz: 5,
          rot: 0,
        },
      ],
      selectedId: 'a',
      mode: 'edit',
    })
    render(<App />)
    expect(screen.getByRole('toolbar', { name: 'Selection' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Rotate' }))
    expect(useRoomStore.getState().items[0].rot).toBe(90)
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(useRoomStore.getState().items).toHaveLength(0)
    expect(useRoomStore.getState().selectedId).toBeNull()
  })
})
