/** Low-poly companion animals — bedroom + garden. */

import { Mat, type MatProps } from './MeshKit'

const BLACK = '#141418'
const WHITE = '#FFFAF5'
const CREAM = '#FFE8D0'
const PINK = '#FF8AB0'
const GOLD = '#F0B060'
const BROWN = '#A06828'
const HEDGE = '#7A6040'
const GREEN = '#4CB86A'
const YELLOW = '#FFE040'
const ORANGE = '#FF9040'
const BLUE = '#4AA0F0'

function Eye({
  position,
  scale = 1,
  m,
}: {
  position: [number, number, number]
  scale?: number
  m: MatProps
}) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow>
        <sphereGeometry args={[0.028, 10, 8]} />
        <Mat color={WHITE} {...m} />
      </mesh>
      <mesh position={[0, -0.002, 0.014]} castShadow>
        <sphereGeometry args={[0.018, 10, 8]} />
        <Mat color={BLACK} {...m} />
      </mesh>
    </group>
  )
}

/** Devon Rex — grandes oreilles, corps fin, robe noir & blanc. */
export function AnimalDevonRex({
  opacity = 1,
  selected = false,
}: MatProps) {
  const m = { opacity, selected }
  return (
    <group>
      {/* Corps assis */}
      <mesh position={[0, 0.1, 0.02]} castShadow scale={[0.85, 1, 1.05]}>
        <sphereGeometry args={[0.1, 14, 12]} />
        <Mat color={WHITE} {...m} />
      </mesh>
      {/* Tache noire flanc */}
      <mesh position={[0.06, 0.11, 0]} castShadow scale={[0.55, 0.7, 0.8]}>
        <sphereGeometry args={[0.08, 12, 10]} />
        <Mat color={BLACK} {...m} />
      </mesh>
      {/* Poitrine blanche */}
      <mesh position={[0, 0.1, 0.08]} castShadow scale={[0.55, 0.7, 0.35]}>
        <sphereGeometry args={[0.07, 10, 8]} />
        <Mat color={WHITE} {...m} />
      </mesh>
      {/* Tête (légèrement « wrinkly » via volumes) */}
      <mesh position={[0, 0.24, 0.04]} castShadow>
        <sphereGeometry args={[0.075, 14, 12]} />
        <Mat color={WHITE} {...m} />
      </mesh>
      <mesh position={[-0.03, 0.26, 0.02]} castShadow scale={[0.5, 0.45, 0.5]}>
        <sphereGeometry args={[0.04, 10, 8]} />
        <Mat color={BLACK} {...m} />
      </mesh>
      <mesh position={[0.035, 0.22, 0.05]} castShadow scale={[0.45, 0.4, 0.45]}>
        <sphereGeometry args={[0.035, 10, 8]} />
        <Mat color={BLACK} {...m} />
      </mesh>
      {/* Museau */}
      <mesh position={[0, 0.21, 0.1]} castShadow scale={[1, 0.7, 0.7]}>
        <sphereGeometry args={[0.032, 10, 8]} />
        <Mat color={PINK} {...m} />
      </mesh>
      <mesh position={[0, 0.225, 0.12]} castShadow>
        <sphereGeometry args={[0.012, 8, 6]} />
        <Mat color={BLACK} {...m} />
      </mesh>
      {/* Grandes oreilles Devon Rex (bat-like) */}
      {([-1, 1] as const).map((s) => (
        <group
          key={s}
          position={[s * 0.055, 0.32, 0.02]}
          rotation={[0.15, 0, s * 0.35]}
        >
          <mesh castShadow scale={[0.55, 1.35, 0.35]}>
            <sphereGeometry args={[0.055, 10, 8]} />
            <Mat color={s < 0 ? BLACK : WHITE} {...m} />
          </mesh>
          <mesh position={[0, 0.02, 0.01]} castShadow scale={[0.35, 0.9, 0.2]}>
            <sphereGeometry args={[0.04, 8, 6]} />
            <Mat color={PINK} {...m} />
          </mesh>
        </group>
      ))}
      <Eye position={[-0.028, 0.255, 0.1]} m={m} />
      <Eye position={[0.028, 0.255, 0.1]} m={m} />
      {/* Queue fine */}
      <mesh
        position={[0.02, 0.08, -0.12]}
        rotation={[0.9, 0.2, 0.3]}
        castShadow
        scale={[0.35, 1.2, 0.35]}
      >
        <sphereGeometry args={[0.05, 10, 8]} />
        <Mat color={BLACK} {...m} />
      </mesh>
      {/* Pattes avant */}
      {([-1, 1] as const).map((s) => (
        <mesh
          key={s}
          position={[s * 0.05, 0.04, 0.08]}
          castShadow
          scale={[0.5, 0.7, 0.7]}
        >
          <sphereGeometry args={[0.035, 8, 6]} />
          <Mat color={WHITE} {...m} />
        </mesh>
      ))}
    </group>
  )
}

