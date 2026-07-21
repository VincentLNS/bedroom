import { useEffect, useState } from 'react'
import { useThree } from '@react-three/fiber'
import { useRoomStore } from '../store/roomStore'

/**
 * Furniture hover hint for the canvas cursor.
 * Priority (highest first): dragging → place → hover → default.
 */
export type FurnitureHoverCursor = 'pointer' | 'grab' | 'not-allowed' | null

let furnitureHover: FurnitureHoverCursor = null
const hoverListeners = new Set<() => void>()

/** Called from placed meshes on pointer over/out. */
export function setFurnitureHoverCursor(next: FurnitureHoverCursor) {
  if (furnitureHover === next) return
  furnitureHover = next
  for (const listener of hoverListeners) listener()
}

export function getFurnitureHoverCursor(): FurnitureHoverCursor {
  return furnitureHover
}

function subscribeFurnitureHover(listener: () => void) {
  hoverListeners.add(listener)
  return () => {
    hoverListeners.delete(listener)
  }
}

/**
 * Standard floor-planner cursors on the WebGL canvas:
 * - place → crosshair (click to drop)
 * - drag → grabbing
 * - hover selected → grab (drag to move)
 * - hover item → pointer (click to select)
 * - locked → not-allowed
 * - else → default (orbit with left-drag)
 */
export function SceneCursor() {
  const gl = useThree((s) => s.gl)
  const mode = useRoomStore((s) => s.mode)
  const dragging = useRoomStore((s) => s.dragging)
  const pendingCatalogId = useRoomStore((s) => s.pendingCatalogId)
  const [hover, setHover] = useState<FurnitureHoverCursor>(furnitureHover)

  useEffect(() => {
    const sync = () => setHover(getFurnitureHoverCursor())
    sync()
    return subscribeFurnitureHover(sync)
  }, [])

  useEffect(() => {
    const el = gl.domElement
    const placing = mode === 'place' || pendingCatalogId != null
    let cursor = 'default'
    if (dragging) cursor = 'grabbing'
    else if (placing) cursor = 'crosshair'
    else if (hover) cursor = hover
    el.style.cursor = cursor
    return () => {
      el.style.cursor = ''
    }
  }, [gl, mode, dragging, pendingCatalogId, hover])

  return null
}
