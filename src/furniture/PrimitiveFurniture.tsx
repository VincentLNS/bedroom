import type { PrimitiveKind } from '../catalog'
import { CELL_SIZE } from '../room/constants'

export type PrimitiveFurnitureProps = {
  kind: PrimitiveKind
  footprint: [number, number]
  tint?: string
  opacity?: number
}

const DEFAULT_TINT = '#c8d0d8'

function Mat({
  color,
  opacity = 1,
}: {
  color: string
  opacity?: number
}) {
  const transparent = opacity < 1
  return (
    <meshStandardMaterial
      color={color}
      transparent={transparent}
      opacity={opacity}
      depthWrite={!transparent}
    />
  )
}

/** Soft bevel: slightly smaller inset lid on top of a box. */
function SoftBox({
  args,
  position,
  color,
  opacity = 1,
}: {
  args: [number, number, number]
  position?: [number, number, number]
  color: string
  opacity?: number
}) {
  const [w, h, d] = args
  const inset = 0.04
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={args} />
        <Mat color={color} opacity={opacity} />
      </mesh>
      <mesh position={[0, h / 2 + 0.005, 0]} castShadow>
        <boxGeometry args={[w * (1 - inset), 0.02, d * (1 - inset)]} />
        <Mat color={color} opacity={opacity} />
      </mesh>
    </group>
  )
}