export function AnimalPuppy({
  tint = GOLD,
  opacity = 1,
  selected = false,
}: MatProps & { tint?: string }) {
  const m = { opacity, selected }
  return (
    <group>
      <mesh position={[0, 0.1, 0]} castShadow scale={[1.1, 0.9, 1.2]}>
        <sphereGeometry args={[0.1, 14, 12]} />
        <Mat color={tint} {...m} />
      </mesh>
      <mesh position={[0, 0.22, 0.06]} castShadow>
        <sphereGeometry args={[0.08, 14, 12]} />
        <Mat color={tint} {...m} />
      </mesh>
      <mesh position={[0, 0.2, 0.12]} castShadow scale={[1, 0.7, 0.7]}>
        <sphereGeometry args={[0.04, 10, 8]} />
        <Mat color={CREAM} {...m} />
      </mesh>
      <mesh position={[0, 0.21, 0.14]} castShadow>
        <sphereGeometry args={[0.012, 8, 6]} />
        <Mat color={BLACK} {...m} />
      </mesh>
      {([-1, 1] as const).map((s) => (
        <mesh
          key={s}
          position={[s * 0.06, 0.26, 0]}
          rotation={[0.2, 0, s * 0.4]}
          castShadow
          scale={[0.45, 0.9, 0.3]}
        >
          <sphereGeometry args={[0.05, 10, 8]} />
          <Mat color={tint} {...m} />
        </mesh>
      ))}
      <Eye position={[-0.03, 0.24, 0.11]} scale={0.9} m={m} />
      <Eye position={[0.03, 0.24, 0.11]} scale={0.9} m={m} />
      <mesh
        position={[0, 0.1, -0.12]}
        rotation={[0.6, 0, 0]}
        castShadow
        scale={[0.4, 1, 0.4]}
      >
        <sphereGeometry args={[0.05, 10, 8]} />
        <Mat color={tint} {...m} />
      </mesh>
    </group>
  )
}

export function AnimalRabbit({
  tint = WHITE,
  opacity = 1,
  selected = false,
}: MatProps & { tint?: string }) {
  const m = { opacity, selected }
  return (
    <group>
      <mesh position={[0, 0.09, 0]} castShadow scale={[0.9, 1, 1]}>
        <sphereGeometry args={[0.09, 14, 12]} />
        <Mat color={tint} {...m} />
      </mesh>
      <mesh position={[0, 0.2, 0.04]} castShadow>
        <sphereGeometry args={[0.07, 14, 12]} />
        <Mat color={tint} {...m} />
      </mesh>
      <mesh position={[0, 0.18, 0.09]} castShadow scale={[1, 0.7, 0.7]}>
        <sphereGeometry args={[0.03, 10, 8]} />
        <Mat color={PINK} {...m} />
      </mesh>
      {([-1, 1] as const).map((s) => (
        <mesh
          key={s}
          position={[s * 0.03, 0.3, -0.01]}
          rotation={[0.25, 0, s * 0.15]}
          castShadow
          scale={[0.35, 1.5, 0.25]}
        >
          <sphereGeometry args={[0.045, 10, 8]} />
          <Mat color={tint} {...m} />
        </mesh>
      ))}
      <Eye position={[-0.025, 0.22, 0.09]} scale={0.85} m={m} />
      <Eye position={[0.025, 0.22, 0.09]} scale={0.85} m={m} />
      <mesh position={[0, 0.08, -0.08]} castShadow scale={[0.7, 0.7, 0.7]}>
        <sphereGeometry args={[0.04, 10, 8]} />
        <Mat color={tint} {...m} />
      </mesh>
    </group>
  )
}

export function AnimalDuck({
  opacity = 1,
  selected = false,
}: MatProps) {
  const m = { opacity, selected }
  return (
    <group>
      <mesh position={[0, 0.08, 0]} castShadow scale={[1.1, 0.85, 1.2]}>
        <sphereGeometry args={[0.09, 14, 12]} />
        <Mat color={YELLOW} {...m} />
      </mesh>
      <mesh position={[0, 0.18, 0.06]} castShadow>
        <sphereGeometry args={[0.06, 12, 10]} />
        <Mat color={YELLOW} {...m} />
      </mesh>
      <mesh position={[0, 0.17, 0.11]} castShadow rotation={[0.2, 0, 0]}>
        <boxGeometry args={[0.05, 0.02, 0.06]} />
        <Mat color={ORANGE} {...m} />
      </mesh>
      <Eye position={[-0.025, 0.2, 0.09]} scale={0.75} m={m} />
      <Eye position={[0.025, 0.2, 0.09]} scale={0.75} m={m} />
      <mesh
        position={[0, 0.1, -0.08]}
        rotation={[-0.4, 0, 0]}
        castShadow
        scale={[0.9, 0.35, 0.7]}
      >
        <sphereGeometry args={[0.06, 10, 8]} />
        <Mat color={YELLOW} {...m} />
      </mesh>
    </group>
  )
}

