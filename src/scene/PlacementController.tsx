import type { ThreeEvent } from '@react-three/fiber'
import { getCatalogItem } from '../catalog'
import { canPlace, footprintCells, PLACE_ROT, worldToCell } from '../placement'
import { useRoomStore } from '../store/roomStore'
import { ROOM_DEPTH_M, ROOM_WIDTH_M } from '../room/constants'

/**
 * Invisible floor catcher:
 * - place mode: places pending catalog item on pointer down when free
 * - edit mode: clears selection on empty-floor click (no place unless pending)
 */
export function PlacementController() {
  const mode = useRoomStore((s) => s.mode)
  const pendingCatalogId = useRoomStore((s) => s.pendingCatalogId)
  const place = useRoomStore((s) => s.place)
  const select = useRoomStore((s) => s.select)
  const dragging = useRoomStore((s) => s.dragging)
  const getOccupied = useRoomStore((s) => s.getOccupied)

  const catalog =
    pendingCatalogId != null ? getCatalogItem(pendingCatalogId) : undefined
  const placing = mode === 'place' && catalog?.visual.type === 'primitive'

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    // Clic droit = orbit / annuler pose (géré ailleurs), jamais placer.
    if (e.button !== 0) return
    // Drag-move owns the gesture once started on furniture.
    if (dragging) return

    if (placing && pendingCatalogId && catalog) {
      e.stopPropagation()

      if (catalog.visual.type !== 'primitive') return

      const { cx, cz } = worldToCell(e.point.x, e.point.z)
      const cells = footprintCells(cx, cz, PLACE_ROT, catalog.footprint)
      if (!canPlace(cells, getOccupied())) return

      place(pendingCatalogId, cx, cz, PLACE_ROT)
      return
    }

    // Empty floor in edit: clear selection (do not place).
    if (mode === 'edit') {
      e.stopPropagation()
      select(null)
    }
  }

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.001, 0]}
      onPointerDown={onPointerDown}
    >
      <planeGeometry args={[ROOM_WIDTH_M, ROOM_DEPTH_M]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  )
}
