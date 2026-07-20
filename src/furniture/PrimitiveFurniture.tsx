import type { PrimitiveKind } from '../catalog'
import { CELL_SIZE } from '../room/constants'

export type PrimitiveFurnitureProps = {
  kind: PrimitiveKind
  footprint: [number, number]
  tint?: string
  opacity?: number
  /** Mild emissive highlight when this instance is selected. */
  selected?: boolean
}

const DEFAULT_TINT = '#c8d0d8'
const SELECT_EMISSIVE = '#fff4dc'
const SELECT_EMISSIVE_INTENSITY = 0.35

const DUSTY_ROSE = '#C9899A'
const FLORAL_CREAM = '#F2E6D8'
const FLORAL_PINK = '#E8A8B8'
const OAK = '#D4B896'
const WHITE = '#FAF8F5'
const GREY = '#8A8E94'

function Mat({
  color,
  opacity = 1,
  selected = false,
}: {
  color: string
  opacity?: number
  selected?: boolean
}) {
  const transparent = opacity < 1
  return (
    <meshStandardMaterial
      color={color}
      transparent={transparent}
      opacity={opacity}
      depthWrite={!transparent}
      emissive={selected ? SELECT_EMISSIVE : '#000000'}
      emissiveIntensity={selected ? SELECT_EMISSIVE_INTENSITY : 0}
    />
  )
}

/** Soft bevel: slightly smaller inset lid on top of a box. */
function SoftBox({
  args,
  position,
  color,
  opacity = 1,
  selected = false,
}: {
  args: [number, number, number]
  position?: [number, number, number]
  color: string
  opacity?: number
  selected?: boolean
}) {
  const [w, h, d] = args
  const inset = 0.04
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={args} />
        <Mat color={color} opacity={opacity} selected={selected} />
      </mesh>
      <mesh position={[0, h / 2 + 0.005, 0]} castShadow>
        <boxGeometry args={[w * (1 - inset), 0.02, d * (1 - inset)]} />
        <Mat color={color} opacity={opacity} selected={selected} />
      </mesh>
    </group>
  )
}

function Knob({
  position,
  color = DUSTY_ROSE,
  opacity = 1,
  selected = false,
}: {
  position: [number, number, number]
  color?: string
  opacity?: number
  selected?: boolean
}) {
  return (
    <mesh position={position} castShadow>
      <sphereGeometry args={[0.025, 10, 8]} />
      <Mat color={color} opacity={opacity} selected={selected} />
    </mesh>
  )
}

