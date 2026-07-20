import { ContactShadows } from '@react-three/drei'
import { ROOM_DEPTH_M, ROOM_WIDTH_M } from './constants'

const SOCLE_H = 0.14
const MARGIN = 0.55

/**
 * Dollhouse stage — wood plinth under the bedroom.
 * Outer ground is the garden (OutdoorScenery); this only anchors the room.
 */
export function AtelierStage() {
  const socleW = ROOM_WIDTH_M + MARGIN * 2
  const socleD = ROOM_DEPTH_M + MARGIN * 2
  const floorY = -SOCLE_H

  return (
    <group>
      {/* Wood socle / plinth under the room */}
      <mesh position={[0, -SOCLE_H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[socleW, SOCLE_H, socleD]} />
        <meshStandardMaterial color="#cbb89f" roughness={0.9} />
      </mesh>
      {/* Light top slab (visible lip around the floor) */}
      <mesh position={[0, -0.01, 0]} receiveShadow>
        <boxGeometry args={[socleW + 0.04, 0.025, socleD + 0.04]} />
        <meshStandardMaterial color="#e8dcc8" roughness={0.85} />
      </mesh>
      {/* Soft bevel under-edge */}
      <mesh position={[0, -SOCLE_H + 0.02, 0]} receiveShadow>
        <boxGeometry args={[socleW + 0.12, 0.04, socleD + 0.12]} />
        <meshStandardMaterial color="#b8a88e" roughness={0.95} />
      </mesh>

      <ContactShadows
        position={[0, floorY + 0.002, 0]}
        opacity={0.45}
        scale={16}
        blur={2.8}
        far={6}
        color="#3d5a3a"
      />
    </group>
  )
}

export const ATELIER_FLOOR_Y = -SOCLE_H
