/** Low-poly companion animals — bedroom + garden.
 * All meshes are grounded: lowest contact ≈ y = 0 (no floating).
 */

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

/** Soft paw pad sitting on the ground plane. */
function Paw({
  position,
  color,
  m,
  scale = 1,
}: {
  position: [number, number, number]
  color: string
  m: MatProps
  scale?: number
}) {
  return (
    <mesh position={position} castShadow scale={scale}>
      <sphereGeometry args={[0.028, 8, 6]} />
      <Mat color={color} {...m} />
    </mesh>
  )
}

/** Devon Rex — grandes oreilles, corps fin, robe noir & blanc. Assis au sol. */
export function AnimalDevonRex({
  opacity = 1,
  selected = false,
}: MatProps) {
  const m = { opacity, selected }
  return (
    <group>
      {/* Hanches / base au sol */}
      <mesh position={[0, 0.055, 0]} castShadow scale={[1.05, 0.75, 1.1]}>
        <sphereGeometry args={[0.09, 14, 12]} />
        <Mat color={WHITE} {...m} />
      </mesh>
      {/* Torse */}
      <mesh position={[0, 0.12, 0.02]} castShadow scale={[0.85, 0.95, 1]}>
        <sphereGeometry args={[0.09, 14, 12]} />
        <Mat color={WHITE} {...m} />
      </mesh>
      <mesh position={[0.055, 0.12, 0]} castShadow scale={[0.5, 0.65, 0.75]}>
        <sphereGeometry args={[0.075, 12, 10]} />
        <Mat color={BLACK} {...m} />
      </mesh>
      <mesh position={[0, 0.11, 0.075]} castShadow scale={[0.55, 0.65, 0.35]}>
        <sphereGeometry args={[0.065, 10, 8]} />
        <Mat color={WHITE} {...m} />
      </mesh>
      {/* Tête */}
      <mesh position={[0, 0.23, 0.04]} castShadow>
        <sphereGeometry args={[0.072, 14, 12]} />
        <Mat color={WHITE} {...m} />
      </mesh>
      <mesh position={[-0.028, 0.245, 0.02]} castShadow scale={[0.5, 0.45, 0.5]}>
        <sphereGeometry args={[0.038, 10, 8]} />
        <Mat color={BLACK} {...m} />
      </mesh>
      <mesh position={[0.032, 0.21, 0.05]} castShadow scale={[0.45, 0.4, 0.45]}>
        <sphereGeometry args={[0.032, 10, 8]} />
        <Mat color={BLACK} {...m} />
      </mesh>
      <mesh position={[0, 0.205, 0.095]} castShadow scale={[1, 0.7, 0.7]}>
        <sphereGeometry args={[0.03, 10, 8]} />
        <Mat color={PINK} {...m} />
      </mesh>
      <mesh position={[0, 0.215, 0.115]} castShadow>
        <sphereGeometry args={[0.011, 8, 6]} />
        <Mat color={BLACK} {...m} />
      </mesh>
      {([-1, 1] as const).map((s) => (
        <group
          key={s}
          position={[s * 0.052, 0.305, 0.02]}
          rotation={[0.15, 0, s * 0.35]}
        >
          <mesh castShadow scale={[0.55, 1.35, 0.35]}>
            <sphereGeometry args={[0.052, 10, 8]} />
            <Mat color={s < 0 ? BLACK : WHITE} {...m} />
          </mesh>
          <mesh position={[0, 0.02, 0.01]} castShadow scale={[0.35, 0.9, 0.2]}>
            <sphereGeometry args={[0.038, 8, 6]} />
            <Mat color={PINK} {...m} />
          </mesh>
        </group>
      ))}
      <Eye position={[-0.026, 0.245, 0.095]} m={m} />
      <Eye position={[0.026, 0.245, 0.095]} m={m} />
      {/* Queue */}
      <mesh
        position={[0.02, 0.07, -0.11]}
        rotation={[0.85, 0.2, 0.3]}
        castShadow
        scale={[0.35, 1.15, 0.35]}
      >
        <sphereGeometry args={[0.048, 10, 8]} />
        <Mat color={BLACK} {...m} />
      </mesh>
      {/* Pattes avant + arrières au sol */}
      <Paw position={[-0.045, 0.022, 0.07]} color={WHITE} m={m} />
      <Paw position={[0.045, 0.022, 0.07]} color={WHITE} m={m} />
      <Paw position={[-0.05, 0.02, -0.04]} color={WHITE} m={m} scale={1.05} />
      <Paw position={[0.05, 0.02, -0.04]} color={BLACK} m={m} scale={1.05} />
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
      {/* Ventre au sol */}
      <mesh position={[0, 0.07, 0]} castShadow scale={[1.15, 0.85, 1.25]}>
        <sphereGeometry args={[0.095, 14, 12]} />
        <Mat color={tint} {...m} />
      </mesh>
      <mesh position={[0, 0.18, 0.05]} castShadow>
        <sphereGeometry args={[0.078, 14, 12]} />
        <Mat color={tint} {...m} />
      </mesh>
      <mesh position={[0, 0.165, 0.11]} castShadow scale={[1, 0.7, 0.7]}>
        <sphereGeometry args={[0.038, 10, 8]} />
        <Mat color={CREAM} {...m} />
      </mesh>
      <mesh position={[0, 0.175, 0.13]} castShadow>
        <sphereGeometry args={[0.011, 8, 6]} />
        <Mat color={BLACK} {...m} />
      </mesh>
      {([-1, 1] as const).map((s) => (
        <mesh
          key={s}
          position={[s * 0.055, 0.22, -0.01]}
          rotation={[0.25, 0, s * 0.45]}
          castShadow
          scale={[0.45, 0.95, 0.3]}
        >
          <sphereGeometry args={[0.048, 10, 8]} />
          <Mat color={tint} {...m} />
        </mesh>
      ))}
      <Eye position={[-0.028, 0.2, 0.1]} scale={0.9} m={m} />
      <Eye position={[0.028, 0.2, 0.1]} scale={0.9} m={m} />
      {/* Queue */}
      <mesh
        position={[0, 0.09, -0.12]}
        rotation={[0.55, 0, 0]}
        castShadow
        scale={[0.4, 1, 0.4]}
      >
        <sphereGeometry args={[0.045, 10, 8]} />
        <Mat color={tint} {...m} />
      </mesh>
      {/* Quatre pattes */}
      <Paw position={[-0.05, 0.022, 0.06]} color={CREAM} m={m} />
      <Paw position={[0.05, 0.022, 0.06]} color={CREAM} m={m} />
      <Paw position={[-0.055, 0.02, -0.05]} color={tint} m={m} scale={1.1} />
      <Paw position={[0.055, 0.02, -0.05]} color={tint} m={m} scale={1.1} />
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
      <mesh position={[0, 0.065, 0]} castShadow scale={[0.95, 0.9, 1.05]}>
        <sphereGeometry args={[0.085, 14, 12]} />
        <Mat color={tint} {...m} />
      </mesh>
      <mesh position={[0, 0.17, 0.035]} castShadow>
        <sphereGeometry args={[0.068, 14, 12]} />
        <Mat color={tint} {...m} />
      </mesh>
      <mesh position={[0, 0.155, 0.085]} castShadow scale={[1, 0.7, 0.7]}>
        <sphereGeometry args={[0.028, 10, 8]} />
        <Mat color={PINK} {...m} />
      </mesh>
      {([-1, 1] as const).map((s) => (
        <mesh
          key={s}
          position={[s * 0.028, 0.27, -0.01]}
          rotation={[0.2, 0, s * 0.12]}
          castShadow
          scale={[0.35, 1.45, 0.25]}
        >
          <sphereGeometry args={[0.042, 10, 8]} />
          <Mat color={tint} {...m} />
        </mesh>
      ))}
      <Eye position={[-0.024, 0.19, 0.085]} scale={0.85} m={m} />
      <Eye position={[0.024, 0.19, 0.085]} scale={0.85} m={m} />
      {/* Pompon */}
      <mesh position={[0, 0.07, -0.085]} castShadow scale={[0.75, 0.75, 0.75]}>
        <sphereGeometry args={[0.038, 10, 8]} />
        <Mat color={tint} {...m} />
      </mesh>
      <Paw position={[-0.04, 0.02, 0.05]} color={PINK} m={m} scale={0.9} />
      <Paw position={[0.04, 0.02, 0.05]} color={PINK} m={m} scale={0.9} />
      <Paw position={[-0.045, 0.018, -0.035]} color={tint} m={m} />
      <Paw position={[0.045, 0.018, -0.035]} color={tint} m={m} />
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
      {/* Corps bas — ventre touche presque le sol */}
      <mesh position={[0, 0.055, 0]} castShadow scale={[1.15, 0.8, 1.25]}>
        <sphereGeometry args={[0.085, 14, 12]} />
        <Mat color={YELLOW} {...m} />
      </mesh>
      <mesh position={[0, 0.145, 0.05]} castShadow>
        <sphereGeometry args={[0.058, 12, 10]} />
        <Mat color={YELLOW} {...m} />
      </mesh>
      <mesh position={[0, 0.135, 0.1]} castShadow rotation={[0.15, 0, 0]}>
        <boxGeometry args={[0.048, 0.018, 0.055]} />
        <Mat color={ORANGE} {...m} />
      </mesh>
      <Eye position={[-0.022, 0.16, 0.08]} scale={0.75} m={m} />
      <Eye position={[0.022, 0.16, 0.08]} scale={0.75} m={m} />
      {/* Queue */}
      <mesh
        position={[0, 0.08, -0.08]}
        rotation={[-0.35, 0, 0]}
        castShadow
        scale={[0.9, 0.35, 0.7]}
      >
        <sphereGeometry args={[0.055, 10, 8]} />
        <Mat color={YELLOW} {...m} />
      </mesh>
      {/* Pattes palmées au sol */}
      {([-1, 1] as const).map((s) => (
        <mesh
          key={s}
          position={[s * 0.035, 0.012, 0.04]}
          castShadow
          rotation={[0, s * 0.2, 0]}
        >
          <boxGeometry args={[0.04, 0.012, 0.055]} />
          <Mat color={ORANGE} {...m} />
        </mesh>
      ))}
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
      <mesh position={[0, 0.055, 0]} castShadow scale={[1.2, 0.8, 1.15]}>
        <sphereGeometry args={[0.095, 14, 12]} />
        <Mat color={HEDGE} {...m} roughness={0.95} />
      </mesh>
      {[
        [0, 0.11, 0],
        [-0.055, 0.1, 0.035],
        [0.055, 0.1, 0.035],
        [-0.045, 0.1, -0.04],
        [0.045, 0.1, -0.04],
        [0, 0.11, -0.055],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <coneGeometry args={[0.022, 0.055, 6]} />
          <Mat color={BROWN} {...m} />
        </mesh>
      ))}
      <mesh position={[0, 0.05, 0.085]} castShadow scale={[0.85, 0.7, 0.5]}>
        <sphereGeometry args={[0.048, 10, 8]} />
        <Mat color={CREAM} {...m} />
      </mesh>
      <mesh position={[0, 0.055, 0.11]} castShadow>
        <sphereGeometry args={[0.014, 8, 6]} />
        <Mat color={BLACK} {...m} />
      </mesh>
      <Eye position={[-0.028, 0.075, 0.1]} scale={0.7} m={m} />
      <Eye position={[0.028, 0.075, 0.1]} scale={0.7} m={m} />
      <Paw position={[-0.05, 0.018, 0.05]} color={CREAM} m={m} scale={0.85} />
      <Paw position={[0.05, 0.018, 0.05]} color={CREAM} m={m} scale={0.85} />
      <Paw position={[-0.05, 0.016, -0.04]} color={HEDGE} m={m} scale={0.9} />
      <Paw position={[0.05, 0.016, -0.04]} color={HEDGE} m={m} scale={0.9} />
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
      <mesh position={[0, 0.045, 0]} castShadow scale={[1.25, 0.7, 1.05]}>
        <sphereGeometry args={[0.075, 12, 10]} />
        <Mat color={GREEN} {...m} />
      </mesh>
      <mesh position={[-0.038, 0.095, 0.035]} castShadow>
        <sphereGeometry args={[0.032, 10, 8]} />
        <Mat color={GREEN} {...m} />
      </mesh>
      <mesh position={[0.038, 0.095, 0.035]} castShadow>
        <sphereGeometry args={[0.032, 10, 8]} />
        <Mat color={GREEN} {...m} />
      </mesh>
      <Eye position={[-0.038, 0.11, 0.055]} scale={0.8} m={m} />
      <Eye position={[0.038, 0.11, 0.055]} scale={0.8} m={m} />
      {/* Grosses pattes arrière au sol */}
      {([-1, 1] as const).map((s) => (
        <mesh
          key={`b-${s}`}
          position={[s * 0.07, 0.018, -0.02]}
          castShadow
          scale={[0.85, 0.45, 0.7]}
        >
          <sphereGeometry args={[0.038, 8, 6]} />
          <Mat color={GREEN} {...m} />
        </mesh>
      ))}
      {/* Pattes avant */}
      {([-1, 1] as const).map((s) => (
        <mesh
          key={`f-${s}`}
          position={[s * 0.045, 0.015, 0.055]}
          castShadow
          scale={[0.6, 0.4, 0.55]}
        >
          <sphereGeometry args={[0.03, 8, 6]} />
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
      <mesh position={[0, 0.075, 0]} castShadow scale={[0.9, 1, 1.1]}>
        <sphereGeometry args={[0.065, 12, 10]} />
        <Mat color={tint} {...m} />
      </mesh>
      <mesh position={[0, 0.14, 0.025]} castShadow>
        <sphereGeometry args={[0.048, 12, 10]} />
        <Mat color={tint} {...m} />
      </mesh>
      <mesh position={[0, 0.135, 0.07]} castShadow rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.014, 0.038, 6]} />
        <Mat color={ORANGE} {...m} />
      </mesh>
      <Eye position={[-0.018, 0.15, 0.055]} scale={0.65} m={m} />
      <Eye position={[0.018, 0.15, 0.055]} scale={0.65} m={m} />
      {([-1, 1] as const).map((s) => (
        <mesh
          key={s}
          position={[s * 0.065, 0.075, 0]}
          rotation={[0, 0, s * 0.55]}
          castShadow
          scale={[0.28, 0.65, 0.85]}
        >
          <sphereGeometry args={[0.048, 10, 8]} />
          <Mat color={tint} {...m} />
        </mesh>
      ))}
      {/* Deux pattes + petits pieds au sol */}
      {([-1, 1] as const).map((s) => (
        <group key={`leg-${s}`} position={[s * 0.018, 0, 0.01]}>
          <mesh position={[0, 0.025, 0]} castShadow>
            <cylinderGeometry args={[0.006, 0.006, 0.04, 6]} />
            <Mat color={ORANGE} {...m} />
          </mesh>
          <mesh position={[0, 0.008, 0.012]} castShadow>
            <boxGeometry args={[0.022, 0.008, 0.028]} />
            <Mat color={ORANGE} {...m} />
          </mesh>
        </group>
      ))}
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
