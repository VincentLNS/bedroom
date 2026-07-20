import type { ThreeEvent } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { getCatalogItem } from '../catalog'
import { resolvePlacement, worldToCell } from '../placement'
import { useRoomStore } from '../store/roomStore'
import { GARDEN_DEPTH_M, GARDEN_WIDTH_M } from '../room/constants'
import { feedbackPlaceBad, feedbackPlaceOk } from '../ui/feedback'

const LONG_PRESS_MS = 520

/**
 * Invisible floor catcher (chambre + jardin) :
 * - place mode: short tap places ; long-press cancels ghost
 * - edit mode: clears selection on empty-floor click
 */
export function PlacementController() {
  const mode = useRoomStore((s) => s.mode)
  const pendingCatalogId = useRoomStore((s) => s.pendingCatalogId)
  const pendingRot = useRoomStore((s) => s.pendingRot)
  const place = useRoomStore((s) => s.place)
  const select = useRoomStore((s) => s.select)
  const dragging = useRoomStore((s) => s.dragging)
  const flashToast = useRoomStore((s) => s.flashToast)
  const triggerSnapPulse = useRoomStore((s) => s.triggerSnapPulse)
  const cancelInteraction = useRoomStore((s) => s.cancelInteraction)

  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cancelledByLongPress = useRef(false)

  const catalog =
    pendingCatalogId != null ? getCatalogItem(pendingCatalogId) : undefined
  const placing = mode === 'place' && catalog != null

  const clearLongPress = () => {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current)
      longPressRef.current = null
    }
  }

  useEffect(() => () => clearLongPress(), [])

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (e.button !== 0) return
    if (dragging) return
    if (e.nativeEvent.isPrimary === false) return

    if (placing) {
      e.stopPropagation()
      cancelledByLongPress.current = false
      clearLongPress()
      longPressRef.current = setTimeout(() => {
        longPressRef.current = null
        cancelledByLongPress.current = true
        cancelInteraction()
        flashToast('Pose annulée (appui long)', 'info')
      }, LONG_PRESS_MS)
      return
    }

    if (mode === 'edit') {
      e.stopPropagation()
      select(null)
    }
  }

  const onPointerUp = (e: ThreeEvent<PointerEvent>) => {
    if (e.button !== 0) return
    if (dragging) return
    if (e.nativeEvent.isPrimary === false) return

    const hadTimer = longPressRef.current != null
    clearLongPress()

    if (!placing || !pendingCatalogId || !catalog) return
    if (cancelledByLongPress.current || !hadTimer) return

    e.stopPropagation()
    const { cx, cz } = worldToCell(e.point.x, e.point.z)
    const items = useRoomStore.getState().items
    const resolved = resolvePlacement(catalog, cx, cz, pendingRot, items)
    if (!resolved.ok) {
      feedbackPlaceBad()
      triggerSnapPulse(cx, cz, false)
      flashToast(
        catalog.outdoor
          ? 'Pas ici — essaie le jardin ou un autre coin'
          : 'Pas ici — trop serré ou hors de la chambre',
        'error',
      )
      return
    }

    if (place(pendingCatalogId, cx, cz, pendingRot)) {
      feedbackPlaceOk()
      triggerSnapPulse(cx, cz, true)
      flashToast(`Posé : ${catalog.name}`, 'ok')
    }
  }

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.001, 0]}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        clearLongPress()
        cancelledByLongPress.current = false
      }}
    >
      <planeGeometry args={[GARDEN_WIDTH_M, GARDEN_DEPTH_M]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  )
}
