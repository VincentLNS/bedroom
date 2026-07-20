/**
 * Jardin tout autour de la chambre — pelouse, arbres, collines, ciel doux.
 * Visible en orbit 360° et à travers la fenêtre (+Z).
 */

import { ROOM_DEPTH_M, ROOM_HEIGHT_M, ROOM_WIDTH_M } from './constants'

const FOLIAGE_A = '#6FA87A'
const FOLIAGE_B = '#5A9468'
const FOLIAGE_C = '#8FBF88'
const FOLIAGE_D = '#7CB08A'
const TRUNK = '#8B6B4A'
const GRASS = '#8FBC7A'
const GRASS_DARK = '#7AA86A'
const HILL = '#A8C99A'
const HILL_B = '#9CB890'
const SKY_TOP = '#B8D8F0'
const SKY_MID = '#D6EAF8'
const SKY_LOW = '#E8F2DC'
const BUSH = '#6B9E6E'

function Tree({
  position,
  scale = 1,
  foliage = FOLIAGE_A,
}: {
  position: [number, number, number]
  scale?: number
  foliage?: string
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.09, 0.9, 8]} />
        <meshStandardMaterial color={TRUNK} roughness={0.95} />
      </mesh>
      <mesh position={[0, 1.15, 0]} castShadow>
        <sphereGeometry args={[0.42, 14, 12]} />
        <meshStandardMaterial color={foliage} roughness={0.9} />
      </mesh>
      <mesh position={[-0.22, 1.0, 0.1]} castShadow>
        <sphereGeometry args={[0.28, 12, 10]} />
        <meshStandardMaterial color={FOLIAGE_B} roughness={0.9} />
      </mesh>
      <mesh position={[0.24, 1.05, -0.08]} castShadow>
        <sphereGeometry args={[0.3, 12, 10]} />
        <meshStandardMaterial color={FOLIAGE_C} roughness={0.9} />
      </mesh>
      <mesh position={[0.05, 1.45, 0.05]} castShadow>
        <sphereGeometry args={[0.26, 12, 10]} />
        <meshStandardMaterial color={foliage} roughness={0.9} />
      </mesh>
    </group>
  )
}

function Bush({
  position,
  scale = 1,
}: {
  position: [number, number, number]
  scale?: number
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.18, 0]} castShadow>
        <sphereGeometry args={[0.22, 12, 10]} />
        <meshStandardMaterial color={BUSH} roughness={0.95} />
      </mesh>
      <mesh position={[0.14, 0.14, 0.06]} castShadow>
        <sphereGeometry args={[0.16, 10, 8]} />
        <meshStandardMaterial color={FOLIAGE_C} roughness={0.95} />
      </mesh>
      <mesh position={[-0.12, 0.15, -0.05]} castShadow>
        <sphereGeometry args={[0.14, 10, 8]} />
        <meshStandardMaterial color={FOLIAGE_B} roughness={0.95} />
      </mesh>
    </group>
  )
}

/** Soft sky + hills on one cardinal direction. */
function SkyWall({
  position,
  rotationY,
}: {
  position: [number, number, number]
  rotationY: number
}) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, ROOM_HEIGHT_M * 0.55, 0]}>
        <planeGeometry args={[28, 10]} />
        <meshBasicMaterial color={SKY_MID} />
      </mesh>
      <mesh position={[0, ROOM_HEIGHT_M * 1.2, -0.05]}>
        <planeGeometry args={[28, 4]} />
        <meshBasicMaterial color={SKY_TOP} />
      </mesh>
      <mesh position={[0, 0.4, -0.1]}>
        <planeGeometry args={[28, 2.8]} />
        <meshBasicMaterial color={SKY_LOW} />
      </mesh>
    </group>
  )
}

