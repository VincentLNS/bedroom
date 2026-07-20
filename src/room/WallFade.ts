import { useFrame, useThree } from '@react-three/fiber'
import { useRoomStore } from '../store/roomStore'

export type WallSide = 'negX' | 'posX' | 'negZ' | 'posZ'

/** Live opacities — mutated each frame, read by wall materials (no React re-render). */
export const wallFade = {
  negX: 1,
  posX: 1,
  negZ: 1,
  posZ: 1,
}

function softFade(dot: number): number {
  // Camera clearly on this exterior side → hide wall (Sims “walls down”)
  if (dot < 0.18) return 1
  if (dot > 0.55) return 0
  return 1 - (dot - 0.18) / 0.37
}

/**
 * Updates wallFade from camera position.
 * Mount once inside the Canvas (e.g. beside Room).
 */
export function WallFadeDriver() {
  const { camera } = useThree()
  const wallsAutoHide = useRoomStore((s) => s.wallsAutoHide)
  const wallMode = useRoomStore((s) => s.wallMode)
  const viewMode = useRoomStore((s) => s.viewMode)

  useFrame(() => {
    const enabled =
      wallsAutoHide && wallMode !== 'hidden' && viewMode === 'dollhouse'
    if (!enabled) {
      wallFade.negX = 1
      wallFade.posX = 1
      wallFade.negZ = 1
      wallFade.posZ = 1
      return
    }

    const x = camera.position.x
    const z = camera.position.z
    const len = Math.hypot(x, z) || 1
    const nx = x / len
    const nz = z / len

    wallFade.posX = softFade(nx)
    wallFade.negX = softFade(-nx)
    wallFade.posZ = softFade(nz)
    wallFade.negZ = softFade(-nz)
  })

  return null
}