export function AnimalHedgehog({
  opacity = 1,
  selected = false,
}: MatProps) {
  const m = { opacity, selected }
  return (
    <group>
      <mesh position={[0, 0.08, 0]} castShadow scale={[1.15, 0.85, 1.1]}>
        <sphereGeometry args={[0.1, 14, 12]} />
        <Mat color={HEDGE} {...m} roughness={0.95} />
      </mesh>
      {/* Piquants */}
      {[
        [0, 0.14, 0],
        [-0.06, 0.12, 0.04],
        [0.06, 0.12, 0.04],
        [-0.05, 0.12, -0.04],
        [0.05, 0.12, -0.04],
        [0, 0.13, -0.06],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <coneGeometry args={[0.025, 0.06, 6]} />
          <Mat color={BROWN} {...m} />
        </mesh>
      ))}
      <mesh position={[0, 0.07, 0.09]} castShadow scale={[0.8, 0.7, 0.5]}>
        <sphereGeometry args={[0.05, 10, 8]} />
        <Mat color={CREAM} {...m} />
      </mesh>
      <mesh position={[0, 0.08, 0.12]} castShadow>
        <sphereGeometry args={[0.015, 8, 6]} />
        <Mat color={BLACK} {...m} />
      </mesh>
      <Eye position={[-0.03, 0.1, 0.11]} scale={0.7} m={m} />
      <Eye position={[0.03, 0.1, 0.11]} scale={0.7} m={m} />
    </group>
  )
}

export function AnimalFrog({
  opacity = 1,
  selected = false,
}: MatProps) {
  const m = { opacity, selected }
  return (
    <group>
      <mesh position={[0, 0.06, 0]} castShadow scale={[1.2, 0.7, 1]}>
        <sphereGeometry args={[0.08, 12, 10]} />
        <Mat color={GREEN} {...m} />
      </mesh>
      <mesh position={[-0.04, 0.12, 0.04]} castShadow>
        <sphereGeometry args={[0.035, 10, 8]} />
        <Mat color={GREEN} {...m} />
      </mesh>
      <mesh position={[0.04, 0.12, 0.04]} castShadow>
        <sphereGeometry args={[0.035, 10, 8]} />
        <Mat color={GREEN} {...m} />
      </mesh>
      <Eye position={[-0.04, 0.14, 0.06]} scale={0.8} m={m} />
      <Eye position={[0.04, 0.14, 0.06]} scale={0.8} m={m} />
      {([-1, 1] as const).map((s) => (
        <mesh
          key={s}
          position={[s * 0.08, 0.03, 0.02]}
          castShadow
          scale={[0.7, 0.4, 0.5]}
        >
          <sphereGeometry args={[0.04, 8, 6]} />
          <Mat color={GREEN} {...m} />
        </mesh>
      ))}
    </group>
  )
}

export function AnimalBird({
  tint = BLUE,
  opacity = 1,
  selected = false,
}: MatProps & { tint?: string }) {
  const m = { opacity, selected }
  return (
    <group>
      <mesh position={[0, 0.1, 0]} castShadow scale={[0.85, 1, 1.1]}>
        <sphereGeometry args={[0.07, 12, 10]} />
        <Mat color={tint} {...m} />
      </mesh>
      <mesh position={[0, 0.18, 0.03]} castShadow>
        <sphereGeometry args={[0.05, 12, 10]} />
        <Mat color={tint} {...m} />
      </mesh>
      <mesh position={[0, 0.17, 0.08]} castShadow>
        <coneGeometry args={[0.015, 0.04, 6]} />
        <Mat color={ORANGE} {...m} />
      </mesh>
      <Eye position={[-0.02, 0.19, 0.06]} scale={0.65} m={m} />
      <Eye position={[0.02, 0.19, 0.06]} scale={0.65} m={m} />
      {([-1, 1] as const).map((s) => (
        <mesh
          key={s}
          position={[s * 0.07, 0.1, 0]}
          rotation={[0, 0, s * 0.5]}
          castShadow
          scale={[0.3, 0.7, 0.9]}
        >
          <sphereGeometry args={[0.05, 10, 8]} />
          <Mat color={tint} {...m} />
        </mesh>
      ))}
      <mesh position={[0, 0.04, 0]} castShadow>
        <cylinderGeometry args={[0.008, 0.008, 0.04, 6]} />
        <Mat color={ORANGE} {...m} />
      </mesh>
    </group>
  )
}

export type AnimalKind =
  | 'animalDevonRex'
  | 'animalPuppy'
  | 'animalRabbit'
  | 'animalDuck'
  | 'animalHedgehog'
  | 'animalFrog'
  | 'animalBird'

export function AnimalMesh({
  kind,
  tint,
  opacity = 1,
  selected = false,
}: {
  kind: AnimalKind
  tint?: string
} & MatProps) {
  const props = { opacity, selected, tint }
  switch (kind) {
    case 'animalDevonRex':
      return <AnimalDevonRex {...props} />
    case 'animalPuppy':
      return <AnimalPuppy {...props} />
    case 'animalRabbit':
      return <AnimalRabbit {...props} />
    case 'animalDuck':
      return <AnimalDuck {...props} />
    case 'animalHedgehog':
      return <AnimalHedgehog {...props} />
    case 'animalFrog':
      return <AnimalFrog {...props} />
    case 'animalBird':
      return <AnimalBird {...props} />
  }
}