export function OutdoorScenery() {
  const halfW = ROOM_WIDTH_M / 2
  const halfD = ROOM_DEPTH_M / 2
  // Clearance past walls so trees sit outside the room box
  const margin = 1.1
  const near = {
    n: -halfD - margin,
    s: halfD + margin,
    w: -halfW - margin,
    e: halfW + margin,
  }

  const trees: {
    position: [number, number, number]
    scale: number
    foliage: string
  }[] = [
    // Window side (+Z) — framed by the glass
    { position: [-1.1, 0, near.s + 0.3], scale: 1.15, foliage: FOLIAGE_A },
    { position: [0.15, 0, near.s + 0.75], scale: 1.35, foliage: FOLIAGE_C },
    { position: [1.05, 0, near.s + 0.15], scale: 1.0, foliage: FOLIAGE_B },
    { position: [-0.45, 0, near.s + 1.4], scale: 0.85, foliage: FOLIAGE_B },
    { position: [0.7, 0, near.s + 1.55], scale: 0.95, foliage: FOLIAGE_A },
    { position: [-2.2, 0, near.s + 1.0], scale: 1.05, foliage: FOLIAGE_D },
    { position: [2.1, 0, near.s + 1.2], scale: 0.9, foliage: FOLIAGE_C },
    // Door side (−Z)
    { position: [-1.6, 0, near.n - 0.4], scale: 1.1, foliage: FOLIAGE_B },
    { position: [0.4, 0, near.n - 0.9], scale: 1.25, foliage: FOLIAGE_A },
    { position: [1.8, 0, near.n - 0.35], scale: 0.95, foliage: FOLIAGE_C },
    { position: [-0.6, 0, near.n - 1.6], scale: 0.8, foliage: FOLIAGE_D },
    { position: [2.4, 0, near.n - 1.3], scale: 1.0, foliage: FOLIAGE_B },
    // West (−X)
    { position: [near.w - 0.3, 0, -1.5], scale: 1.2, foliage: FOLIAGE_A },
    { position: [near.w - 0.7, 0, 0.3], scale: 1.0, foliage: FOLIAGE_C },
    { position: [near.w - 0.4, 0, 1.8], scale: 1.15, foliage: FOLIAGE_B },
    { position: [near.w - 1.4, 0, -0.6], scale: 0.85, foliage: FOLIAGE_D },
    { position: [near.w - 1.1, 0, 2.4], scale: 0.9, foliage: FOLIAGE_A },
    // East (+X)
    { position: [near.e + 0.35, 0, -1.2], scale: 1.1, foliage: FOLIAGE_C },
    { position: [near.e + 0.6, 0, 0.5], scale: 1.3, foliage: FOLIAGE_A },
    { position: [near.e + 0.25, 0, 2.0], scale: 0.95, foliage: FOLIAGE_B },
    { position: [near.e + 1.3, 0, -0.2], scale: 0.85, foliage: FOLIAGE_D },
    { position: [near.e + 1.0, 0, 1.5], scale: 1.05, foliage: FOLIAGE_C },
    // Corners further out
    { position: [near.w - 2.2, 0, near.n - 2.0], scale: 1.4, foliage: FOLIAGE_B },
    { position: [near.e + 2.0, 0, near.n - 1.8], scale: 1.25, foliage: FOLIAGE_A },
    { position: [near.w - 1.8, 0, near.s + 2.2], scale: 1.15, foliage: FOLIAGE_C },
    { position: [near.e + 2.2, 0, near.s + 2.0], scale: 1.35, foliage: FOLIAGE_D },
  ]

  const bushes: [number, number, number, number][] = [
    [near.w - 0.15, 0, -2.4, 0.9],
    [near.w - 0.2, 0, 0.9, 0.75],
    [near.e + 0.2, 0, -2.0, 0.85],
    [near.e + 0.15, 0, 1.2, 0.7],
    [-2.0, 0, near.n - 0.2, 0.8],
    [1.4, 0, near.n - 0.15, 0.65],
    [-1.8, 0, near.s + 0.2, 0.75],
    [1.9, 0, near.s + 0.25, 0.7],
  ]

  return (
    <group>
      {/* Pelouse étendue autour (sous le socle, visible en orbit) */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.025, 0]}
        receiveShadow
      >
        <planeGeometry args={[42, 42]} />
        <meshStandardMaterial color={GRASS} roughness={1} />
      </mesh>
      {/* Anneau plus foncé pour la profondeur */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <ringGeometry args={[9, 20, 64]} />
        <meshBasicMaterial color={GRASS_DARK} transparent opacity={0.35} />
      </mesh>

      {/* Ciel sur les 4 côtés */}
      <SkyWall position={[0, 0, 16]} rotationY={0} />
      <SkyWall position={[0, 0, -16]} rotationY={Math.PI} />
      <SkyWall position={[-16, 0, 0]} rotationY={Math.PI / 2} />
      <SkyWall position={[16, 0, 0]} rotationY={-Math.PI / 2} />

      {/* Collines douces autour */}
      <mesh position={[-3.2, 0.5, near.s + 3.2]} scale={[1.6, 0.65, 1]}>
        <sphereGeometry args={[1.2, 16, 12]} />
        <meshStandardMaterial color={HILL} roughness={1} />
      </mesh>
      <mesh position={[2.8, 0.42, near.s + 3.5]} scale={[1.3, 0.55, 1]}>
        <sphereGeometry args={[1.1, 16, 12]} />
        <meshStandardMaterial color={HILL_B} roughness={1} />
      </mesh>
      <mesh position={[-2.5, 0.48, near.n - 3.0]} scale={[1.5, 0.6, 1]}>
        <sphereGeometry args={[1.15, 16, 12]} />
        <meshStandardMaterial color={HILL_B} roughness={1} />
      </mesh>
      <mesh position={[3.0, 0.4, near.n - 3.2]} scale={[1.35, 0.55, 1]}>
        <sphereGeometry args={[1.05, 16, 12]} />
        <meshStandardMaterial color={HILL} roughness={1} />
      </mesh>
      <mesh position={[near.w - 3.0, 0.45, 0.5]} scale={[1.2, 0.58, 1.4]}>
        <sphereGeometry args={[1.1, 16, 12]} />
        <meshStandardMaterial color={HILL} roughness={1} />
      </mesh>
      <mesh position={[near.e + 3.2, 0.42, -0.8]} scale={[1.25, 0.55, 1.3]}>
        <sphereGeometry args={[1.05, 16, 12]} />
        <meshStandardMaterial color={HILL_B} roughness={1} />
      </mesh>

      {trees.map((t, i) => (
        <Tree
          key={i}
          position={t.position}
          scale={t.scale}
          foliage={t.foliage}
        />
      ))}

      {bushes.map(([x, y, z, s], i) => (
        <Bush key={i} position={[x, y, z]} scale={s} />
      ))}

      {/* Touches de fleurs / cailloux (petites sphères colorées) */}
      {(
        [
          [-halfW - 0.7, 0.04, 0.2, '#E8A0B0'],
          [halfW + 0.65, 0.04, -0.4, '#F0D060'],
          [0.3, 0.04, -halfD - 0.7, '#E07070'],
          [-0.5, 0.04, halfD + 0.65, '#D0A0E8'],
          [halfW + 0.9, 0.04, 1.5, '#70A0D0'],
          [-halfW - 0.85, 0.04, -1.6, '#F0A060'],
        ] as const
      ).map(([x, y, z, c], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[0.05, 8, 6]} />
          <meshStandardMaterial color={c} roughness={0.85} />
        </mesh>
      ))}

      {/* Lumière jardin (fenêtre + ambiance) */}
      <directionalLight
        position={[0.5, 3.5, near.s + 2]}
        intensity={0.45}
        color="#fff4d8"
      />
      <pointLight
        position={[0, 2.2, near.s + 0.4]}
        intensity={0.3}
        color="#ffe9b8"
        distance={8}
        decay={2}
      />
      <hemisphereLight args={['#d8ecff', '#8fbc7a', 0.25]} />
    </group>
  )
}
