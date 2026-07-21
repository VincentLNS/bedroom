import { describe, expect, it } from 'vitest'
import { createBathroomLayout } from '../presets/bathroom'
import { createCuisineLayout } from '../presets/cuisine'
import { createHallLayout } from '../presets/hall'
import { createLouiseLayout } from '../presets/louise'
import { createSalonLayout } from '../presets/salon'

function byId(layout: { instanceId: string; rot: number }[]) {
  return Object.fromEntries(layout.map((i) => [i.instanceId, i.rot]))
}

describe('preset furniture facing', () => {
  it('orients Louise storage and desk toward the room', () => {
    const rot = byId(createLouiseLayout())
    expect(rot['louise-wardrobe']).toBe(180) // doors into room from −Z
    expect(rot['louise-bookshelf']).toBe(180)
    expect(rot['louise-desk']).toBe(180) // hutch to window
    expect(rot['louise-chair']).toBe(180) // seat toward desk (+Z)
    expect(rot['louise-chest']).toBe(270) // door toward +X
    expect(rot['louise-dollhouse']).toBe(90)
    expect(rot['louise-trofast']).toBe(90)
    expect(rot['louise-bed']).toBe(0)
    expect(rot['louise-rattan']).toBe(270)
  })

  it('orients salon sofa into the room, not into the wall', () => {
    const rot = byId(createSalonLayout())
    expect(rot['salon-sofa']).toBe(270)
    expect(rot['salon-bookshelf']).toBe(180)
    expect(rot['salon-desk']).toBe(180)
    expect(rot['salon-chair']).toBe(180)
  })

  it('orients hall bench and mirror into the passage', () => {
    const rot = byId(createHallLayout())
    expect(rot['hall-bench']).toBe(270)
    expect(rot['hall-mirror']).toBe(90)
  })

  it('orients cuisine and bathroom storage into the room', () => {
    const cuisine = byId(createCuisineLayout())
    expect(cuisine['cuisine-fridge']).toBe(180)
    expect(cuisine['cuisine-stove']).toBe(180)
    expect(cuisine['cuisine-sink']).toBe(270)
    expect(cuisine['cuisine-cabinet']).toBe(270)
    expect(cuisine['cuisine-kitchen']).toBe(180)

    const bath = byId(createBathroomLayout())
    expect(bath['bath-toilet']).toBe(180)
    expect(bath['bath-tub']).toBe(180)
    expect(bath['bath-shower']).toBe(90)
    expect(bath['bath-sink']).toBe(90)
    expect(bath['bath-mirror']).toBe(90)
    expect(bath['bath-washer']).toBe(180)
  })
})