export function PrimitiveFurniture({
  kind,
  footprint,
  tint = DEFAULT_TINT,
  opacity = 1,
}: PrimitiveFurnitureProps) {
  const [fw, fd] = footprint
  const w = fw * CELL_SIZE
  const d = fd * CELL_SIZE

  switch (kind) {
    case 'bed': {
      const mattressH = 0.28
      const frameH = 0.12
      return (
        <group>
          <SoftBox
            args={[w * 0.98, frameH, d * 0.98]}
            position={[0, frameH / 2, 0]}
            color={tint}
            opacity={opacity}
          />
          <mesh position={[0, frameH + mattressH / 2, 0]} castShadow>
            <boxGeometry args={[w * 0.92, mattressH, d * 0.88]} />
            <Mat color="#f5f0ea" opacity={opacity} />
          </mesh>
          <mesh
            position={[0, frameH + mattressH + 0.06, -d * 0.32]}
            castShadow
          >
            <boxGeometry args={[w * 0.78, 0.12, d * 0.18]} />
            <Mat color="#efe4dc" opacity={opacity} />
          </mesh>
        </group>
      )
    }
    case 'desk': {
      const topH = 0.06
      const topY = 0.72
      const leg = 0.05
      return (
        <group>
          <mesh position={[0, topY, 0]} castShadow>
            <boxGeometry args={[w * 0.95, topH, d * 0.9]} />
            <Mat color={tint} opacity={opacity} />
          </mesh>
          {(
            [
              [-w * 0.38, d * 0.32],
              [w * 0.38, d * 0.32],
              [-w * 0.38, -d * 0.32],
              [w * 0.38, -d * 0.32],
            ] as const
          ).map(([x, z], i) => (
            <mesh key={i} position={[x, topY / 2, z]} castShadow>
              <boxGeometry args={[leg, topY, leg]} />
              <Mat color={tint} opacity={opacity} />
            </mesh>
          ))}
        </group>
      )
    }
    case 'chair': {
      const seatY = 0.42
      return (
        <group>
          <SoftBox
            args={[w * 0.72, 0.06, d * 0.72]}
            position={[0, seatY, 0]}
            color={tint}
            opacity={opacity}
          />
          <mesh position={[0, seatY + 0.28, -d * 0.28]} castShadow>
            <boxGeometry args={[w * 0.7, 0.5, 0.06]} />
            <Mat color={tint} opacity={opacity} />
          </mesh>
          {(
            [
              [-w * 0.28, d * 0.28],
              [w * 0.28, d * 0.28],
              [-w * 0.28, -d * 0.28],
              [w * 0.28, -d * 0.28],
            ] as const
          ).map(([x, z], i) => (
            <mesh key={i} position={[x, seatY / 2, z]} castShadow>
              <boxGeometry args={[0.04, seatY, 0.04]} />
              <Mat color={tint} opacity={opacity} />
            </mesh>
          ))}
        </group>
      )
    }
    case 'shelf': {
      const h = Math.max(0.9, fd >= 2 ? 1.4 : 1.1)
      return (
        <group>
          <SoftBox
            args={[w * 0.9, h, d * 0.7]}
            position={[0, h / 2, 0]}
            color={tint}
            opacity={opacity}
          />
          {[0.28, 0.55, 0.82].map((t) => (
            <mesh
              key={t}
              position={[0, h * t, d * 0.05]}
              castShadow
            >
              <boxGeometry args={[w * 0.82, 0.03, d * 0.55]} />
              <Mat color={tint} opacity={opacity} />
            </mesh>
          ))}
        </group>
      )
    }
    case 'chest': {
      const h = 0.55
      return (
        <group>
          <SoftBox
            args={[w * 0.9, h, d * 0.85]}
            position={[0, h / 2, 0]}
            color={tint}
            opacity={opacity}
          />
          <mesh position={[0, h + 0.02, 0]} castShadow>
            <boxGeometry args={[w * 0.92, 0.04, d * 0.88]} />
            <Mat color={tint} opacity={opacity} />
          </mesh>
        </group>
      )
    }
    case 'rug': {
      return (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.015, 0]}
          receiveShadow
        >
          <circleGeometry args={[Math.min(w, d) * 0.48, 32]} />
          <Mat color={tint} opacity={opacity} />
        </mesh>
      )
    }
    case 'lamp': {
      return (
        <group>
          <mesh position={[0, 0.05, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.14, 0.08, 16]} />
            <Mat color={tint} opacity={opacity} />
          </mesh>
          <mesh position={[0, 0.7, 0]} castShadow>
            <cylinderGeometry args={[0.025, 0.025, 1.3, 8]} />
            <Mat color={tint} opacity={opacity} />
          </mesh>
          <mesh position={[0, 1.45, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.22, 0.28, 16]} />
            <Mat color="#fff6e0" opacity={opacity} />
          </mesh>
        </group>
      )
    }
    case 'plant': {
      return (
        <group>
          <mesh position={[0, 0.12, 0]} castShadow>
            <cylinderGeometry args={[0.14, 0.11, 0.24, 16]} />
            <Mat color="#c4a882" opacity={opacity} />
          </mesh>
          <mesh position={[0, 0.42, 0]} castShadow>
            <sphereGeometry args={[0.22, 16, 12]} />
            <Mat color={tint} opacity={opacity} />
          </mesh>
          <mesh position={[0.1, 0.55, 0.05]} castShadow>
            <sphereGeometry args={[0.14, 12, 10]} />
            <Mat color={tint} opacity={opacity} />
          </mesh>
        </group>
      )
    }
    case 'toy': {
      const h = 0.7
      return (
        <group>
          <SoftBox
            args={[w * 0.85, h, d * 0.7]}
            position={[0, h / 2, 0]}
            color={tint}
            opacity={opacity}
          />
          <mesh position={[-w * 0.2, h * 0.55, d * 0.2]} castShadow>
            <boxGeometry args={[w * 0.25, h * 0.35, 0.04]} />
            <Mat color="#f0e8d8" opacity={opacity} />
          </mesh>
          <mesh position={[w * 0.2, h * 0.55, d * 0.2]} castShadow>
            <boxGeometry args={[w * 0.25, h * 0.35, 0.04]} />
            <Mat color="#f0e8d8" opacity={opacity} />
          </mesh>
        </group>
      )
    }
    case 'beanbag': {
      return (
        <mesh position={[0, 0.22, 0]} castShadow scale={[1, 0.7, 1]}>
          <sphereGeometry args={[Math.min(w, d) * 0.42, 24, 16]} />
          <Mat color={tint} opacity={opacity} />
        </mesh>
      )
    }
    case 'mirror': {
      const h = 1.4
      return (
        <group>
          <mesh position={[0, h / 2, 0]} castShadow>
            <boxGeometry args={[w * 0.55, h, 0.06]} />
            <Mat color={tint} opacity={opacity} />
          </mesh>
          <mesh position={[0, h / 2 + 0.05, 0.02]} castShadow>
            <boxGeometry args={[w * 0.42, h * 0.75, 0.02]} />
            <Mat color="#dce8f2" opacity={opacity} />
          </mesh>
        </group>
      )
    }
    case 'blocks': {
      const s = CELL_SIZE * 0.35
      return (
        <group>
          <mesh position={[-s * 0.6, s / 2, 0]} castShadow>
            <boxGeometry args={[s, s, s]} />
            <Mat color={tint} opacity={opacity} />
          </mesh>
          <mesh position={[s * 0.5, s / 2, s * 0.3]} castShadow>
            <boxGeometry args={[s * 0.9, s * 0.9, s * 0.9]} />
            <Mat color="#f0d080" opacity={opacity} />
          </mesh>
          <mesh position={[0, s * 1.2, -s * 0.2]} castShadow>
            <boxGeometry args={[s * 0.8, s * 0.8, s * 0.8]} />
            <Mat color="#a8d4e8" opacity={opacity} />
          </mesh>
        </group>
      )
    }
    default: {
      const _exhaustive: never = kind
      void _exhaustive
      return null
    }
  }
}
