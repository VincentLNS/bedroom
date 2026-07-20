import { useEffect } from 'react'
import { MOUSE } from 'three'
import { OrbitControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { useRoomStore } from '../store/roomStore'

const CLICK_SLOP_PX = 6

/** Clic droit court = annuler la pose ; clic droit maintenu = orbit (via OrbitControls). */
function RightClickCancelPlace() {
  const gl = useThree((s) => s.gl)

  useEffect(() => {
    const el = gl.domElement
    let downX = 0
    let downY = 0
    let tracking = false

    const onContextMenu = (event: MouseEvent) => {
      event.preventDefault()
    }

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 2) return
      tracking = true
      downX = event.clientX
      downY = event.clientY
    }

    const onPointerUp = (event: PointerEvent) => {
      if (event.button !== 2 || !tracking) return
      tracking = false
      const moved = Math.hypot(event.clientX - downX, event.clientY - downY)
      if (moved >= CLICK_SLOP_PX) return

      const store = useRoomStore.getState()
      if (store.pendingCatalogId != null || store.mode === 'place') {
        store.clearPending()
        store.select(null)
      }
    }

    el.addEventListener('contextmenu', onContextMenu)
    el.addEventListener('pointerdown', onPointerDown)
    el.addEventListener('pointerup', onPointerUp)
    return () => {
      el.removeEventListener('contextmenu', onContextMenu)
      el.removeEventListener('pointerdown', onPointerDown)
      el.removeEventListener('pointerup', onPointerUp)
    }
  }, [gl])

  return null
}

export function SceneCameraControls() {
  const placing = useRoomStore((s) => s.mode === 'place')
  const dragging = useRoomStore((s) => s.dragging)
  const interactBusy = placing || dragging

  return (
    <>
      <RightClickCancelPlace />
      <OrbitControls
        makeDefault
        target={[0, 0.8, 0]}
        minPolarAngle={0.35}
        maxPolarAngle={Math.PI / 2.05}
        minDistance={3}
        maxDistance={12}
        // Gauche = orbit seulement hors pose ; droit = orbit toujours (comme les planners).
        mouseButtons={
          interactBusy
            ? { MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.ROTATE }
            : {
                LEFT: MOUSE.ROTATE,
                MIDDLE: MOUSE.DOLLY,
                RIGHT: MOUSE.ROTATE,
              }
        }
        enableRotate
        enablePan={!interactBusy}
      />
    </>
  )
}
