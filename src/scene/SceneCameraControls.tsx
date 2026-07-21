import { useEffect, useRef } from 'react'
import { MOUSE, TOUCH, type PerspectiveCamera } from 'three'
import { OrbitControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { useRoomStore } from '../store/roomStore'
import { isPhoneViewport } from '../ui/usePhoneLayout'

const CLICK_SLOP_PX = 6
const TWO_FINGER_TAP_MS = 320
const TWO_FINGER_TAP_SLOP_PX = 28

/** Default dollhouse hero angle (¾ high). */
export const HOME_CAMERA_POS: [number, number, number] = [3.6, 3.8, 5.2]
/** Closer + slightly higher for portrait phones (short viewport). */
export const PHONE_HOME_CAMERA_POS: [number, number, number] = [3.15, 4.15, 4.55]
export const HOME_TARGET: [number, number, number] = [0, 0.55, 0]
export const HOME_FOV = 40
export const PHONE_HOME_FOV = 50
/** Top-down plan peek — slightly offset so OrbitControls stays stable. */
const PLAN_CAMERA_POS: [number, number, number] = [0.01, 9.2, 0.01]
const PLAN_TARGET: [number, number, number] = [0, 0, 0]

/**
 * Clic droit court :
 * - mode pose → tourne le fantôme (+90°)
 * - objet sélectionné → tourne l’objet (+90°)
 * Clic droit maintenu → orbit (OrbitControls).
 */
function RightClickRotateOrOrbit() {
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
      if (store.dragging) return

      if (store.pendingCatalogId != null || store.mode === 'place') {
        store.rotatePending()
        return
      }

      if (store.selectedId) {
        store.rotateSelected()
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

/** Two-finger quick tap → undo (Procreate mental model). */
function TwoFingerTapUndo() {
  const gl = useThree((s) => s.gl)

  useEffect(() => {
    const el = gl.domElement
    let active: {
      start: number
      ax: number
      ay: number
      bx: number
      by: number
    } | null = null

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 2) {
        active = null
        return
      }
      const a = event.touches[0]
      const b = event.touches[1]
      active = {
        start: performance.now(),
        ax: a.clientX,
        ay: a.clientY,
        bx: b.clientX,
        by: b.clientY,
      }
    }

    const onTouchEnd = (event: TouchEvent) => {
      if (!active) return
      if (event.touches.length > 0) return

      const elapsed = performance.now() - active.start
      const changed = event.changedTouches
      let maxMove = 0
      for (let i = 0; i < changed.length; i++) {
        const t = changed[i]
        maxMove = Math.max(
          maxMove,
          Math.hypot(t.clientX - active.ax, t.clientY - active.ay),
          Math.hypot(t.clientX - active.bx, t.clientY - active.by),
        )
      }
      active = null

      if (elapsed > TWO_FINGER_TAP_MS) return
      if (maxMove > TWO_FINGER_TAP_SLOP_PX) return

      useRoomStore.getState().undo()
    }

    const onTouchCancel = () => {
      active = null
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchend', onTouchEnd, { passive: true })
    el.addEventListener('touchcancel', onTouchCancel, { passive: true })
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchend', onTouchEnd)
      el.removeEventListener('touchcancel', onTouchCancel)
    }
  }, [gl])

  return null
}

function applyHomeView(
  controls: OrbitControlsImpl,
  camera: PerspectiveCamera,
) {
  const phone = isPhoneViewport()
  camera.position.set(...(phone ? PHONE_HOME_CAMERA_POS : HOME_CAMERA_POS))
  camera.fov = phone ? PHONE_HOME_FOV : HOME_FOV
  camera.updateProjectionMatrix()
  controls.target.set(...HOME_TARGET)
  controls.minPolarAngle = 0.55
  controls.maxPolarAngle = Math.PI / 2.15
  controls.minDistance = phone ? 3.4 : 4
  controls.maxDistance = phone ? 10 : 11
  controls.enableRotate = true
  controls.update()
}

function applyPlanView(
  controls: OrbitControlsImpl,
  camera: PerspectiveCamera,
) {
  camera.position.set(...PLAN_CAMERA_POS)
  controls.target.set(...PLAN_TARGET)
  // Lock near top-down; allow slight tilt so damping stays happy
  controls.minPolarAngle = 0.02
  controls.maxPolarAngle = 0.35
  controls.minDistance = 6
  controls.maxDistance = 14
  controls.enableRotate = true
  controls.update()
}

export function SceneCameraControls() {
  const placing = useRoomStore((s) => s.mode === 'place')
  const dragging = useRoomStore((s) => s.dragging)
  const viewMode = useRoomStore((s) => s.viewMode)
  const cameraHomeTick = useRoomStore((s) => s.cameraHomeTick)
  const interactBusy = placing || dragging
  const controlsRef = useRef<OrbitControlsImpl>(null)
  const { camera } = useThree()

  useEffect(() => {
    const controls = controlsRef.current
    if (!controls) return
    const cam = camera as PerspectiveCamera
    if (viewMode === 'plan') {
      applyPlanView(controls, cam)
    } else {
      applyHomeView(controls, cam)
    }
  }, [viewMode, camera])

  useEffect(() => {
    if (cameraHomeTick === 0) return
    const controls = controlsRef.current
    if (!controls) return
    const cam = camera as PerspectiveCamera
    if (useRoomStore.getState().viewMode === 'plan') {
      applyPlanView(controls, cam)
    } else {
      applyHomeView(controls, cam)
    }
  }, [cameraHomeTick, camera])

  // Keep target on the floor plane while panning in plan mode
  useEffect(() => {
    const controls = controlsRef.current
    if (!controls || viewMode !== 'plan') return
    const onChange = () => {
      controls.target.y = 0
      // Prevent orbit from flipping under the floor
      if (camera.position.y < 4) {
        camera.position.y = 4
      }
    }
    controls.addEventListener('change', onChange)
    return () => controls.removeEventListener('change', onChange)
  }, [viewMode, camera])

  return (
    <>
      <RightClickRotateOrOrbit />
      <TwoFingerTapUndo />
      <OrbitControls
        ref={controlsRef}
        makeDefault
        target={[0, 0.55, 0]}
        minPolarAngle={0.55}
        maxPolarAngle={Math.PI / 2.15}
        minDistance={4}
        maxDistance={11}
        enableDamping
        dampingFactor={0.08}
        mouseButtons={
          interactBusy
            ? { MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.ROTATE }
            : {
                LEFT: MOUSE.ROTATE,
                MIDDLE: MOUSE.DOLLY,
                RIGHT: MOUSE.ROTATE,
              }
        }
        // Gold rule: 1 finger = place/select; 2 fingers = camera always (even in Pose).
        touches={
          interactBusy
            ? { TWO: TOUCH.DOLLY_PAN }
            : { ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN }
        }
        enableRotate
        enablePan
        enableZoom
        screenSpacePanning={viewMode === 'plan'}
      />
    </>
  )
}
