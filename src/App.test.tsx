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
    })
  })

  it('renders bedroom title and catalogue chrome', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Bedroom' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Clear room' })).toBeTruthy()
    expect(
      (screen.getByRole('button', { name: 'Export' }) as HTMLButtonElement)
        .disabled,
    ).toBe(true)
    expect(
      (screen.getByRole('button', { name: 'Import' }) as HTMLButtonElement)
        .disabled,
    ).toBe(true)
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
    })
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Clear room' }))

    expect(confirmSpy).toHaveBeenCalled()
    const state = useRoomStore.getState()
    expect(state.items).toEqual([])
    expect(state.pendingCatalogId).toBeNull()
    expect(state.mode).toBe('orbit')
    confirmSpy.mockRestore()
  })
})
