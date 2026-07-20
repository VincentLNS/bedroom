import type { ThreeEvent } from '@react-three/fiber'
import { getCatalogItem } from '../catalog'
import { canPlace, footprintCells, PLACE_ROT, worldToCell } from '../placement'
import { useRoomStore } from '../store/roomStore'
import { ROOM_DEPTH_M, ROOM_WIDTH_M } from '../room/constants'

/**
 * Invisible floor catcher: places pending catalog item on pointer down
 * when mode is 'place' and the footprint is free.
 */
export function PlacementController() {
  const mode = useRoomStore((s) => s.mode)
  const pendingCatalogId = useRoomStore((s) => s.pendingCatalogId)
  const place = useRoomStore((s) => s.place)
  const getOccupied = useRoomStore((s) => s.getOccupied)

  const catalog =
    pendingCatalogId != null ? getCatalogItem(pendingCatalogId) : undefined
  const placing = mode === 'place' && catalog?.visual.type === 'primitive'

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (!placing || !pendingCatalogId || !catalog) return

    e.stopPropagation()

    if (catalog.visual.type !== 'primitive') return

    const { cx, cz } = worldToCell(e.point.x, e.point.z)
    const cells = footprintCells(cx, cz, PLACE_ROT, catalog.footprint)
    if (!canPlace(cells, getOccupied())) return

    place(pendingCatalogId, cx, cz, PLACE_ROT)
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
