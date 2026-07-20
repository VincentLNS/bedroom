import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

vi.mock('./scene/BedroomScene', () => ({
  BedroomScene: () => <div data-testid="bedroom-scene" />,
}))

describe('App', () => {
  it('renders bedroom title', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Bedroom' })).toBeTruthy()
  })
})