export function PrimitiveFurniture({
  kind,
  footprint,
  tint = DEFAULT_TINT,
  opacity = 1,
  selected = false,
}: PrimitiveFurnitureProps) {
  const [fw, fd] = footprint
  const w = fw * CELL_SIZE
  const d = fd * CELL_SIZE
  const m = { opacity, selected }

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
            {...m}
          />
          <mesh position={[0, frameH + mattressH / 2, 0]} castShadow>
            <boxGeometry args={[w * 0.92, mattressH, d * 0.88]} />
            <Mat color="#f5f0ea" {...m} />
          </mesh>
          <mesh
            position={[0, frameH + mattressH + 0.06, -d * 0.32]}
            castShadow
          >
            <boxGeometry args={[w * 0.78, 0.12, d * 0.18]} />
            <Mat color="#efe4dc" {...m} />
          </mesh>
        </group>
      )
    }
    case 'bedLouise': {
      const frameH = 0.14
      const drawerH = 0.32
      const mattressH = 0.22
      const headH = 0.55
      return (
        <group>
          {/* White outer frame */}
          <mesh position={[0, frameH / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[w * 0.98, frameH, d * 0.98]} />
            <Mat color={WHITE} {...m} />
          </mesh>
          {/* Dusty-rose under drawers */}
          <mesh position={[0, frameH + drawerH / 2, 0]} castShadow>
            <boxGeometry args={[w * 0.9, drawerH, d * 0.88]} />
            <Mat color={DUSTY_ROSE} {...m} />
          </mesh>
          {/* Drawer seams */}
          {[-0.22, 0.22].map((zOff) => (
            <mesh
              key={zOff}
              position={[0, frameH + drawerH / 2, d * zOff]}
              castShadow
            >
              <boxGeometry args={[w * 0.02, drawerH * 0.85, 0.01]} />
              <Mat color="#B87888" {...m} />
            </mesh>
          ))}
          {/* Mattress + floral duvet */}
          <mesh position={[0, frameH + drawerH + mattressH / 2, 0]} castShadow>
            <boxGeometry args={[w * 0.88, mattressH, d * 0.82]} />
            <Mat color={FLORAL_CREAM} {...m} />
          </mesh>
          <mesh
            position={[0, frameH + drawerH + mattressH + 0.03, d * 0.05]}
            castShadow
          >
            <boxGeometry args={[w * 0.82, 0.06, d * 0.55]} />
            <Mat color={FLORAL_PINK} {...m} />
          </mesh>
          {/* Pillow */}
          <mesh
            position={[0, frameH + drawerH + mattressH + 0.08, -d * 0.32]}
            castShadow
          >
            <boxGeometry args={[w * 0.7, 0.12, d * 0.16]} />
            <Mat color="#E8D8C8" {...m} />
          </mesh>
          {/* White headboard */}
          <mesh
            position={[0, headH / 2, -d * 0.48]}
            castShadow
          >
            <boxGeometry args={[w * 0.95, headH, 0.05]} />
            <Mat color={WHITE} {...m} />
          </mesh>
          {/* Side shelf strip (dusty-rose top) */}
          <mesh position={[w * 0.42, 0.55, 0]} castShadow>
            <boxGeometry args={[0.12, 0.55, d * 0.85]} />
            <Mat color={WHITE} {...m} />
          </mesh>
          <mesh position={[w * 0.42, 0.84, 0]} castShadow>
            <boxGeometry args={[0.14, 0.03, d * 0.88]} />
            <Mat color={DUSTY_ROSE} {...m} />
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
            <Mat color={tint} {...m} />
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
              <Mat color={tint} {...m} />
            </mesh>
          ))}
        </group>
      )
    }
    case 'deskLouise': {
      const topY = 0.72
      return (
        <group>
          {/* White desktop */}
          <mesh position={[0, topY, 0]} castShadow>
            <boxGeometry args={[w * 0.95, 0.05, d * 0.9]} />
            <Mat color={WHITE} {...m} />
          </mesh>
          {/* Pink drawer pedestal */}
          <mesh position={[-w * 0.28, 0.36, 0]} castShadow>
            <boxGeometry args={[w * 0.35, 0.7, d * 0.78]} />
            <Mat color={DUSTY_ROSE} {...m} />
          </mesh>
          {[0.22, 0.4, 0.58].map((y) => (
            <mesh key={y} position={[-w * 0.28, y, d * 0.4]} castShadow>
              <boxGeometry args={[w * 0.28, 0.02, 0.02]} />
              <Mat color="#B87888" {...m} />
            </mesh>
          ))}
          {/* Legs / support */}
          <mesh position={[w * 0.32, topY / 2, d * 0.3]} castShadow>
            <boxGeometry args={[0.05, topY, 0.05]} />
            <Mat color={WHITE} {...m} />
          </mesh>
          <mesh position={[w * 0.32, topY / 2, -d * 0.3]} castShadow>
            <boxGeometry args={[0.05, topY, 0.05]} />
            <Mat color={WHITE} {...m} />
          </mesh>
          {/* Small hutch */}
          <mesh position={[0, topY + 0.22, -d * 0.28]} castShadow>
            <boxGeometry args={[w * 0.7, 0.4, 0.08]} />
            <Mat color={WHITE} {...m} />
          </mesh>
          <mesh position={[0, topY + 0.08, -d * 0.22]} castShadow>
            <boxGeometry args={[w * 0.65, 0.03, 0.18]} />
            <Mat color={WHITE} {...m} />
          </mesh>
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
            {...m}
          />
          <mesh position={[0, seatY + 0.28, -d * 0.28]} castShadow>
            <boxGeometry args={[w * 0.7, 0.5, 0.06]} />
            <Mat color={tint} {...m} />
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
              <Mat color={tint} {...m} />
            </mesh>
          ))}
        </group>
      )
    }
    case 'chairSwivel': {
      const seatY = 0.45
      return (
        <group>
          <mesh position={[0, seatY, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.2, 0.06, 20]} />
            <Mat color={tint} {...m} />
          </mesh>
          <mesh position={[0, seatY + 0.22, -0.12]} castShadow rotation={[0.15, 0, 0]}>
            <boxGeometry args={[0.32, 0.38, 0.05]} />
            <Mat color={tint} {...m} />
          </mesh>
          <mesh position={[0, 0.22, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 0.4, 8]} />
            <Mat color="#B0B0B0" {...m} />
          </mesh>
          {/* 5-star base */}
          {[0, 1, 2, 3, 4].map((i) => {
            const a = (i / 5) * Math.PI * 2
            return (
              <mesh
                key={i}
                position={[Math.cos(a) * 0.16, 0.04, Math.sin(a) * 0.16]}
                castShadow
              >
                <boxGeometry args={[0.22, 0.03, 0.04]} />
                <Mat color="#A8A8A8" {...m} />
              </mesh>
            )
          })}
        </group>
      )
    }
    case 'chairRattan': {
      const seatY = 0.28
      return (
        <group>
          <mesh position={[0, seatY, 0]} castShadow>
            <cylinderGeometry args={[0.16, 0.16, 0.04, 16]} />
            <Mat color={tint} {...m} />
          </mesh>
          {/* Arched back with spokes */}
          <mesh position={[0, seatY + 0.22, -0.14]} castShadow>
            <torusGeometry args={[0.16, 0.015, 8, 16, Math.PI]} />
            <Mat color={tint} {...m} />
          </mesh>
          {[-0.1, -0.05, 0, 0.05, 0.1].map((x) => (
            <mesh key={x} position={[x, seatY + 0.14, -0.14]} castShadow>
              <cylinderGeometry args={[0.008, 0.008, 0.22, 6]} />
              <Mat color={tint} {...m} />
            </mesh>
          ))}
          {(
            [
              [-0.12, 0.12],
              [0.12, 0.12],
              [-0.12, -0.12],
              [0.12, -0.12],
            ] as const
          ).map(([x, z], i) => (
            <mesh key={i} position={[x, seatY / 2, z]} castShadow>
              <cylinderGeometry args={[0.015, 0.015, seatY, 6]} />
              <Mat color={tint} {...m} />
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
            {...m}
          />
          {[0.28, 0.55, 0.82].map((t) => (
            <mesh key={t} position={[0, h * t, d * 0.05]} castShadow>
              <boxGeometry args={[w * 0.82, 0.03, d * 0.55]} />
              <Mat color={tint} {...m} />
            </mesh>
          ))}
        </group>
      )
    }
    case 'bookshelf': {
      const h = 1.55
      const bookColors = ['#E07070', '#70A0D0', '#E0C060', '#80C080', '#C080B0']
      return (
        <group>
          <SoftBox
            args={[w * 0.85, h, d * 0.75]}
            position={[0, h / 2, 0]}
            color={tint || OAK}
            {...m}
          />
          {[0.18, 0.38, 0.58, 0.78].map((t, si) => (
            <group key={t}>
              <mesh position={[0, h * t, d * 0.05]} castShadow>
                <boxGeometry args={[w * 0.75, 0.025, d * 0.55]} />
                <Mat color={tint || OAK} {...m} />
              </mesh>
              {bookColors.map((c, bi) => (
                <mesh
                  key={bi}
                  position={[
                    -w * 0.28 + bi * w * 0.14,
                    h * t + 0.08,
                    d * 0.08,
                  ]}
                  castShadow
                >
                  <boxGeometry
                    args={[0.04, 0.12 + (bi % 3) * 0.02, 0.08]}
                  />
                  <Mat color={c} {...m} />
                </mesh>
              ))}
              {si === 3 && (
                <mesh position={[0, h * t + 0.12, d * 0.1]} castShadow>
                  <boxGeometry args={[0.18, 0.2, 0.12]} />
                  <Mat color="#6B9AD4" {...m} />
                </mesh>
              )}
            </group>
          ))}
        </group>
      )
    }
    case 'wardrobe': {
      const h = 1.7
      const drawerH = 0.28
      return (
        <group>
          <SoftBox
            args={[w * 0.92, h, d * 0.78]}
            position={[0, h / 2, 0]}
            color={tint || OAK}
            {...m}
          />
          {/* Door split */}
          <mesh position={[0, drawerH + (h - drawerH) / 2, d * 0.4]} castShadow>
            <boxGeometry args={[0.015, h - drawerH - 0.08, 0.02]} />
            <Mat color="#C4A882" {...m} />
          </mesh>
          <Knob
            position={[-w * 0.12, drawerH + (h - drawerH) * 0.55, d * 0.42]}
            {...m}
          />
          <Knob
            position={[w * 0.12, drawerH + (h - drawerH) * 0.55, d * 0.42]}
            {...m}
          />
          {/* Base drawers */}
          <mesh position={[0, drawerH / 2, d * 0.02]} castShadow>
            <boxGeometry args={[w * 0.88, drawerH - 0.04, d * 0.7]} />
            <Mat color={tint || OAK} {...m} />
          </mesh>
          <mesh position={[0, drawerH * 0.5, d * 0.4]} castShadow>
            <boxGeometry args={[w * 0.86, 0.01, 0.01]} />
            <Mat color="#C4A882" {...m} />
          </mesh>
          <Knob position={[0, drawerH * 0.72, d * 0.42]} {...m} />
          <Knob position={[0, drawerH * 0.28, d * 0.42]} {...m} />
        </group>
      )
    }
    case 'trofast': {
      const h = 0.45
      const bins = Math.max(2, Math.floor(fw))
      return (
        <group>
          {/* Wood frame */}
          <SoftBox
            args={[w * 0.95, h, d * 0.85]}
            position={[0, h / 2, 0]}
            color={tint || OAK}
            {...m}
          />
          {Array.from({ length: bins }, (_, i) => {
            const x = -w * 0.35 + (i / Math.max(bins - 1, 1)) * w * 0.7
            return (
              <mesh
                key={i}
                position={[bins === 1 ? 0 : x, h * 0.42, d * 0.05]}
                castShadow
              >
                <boxGeometry args={[w * 0.22, h * 0.55, d * 0.55]} />
                <Mat color={WHITE} {...m} />
              </mesh>
            )
          })}
        </group>
      )
    }
    case 'chest': {
      const h = 0.45
      return (
        <group>
          <SoftBox
            args={[w * 0.95, h, d * 0.85]}
            position={[0, h / 2, 0]}
            color={tint}
            {...m}
          />
          <mesh position={[0, h + 0.02, 0]} castShadow>
            <boxGeometry args={[w * 0.97, 0.04, d * 0.88]} />
            <Mat color={tint} {...m} />
          </mesh>
          <Knob position={[0, h * 0.55, d * 0.44]} color="#D0D0D0" {...m} />
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
          <Mat color={tint} {...m} />
        </mesh>
      )
    }
    case 'rugHopscotch': {
      const cols = 2
      const rows = 3
      const cellW = (w * 0.9) / cols
      const cellD = (d * 0.9) / rows
      const cells: { x: number; z: number; n: number }[] = []
      let n = 1
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          cells.push({
            x: -w * 0.45 + cellW * (c + 0.5),
            z: -d * 0.45 + cellD * (r + 0.5),
            n: n++,
          })
        }
      }
      return (
        <group>
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.01, 0]}
            receiveShadow
          >
            <planeGeometry args={[w * 0.95, d * 0.95]} />
            <Mat color={tint} {...m} />
          </mesh>
          {cells.map((c) => (
            <mesh
              key={c.n}
              rotation={[-Math.PI / 2, 0, 0]}
              position={[c.x, 0.018, c.z]}
              receiveShadow
            >
              <planeGeometry args={[cellW * 0.85, cellD * 0.85]} />
              <Mat color={c.n % 2 === 0 ? '#F5C8D0' : '#F8D8E0'} {...m} />
            </mesh>
          ))}
        </group>
      )
    }
    case 'lamp': {
      return (
        <group>
          <mesh position={[0, 0.05, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.14, 0.08, 16]} />
            <Mat color={tint} {...m} />
          </mesh>
          <mesh position={[0, 0.7, 0]} castShadow>
            <cylinderGeometry args={[0.025, 0.025, 1.3, 8]} />
            <Mat color={tint} {...m} />
          </mesh>
          <mesh position={[0, 1.45, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.22, 0.28, 16]} />
            <Mat color="#fff6e0" {...m} />
          </mesh>
        </group>
      )
    }
    case 'lampRattan': {
      return (
        <group>
          <mesh position={[0, 0.04, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.12, 0.06, 16]} />
            <Mat color={tint} {...m} />
          </mesh>
          <mesh position={[0, 0.35, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} />
            <Mat color="#A88850" {...m} />
          </mesh>
          {/* Rattan globe shade */}
          <mesh position={[0, 0.75, 0]} castShadow>
            <sphereGeometry args={[0.2, 16, 12]} />
            <Mat color={tint} {...m} />
          </mesh>
          <mesh position={[0, 0.75, 0]}>
            <sphereGeometry args={[0.12, 12, 10]} />
            <Mat color="#FFF4D0" {...m} />
          </mesh>
        </group>
      )
    }
    case 'plant': {
      return (
        <group>
          <mesh position={[0, 0.12, 0]} castShadow>
            <cylinderGeometry args={[0.14, 0.11, 0.24, 16]} />
            <Mat color="#c4a882" {...m} />
          </mesh>
          <mesh position={[0, 0.42, 0]} castShadow>
            <sphereGeometry args={[0.22, 16, 12]} />
            <Mat color={tint} {...m} />
          </mesh>
          <mesh position={[0.1, 0.55, 0.05]} castShadow>
            <sphereGeometry args={[0.14, 12, 10]} />
            <Mat color={tint} {...m} />
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
            {...m}
          />
          <mesh position={[-w * 0.2, h * 0.55, d * 0.2]} castShadow>
            <boxGeometry args={[w * 0.25, h * 0.35, 0.04]} />
            <Mat color="#f0e8d8" {...m} />
          </mesh>
          <mesh position={[w * 0.2, h * 0.55, d * 0.2]} castShadow>
            <boxGeometry args={[w * 0.25, h * 0.35, 0.04]} />
            <Mat color="#f0e8d8" {...m} />
          </mesh>
        </group>
      )
    }
    case 'dollhouse': {
      const storey = 0.32
      const floors = 3
      const bodyH = storey * floors
      return (
        <group>
          {/* Stacked rooms */}
          {Array.from({ length: floors }, (_, i) => (
            <group key={i}>
              <mesh position={[0, storey * (i + 0.5), 0]} castShadow>
                <boxGeometry args={[w * 0.85, storey * 0.92, d * 0.7]} />
                <Mat color={tint || WHITE} {...m} />
              </mesh>
              {/* Floor plate */}
              <mesh position={[0, storey * (i + 1), 0]} castShadow>
                <boxGeometry args={[w * 0.88, 0.03, d * 0.72]} />
                <Mat color={OAK} {...m} />
              </mesh>
              {/* Window shutters */}
              <mesh
                position={[-w * 0.22, storey * (i + 0.5), d * 0.36]}
                castShadow
              >
                <boxGeometry args={[0.08, 0.14, 0.02]} />
                <Mat color={GREY} {...m} />
              </mesh>
              <mesh
                position={[w * 0.22, storey * (i + 0.5), d * 0.36]}
                castShadow
              >
                <boxGeometry args={[0.08, 0.14, 0.02]} />
                <Mat color={GREY} {...m} />
              </mesh>
            </group>
          ))}
          {/* Grey gabled roof */}
          <mesh position={[0, bodyH + 0.12, 0]} castShadow rotation={[0, 0, 0]}>
            <coneGeometry args={[w * 0.55, 0.28, 4]} />
            <Mat color={GREY} {...m} />
          </mesh>
        </group>
      )
    }
    case 'beanbag': {
      return (
        <mesh position={[0, 0.22, 0]} castShadow scale={[1, 0.7, 1]}>
          <sphereGeometry args={[Math.min(w, d) * 0.42, 24, 16]} />
          <Mat color={tint} {...m} />
        </mesh>
      )
    }
    case 'mirror': {
      const h = 1.4
      return (
        <group>
          <mesh position={[0, h / 2, 0]} castShadow>
            <boxGeometry args={[w * 0.55, h, 0.06]} />
            <Mat color={tint} {...m} />
          </mesh>
          <mesh position={[0, h / 2 + 0.05, 0.02]} castShadow>
            <boxGeometry args={[w * 0.42, h * 0.75, 0.02]} />
            <Mat color="#dce8f2" {...m} />
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
            <Mat color={tint} {...m} />
          </mesh>
          <mesh position={[s * 0.5, s / 2, s * 0.3]} castShadow>
            <boxGeometry args={[s * 0.9, s * 0.9, s * 0.9]} />
            <Mat color="#f0d080" {...m} />
          </mesh>
          <mesh position={[0, s * 1.2, -s * 0.2]} castShadow>
            <boxGeometry args={[s * 0.8, s * 0.8, s * 0.8]} />
            <Mat color="#a8d4e8" {...m} />
          </mesh>
        </group>
      )
    }
    case 'basket': {
      const r = Math.min(w, d) * 0.35
      return (
        <group>
          <mesh position={[0, 0.18, 0]} castShadow>
            <cylinderGeometry args={[r * 0.95, r * 0.75, 0.32, 16]} />
            <Mat color={tint} {...m} />
          </mesh>
          {/* Rim */}
          <mesh position={[0, 0.34, 0]} castShadow>
            <torusGeometry args={[r * 0.9, 0.02, 8, 20]} />
            <Mat color={tint} {...m} />
          </mesh>
          {/* Pompons hint */}
          {[-0.8, -0.4, 0, 0.4, 0.8].map((a, i) => (
            <mesh
              key={i}
              position={[
                Math.cos(a) * r * 0.95,
                0.36,
                Math.sin(a) * r * 0.95,
              ]}
              castShadow
            >
              <sphereGeometry args={[0.025, 8, 6]} />
              <Mat color="#F5F5F5" {...m} />
            </mesh>
          ))}
        </group>
      )
    }
    case 'plush': {
      return (
        <group>
          {/* Body */}
          <mesh position={[0, 0.16, 0]} castShadow scale={[1, 1.1, 0.85]}>
            <sphereGeometry args={[0.14, 16, 12]} />
            <Mat color={tint} {...m} />
          </mesh>
          {/* Head */}
          <mesh position={[0, 0.36, 0.02]} castShadow>
            <sphereGeometry args={[0.11, 16, 12]} />
            <Mat color={tint} {...m} />
          </mesh>
          {/* Ears */}
          <mesh position={[-0.08, 0.46, 0]} castShadow>
            <sphereGeometry args={[0.05, 10, 8]} />
            <Mat color={tint} {...m} />
          </mesh>
          <mesh position={[0.08, 0.46, 0]} castShadow>
            <sphereGeometry args={[0.05, 10, 8]} />
            <Mat color={tint} {...m} />
          </mesh>
          {/* Belly */}
          <mesh position={[0, 0.16, 0.1]} castShadow scale={[0.7, 0.8, 0.4]}>
            <sphereGeometry args={[0.1, 12, 10]} />
            <Mat color="#E8F0F8" {...m} />
          </mesh>
        </group>
      )
    }
    case 'lightbox': {
      return (
        <group>
          <SoftBox
            args={[0.38, 0.12, 0.1]}
            position={[0, 0.08, 0]}
            color={tint || WHITE}
            {...m}
          />
          {/* Pink letter bars spelling hint */}
          {[-0.12, -0.06, 0, 0.06, 0.12].map((x, i) => (
            <mesh key={i} position={[x, 0.1, 0.052]} castShadow>
              <boxGeometry args={[0.035, 0.055, 0.01]} />
              <Mat color={DUSTY_ROSE} {...m} />
            </mesh>
          ))}
        </group>
      )
    }
    case 'legoCamper': {
      return (
        <group>
          <mesh position={[0, 0.1, 0]} castShadow>
            <boxGeometry args={[0.32, 0.14, 0.18]} />
            <Mat color={tint || WHITE} {...m} />
          </mesh>
          <mesh position={[0.02, 0.22, 0]} castShadow>
            <boxGeometry args={[0.22, 0.12, 0.16]} />
            <Mat color="#D0E8F0" {...m} />
          </mesh>
          <mesh position={[-0.1, 0.05, 0.1]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 0.03, 12]} />
            <Mat color="#333" {...m} />
          </mesh>
          <mesh position={[0.1, 0.05, 0.1]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 0.03, 12]} />
            <Mat color="#333" {...m} />
          </mesh>
          <mesh position={[-0.1, 0.05, -0.1]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 0.03, 12]} />
            <Mat color="#333" {...m} />
          </mesh>
          <mesh position={[0.1, 0.05, -0.1]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 0.03, 12]} />
            <Mat color="#333" {...m} />
          </mesh>
        </group>
      )
    }
    case 'legoCluster': {
      return (
        <group>
          <mesh position={[-0.18, 0.12, 0]} castShadow>
            <boxGeometry args={[0.2, 0.22, 0.16]} />
            <Mat color="#F0C8D0" {...m} />
          </mesh>
          <mesh position={[-0.18, 0.28, 0]} castShadow>
            <coneGeometry args={[0.12, 0.12, 4]} />
            <Mat color="#E07070" {...m} />
          </mesh>
          <mesh position={[0.12, 0.08, 0.05]} castShadow>
            <boxGeometry args={[0.22, 0.14, 0.14]} />
            <Mat color="#70B0D0" {...m} />
          </mesh>
          <mesh position={[0.05, 0.06, -0.1]} castShadow>
            <boxGeometry args={[0.1, 0.1, 0.1]} />
            <Mat color="#F0D080" {...m} />
          </mesh>
          <mesh position={[0.2, 0.05, -0.05]} castShadow>
            <boxGeometry args={[0.08, 0.08, 0.08]} />
            <Mat color="#80C080" {...m} />
          </mesh>
        </group>
      )
    }
    case 'pirateShip': {
      return (
        <group>
          <mesh position={[0, 0.08, 0]} castShadow>
            <boxGeometry args={[0.28, 0.1, 0.12]} />
            <Mat color={tint} {...m} />
          </mesh>
          <mesh position={[0, 0.14, 0]} castShadow>
            <boxGeometry args={[0.22, 0.06, 0.1]} />
            <Mat color="#3A3A40" {...m} />
          </mesh>
          <mesh position={[0, 0.32, 0]} castShadow>
            <cylinderGeometry args={[0.012, 0.012, 0.3, 6]} />
            <Mat color="#8B6914" {...m} />
          </mesh>
          <mesh position={[0.04, 0.3, 0]} castShadow>
            <boxGeometry args={[0.12, 0.14, 0.02]} />
            <Mat color="#2A2A2E" {...m} />
          </mesh>
        </group>
      )
    }
    case 'camperVan': {
      return (
        <group>
          <mesh position={[0, 0.1, 0]} castShadow>
            <boxGeometry args={[0.3, 0.14, 0.16]} />
            <Mat color={tint} {...m} />
          </mesh>
          <mesh position={[0.02, 0.2, 0]} castShadow>
            <boxGeometry args={[0.2, 0.1, 0.14]} />
            <Mat color="#F8B0C0" {...m} />
          </mesh>
          <mesh position={[-0.08, 0.2, 0.08]} castShadow>
            <boxGeometry args={[0.06, 0.06, 0.01]} />
            <Mat color="#D0E8F8" {...m} />
          </mesh>
          {([-0.08, 0.08] as const).map((x) =>
            ([0.09, -0.09] as const).map((z) => (
              <mesh key={`${x}-${z}`} position={[x, 0.04, z]} castShadow>
                <cylinderGeometry args={[0.035, 0.035, 0.025, 10]} />
                <Mat color="#333" {...m} />
              </mesh>
            )),
          )}
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
