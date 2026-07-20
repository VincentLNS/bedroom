import type { PrimitiveKind } from '../catalog'
import { CELL_SIZE } from '../room/constants'
import { ExtraPrimitive, type ExtraKind } from './ExtraPrimitives'
import {
  BarHandle,
  DUSTY_ROSE,
  FLORAL_CREAM,
  FLORAL_PINK,
  GOLD,
  Knob,
  Mat,
  OAK,
  Plinth,
  SoftBox,
  WHITE,
  CHROME,
} from './MeshKit'
import { DollhouseMesh } from './Dollhouse'
import { AnimalMesh, type AnimalKind } from './Animals'
import { StylishPrimitive, type StylishKind } from './StylishPrimitives'
import { PlushAngel, PlushStitch } from './PlushToys'

export type PrimitiveFurnitureProps = {
  kind: PrimitiveKind
  footprint: [number, number]
  tint?: string
  opacity?: number
  selected?: boolean
}

/** Fallback only when a primitive kind truly has no palette of its own. */
const DEFAULT_TINT = '#E8A0B0'

const STYLISH_KINDS = new Set<string>([
  'vanityPink',
  'starMobile',
  'mushroomLamp',
  'rainbowShelf',
  'musicBox',
  'fairyLights',
  'toyCastle',
  'dreamcatcher',
  'toySlide',
  'gardenSwing',
  'miniTrampoline',
  'cloudShelf',
])

const ANIMAL_KINDS = new Set<string>([
  'animalDevonRex',
  'animalPuppy',
  'animalRabbit',
  'animalDuck',
  'animalHedgehog',
  'animalFrog',
  'animalBird',
])

const EXTRA_KINDS = new Set<string>([
  'nightstand',
  'dresser',
  'canopyBed',
  'stool',
  'easel',
  'playTent',
  'teepee',
  'rockingHorse',
  'plushBear',
  'plushUnicorn',
  'plushDino',
  'trainSet',
  'ball',
  'scooter',
  'xylophone',
  'globe',
  'nightLight',
  'toyKitchen',
  'laundryHamper',
  'floorLamp',
  'booksStack',
  'crayonBox',
  'dollPram',
  'cloudRug',
  'pouf',
  'photoFrame',
  'floorMattress',
])

export function PrimitiveFurniture({
  kind,
  footprint,
  tint = DEFAULT_TINT,
  opacity = 1,
  selected = false,
}: PrimitiveFurnitureProps) {
  if (STYLISH_KINDS.has(kind)) {
    return (
      <StylishPrimitive
        kind={kind as StylishKind}
        footprint={footprint}
        tint={tint}
        opacity={opacity}
        selected={selected}
      />
    )
  }

  if (ANIMAL_KINDS.has(kind)) {
    return (
      <AnimalMesh
        kind={kind as AnimalKind}
        tint={tint}
        opacity={opacity}
        selected={selected}
      />
    )
  }

  if (EXTRA_KINDS.has(kind)) {
    return (
      <ExtraPrimitive
        kind={kind as ExtraKind}
        footprint={footprint}
        tint={tint}
        opacity={opacity}
        selected={selected}
      />
    )
  }

  const [fw, fd] = footprint
  const w = fw * CELL_SIZE
  const d = fd * CELL_SIZE
  const m = { opacity, selected }

  switch (kind) {
    case 'bed': {
      const frameH = 0.1
      const mattressH = 0.22
      const headH = 0.48
      return (
        <group>
          <mesh position={[0, frameH / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[w * 0.96, frameH, d * 0.96]} />
            <Mat color={tint} {...m} />
          </mesh>
          <mesh position={[0, frameH + mattressH / 2, 0]} castShadow>
            <boxGeometry args={[w * 0.9, mattressH, d * 0.86]} />
            <Mat color="#F5F0EA" {...m} />
          </mesh>
          <mesh position={[0, frameH + mattressH + 0.035, d * 0.08]} castShadow>
            <boxGeometry args={[w * 0.84, 0.07, d * 0.55]} />
            <Mat color={tint} {...m} />
          </mesh>
          <mesh
            position={[-w * 0.18, frameH + mattressH + 0.09, -d * 0.32]}
            castShadow
          >
            <boxGeometry args={[w * 0.32, 0.1, d * 0.14]} />
            <Mat color="#EFE4DC" {...m} />
          </mesh>
          <mesh
            position={[w * 0.18, frameH + mattressH + 0.09, -d * 0.32]}
            castShadow
          >
            <boxGeometry args={[w * 0.32, 0.1, d * 0.14]} />
            <Mat color="#EFE4DC" {...m} />
          </mesh>
          <mesh position={[0, headH / 2, -d * 0.48]} castShadow>
            <boxGeometry args={[w * 0.92, headH, 0.05]} />
            <Mat color={tint} {...m} />
          </mesh>
          <mesh position={[0, 0.18, d * 0.48]} castShadow>
            <boxGeometry args={[w * 0.9, 0.28, 0.04]} />
            <Mat color={tint} {...m} />
          </mesh>
        </group>
      )
    }

    case 'bedLouise': {
      // Headboard −Z, drawers + shelf −X (into room when bed hugs +X wall).
      const frameH = 0.12
      const drawerH = 0.34
      const mattressH = 0.22
      const topY = frameH + drawerH + mattressH // ~0.68
      const headH = 0.72
      const knobs = DUSTY_ROSE
      return (
        <group>
          <mesh position={[0, frameH / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[w * 0.98, frameH, d * 0.98]} />
            <Mat color={WHITE} {...m} />
          </mesh>
          {/* Drawer block — fronts face −X (room side) */}
          <mesh position={[0, frameH + drawerH / 2, 0]} castShadow>
            <boxGeometry args={[w * 0.82, drawerH, d * 0.9]} />
            <Mat color={DUSTY_ROSE} {...m} />
          </mesh>
          {[-0.28, 0, 0.28].map((zOff) => (
            <group key={zOff}>
              <mesh
                position={[-w * 0.42, frameH + drawerH / 2, d * zOff]}
                castShadow
              >
                <boxGeometry args={[0.02, drawerH * 0.28, d * 0.22]} />
                <Mat color="#B87888" {...m} />
              </mesh>
              <Knob
                position={[-w * 0.45, frameH + drawerH / 2, d * zOff]}
                color={knobs}
                radius={0.032}
                {...m}
              />
            </group>
          ))}
          <mesh position={[0, frameH + drawerH + mattressH / 2, 0]} castShadow>
            <boxGeometry args={[w * 0.88, mattressH, d * 0.82]} />
            <Mat color={FLORAL_CREAM} {...m} />
          </mesh>
          {/* Floral duvet fold */}
          <mesh position={[0, topY + 0.04, d * 0.06]} castShadow>
            <boxGeometry args={[w * 0.84, 0.08, d * 0.58]} />
            <Mat color={FLORAL_PINK} {...m} />
          </mesh>
          {/* Flower dots */}
          {[
            [-0.18, 0.1],
            [0.12, -0.05],
            [-0.05, 0.2],
            [0.2, 0.15],
          ].map(([x, z], i) => (
            <mesh
              key={i}
              position={[x * w, topY + 0.09, z * d]}
              castShadow
            >
              <sphereGeometry args={[0.025, 8, 6]} />
              <Mat color={i % 2 ? '#A8C8E8' : '#E07090'} {...m} />
            </mesh>
          ))}
          <mesh position={[0, topY + 0.1, -d * 0.32]} castShadow>
            <boxGeometry args={[w * 0.72, 0.14, d * 0.16]} />
            <Mat color="#E8D8C8" {...m} />
          </mesh>
          {/* Tall white headboard with rose cap (−Z) */}
          <mesh position={[0, headH / 2, -d * 0.48]} castShadow>
            <boxGeometry args={[w * 0.95, headH, 0.055]} />
            <Mat color={WHITE} {...m} />
          </mesh>
          <mesh position={[0, headH - 0.03, -d * 0.48]} castShadow>
            <boxGeometry args={[w * 0.98, 0.05, 0.07]} />
            <Mat color={DUSTY_ROSE} {...m} />
          </mesh>
          {/* Side shelf column — room side (−X) */}
          <mesh position={[-w * 0.44, 0.42, 0]} castShadow>
            <boxGeometry args={[0.11, 0.84, d * 0.82]} />
            <Mat color={WHITE} {...m} />
          </mesh>
          <mesh position={[-w * 0.44, 0.86, 0]} castShadow>
            <boxGeometry args={[0.14, 0.035, d * 0.86]} />
            <Mat color={DUSTY_ROSE} {...m} />
          </mesh>
          <mesh position={[-w * 0.44, 0.9, -d * 0.2]} castShadow>
            <boxGeometry args={[0.06, 0.08, 0.04]} />
            <Mat color="#70A0D0" {...m} />
          </mesh>
        </group>
      )
    }

    case 'desk': {
      const topY = 0.72
      return (
        <group>
          <mesh position={[0, topY, 0]} castShadow>
            <boxGeometry args={[w * 0.96, 0.05, d * 0.92]} />
            <Mat color={tint} {...m} />
          </mesh>
          <mesh position={[0, topY - 0.04, 0]} castShadow>
            <boxGeometry args={[w * 0.9, 0.03, d * 0.86]} />
            <Mat color={tint} {...m} />
          </mesh>
          {/* Center drawer */}
          <mesh position={[0, topY - 0.12, d * 0.28]} castShadow>
            <boxGeometry args={[w * 0.4, 0.1, 0.06]} />
            <Mat color={tint} {...m} />
          </mesh>
          <BarHandle position={[0, topY - 0.12, d * 0.32]} width={0.1} {...m} />
          {/* Modesty + legs */}
          <mesh position={[0, 0.35, -d * 0.35]} castShadow>
            <boxGeometry args={[w * 0.85, 0.55, 0.03]} />
            <Mat color={tint} {...m} />
          </mesh>
          {(
            [
              [-w * 0.4, d * 0.35],
              [w * 0.4, d * 0.35],
              [-w * 0.4, -d * 0.35],
              [w * 0.4, -d * 0.35],
            ] as const
          ).map(([x, z], i) => (
            <mesh key={i} position={[x, topY / 2, z]} castShadow>
              <boxGeometry args={[0.05, topY, 0.05]} />
              <Mat color={tint} {...m} />
            </mesh>
          ))}
        </group>
      )
    }

    case 'deskLouise': {
      // Photo: white top, pink mat, left pink drawer, right stack, white hutch
      const topY = 0.72
      return (
        <group>
          <mesh position={[0, topY, 0]} castShadow>
            <boxGeometry args={[w * 0.96, 0.05, d * 0.92]} />
            <Mat color={WHITE} {...m} />
          </mesh>
          {/* Pink desk mat */}
          <mesh position={[0, topY + 0.028, 0.02]} castShadow>
            <boxGeometry args={[w * 0.55, 0.01, d * 0.55]} />
            <Mat color={FLORAL_PINK} {...m} />
          </mesh>
          {/* Left pink pedestal — 3 drawers */}
          <mesh position={[-w * 0.3, 0.36, 0]} castShadow>
            <boxGeometry args={[w * 0.32, 0.7, d * 0.8]} />
            <Mat color={DUSTY_ROSE} {...m} />
          </mesh>
          {[0.18, 0.36, 0.54].map((y) => (
            <group key={y}>
              <mesh position={[-w * 0.3, y, d * 0.42]} castShadow>
                <boxGeometry args={[w * 0.28, 0.015, 0.015]} />
                <Mat color="#B87888" {...m} />
              </mesh>
              <Knob
                position={[-w * 0.3, y, d * 0.44]}
                color={DUSTY_ROSE}
                radius={0.022}
                {...m}
              />
            </group>
          ))}
          {/* Right support + strawberry drawer hint */}
          <mesh position={[w * 0.32, 0.5, 0]} castShadow>
            <boxGeometry args={[w * 0.28, 0.42, d * 0.75]} />
            <Mat color="#E8D8D0" {...m} />
          </mesh>
          <mesh position={[w * 0.32, 0.62, d * 0.4]} castShadow>
            <boxGeometry args={[w * 0.24, 0.1, 0.04]} />
            <Mat color={WHITE} {...m} />
          </mesh>
          <mesh position={[w * 0.32, 0.62, d * 0.43]} castShadow>
            <sphereGeometry args={[0.02, 8, 6]} />
            <Mat color="#E07070" {...m} />
          </mesh>
          <mesh position={[w * 0.32, 0.18, d * 0.3]} castShadow>
            <boxGeometry args={[0.05, 0.36, 0.05]} />
            <Mat color={WHITE} {...m} />
          </mesh>
          <mesh position={[w * 0.32, 0.18, -d * 0.3]} castShadow>
            <boxGeometry args={[0.05, 0.36, 0.05]} />
            <Mat color={WHITE} {...m} />
          </mesh>
          {/* Hutch organizer */}
          <mesh position={[0, topY + 0.2, -d * 0.32]} castShadow>
            <boxGeometry args={[w * 0.72, 0.38, 0.1]} />
            <Mat color={WHITE} {...m} />
          </mesh>
          <mesh position={[-w * 0.12, topY + 0.12, -d * 0.22]} castShadow>
            <boxGeometry args={[w * 0.2, 0.12, 0.16]} />
            <Mat color="#E8D8C8" {...m} />
          </mesh>
          <mesh position={[w * 0.14, topY + 0.18, -d * 0.22]} castShadow>
            <boxGeometry args={[w * 0.18, 0.22, 0.14]} />
            <Mat color={WHITE} {...m} />
          </mesh>
          {/* Cubbies dividers */}
          <mesh position={[0, topY + 0.2, -d * 0.28]} castShadow>
            <boxGeometry args={[0.02, 0.32, 0.08]} />
            <Mat color="#E0D8D0" {...m} />
          </mesh>
        </group>
      )
    }

    case 'chair': {
      const seatY = 0.42
      return (
        <group>
          <SoftBox
            args={[w * 0.7, 0.07, d * 0.7]}
            position={[0, seatY, 0]}
            color={tint}
            {...m}
          />
          <mesh
            position={[0, seatY + 0.26, -d * 0.28]}
            rotation={[0.12, 0, 0]}
            castShadow
          >
            <boxGeometry args={[w * 0.68, 0.48, 0.05]} />
            <Mat color={tint} {...m} />
          </mesh>
          <mesh position={[0, 0.18, -d * 0.28]} castShadow>
            <boxGeometry args={[w * 0.55, 0.04, 0.04]} />
            <Mat color={tint} {...m} />
          </mesh>
          {(
            [
              [-w * 0.26, d * 0.26],
              [w * 0.26, d * 0.26],
              [-w * 0.26, -d * 0.26],
              [w * 0.26, -d * 0.26],
            ] as const
          ).map(([x, z], i) => (
            <mesh key={i} position={[x, seatY / 2, z]} castShadow>
              <boxGeometry args={[0.045, seatY, 0.045]} />
              <Mat color={tint} {...m} />
            </mesh>
          ))}
        </group>
      )
    }

    case 'chairSwivel': {
      // Photo: white shell seat, chrome 5-star base with casters
      const seatY = 0.46
      return (
        <group>
          <mesh position={[0, seatY, 0]} castShadow>
            <cylinderGeometry args={[0.17, 0.2, 0.07, 24]} />
            <Mat color={tint} {...m} />
          </mesh>
          {/* Shell back */}
          <mesh
            position={[0, seatY + 0.2, -0.1]}
            rotation={[0.35, 0, 0]}
            castShadow
            scale={[1, 1.15, 0.45]}
          >
            <sphereGeometry args={[0.2, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
            <Mat color={tint} {...m} />
          </mesh>
          <mesh position={[0, 0.28, 0]} castShadow>
            <cylinderGeometry args={[0.028, 0.035, 0.32, 10]} />
            <Mat color={CHROME} {...m} metalness={0.7} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0.12, 0]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 0.08, 10]} />
            <Mat color="#2A2A2E" {...m} />
          </mesh>
          {[0, 1, 2, 3, 4].map((i) => {
            const a = (i / 5) * Math.PI * 2
            const x = Math.cos(a) * 0.2
            const z = Math.sin(a) * 0.2
            return (
              <group key={i}>
                <mesh
                  position={[x * 0.55, 0.045, z * 0.55]}
                  rotation={[0, -a, 0]}
                  castShadow
                >
                  <boxGeometry args={[0.2, 0.025, 0.04]} />
                  <Mat color={CHROME} {...m} metalness={0.65} roughness={0.3} />
                </mesh>
                <mesh position={[x, 0.035, z]} castShadow>
                  <sphereGeometry args={[0.035, 10, 8]} />
                  <Mat color="#1A1A1E" {...m} />
                </mesh>
              </group>
            )
          })}
        </group>
      )
    }

    case 'chairRattan': {
      const seatY = 0.3
      const rattan = tint || GOLD
      const dark = '#A88850'
      return (
        <group>
          <mesh position={[0, seatY, 0]} castShadow>
            <cylinderGeometry args={[0.17, 0.15, 0.05, 20]} />
            <Mat color={rattan} {...m} />
          </mesh>
          {/* Weave bands on seat */}
          <mesh position={[0, seatY + 0.03, 0]} castShadow>
            <torusGeometry args={[0.1, 0.012, 6, 20]} />
            <Mat color={dark} {...m} />
          </mesh>
          {/* Full hoop back */}
          <mesh
            position={[0, seatY + 0.2, -0.02]}
            rotation={[Math.PI / 2.2, 0, 0]}
            castShadow
          >
            <torusGeometry args={[0.2, 0.018, 8, 24]} />
            <Mat color={rattan} {...m} />
          </mesh>
          {[-0.12, -0.06, 0, 0.06, 0.12].map((x) => (
            <mesh
              key={x}
              position={[x, seatY + 0.18, -0.12]}
              castShadow
            >
              <cylinderGeometry args={[0.01, 0.01, 0.28, 6]} />
              <Mat color={rattan} {...m} />
            </mesh>
          ))}
          {(
            [
              [-0.13, 0.13],
              [0.13, 0.13],
              [-0.13, -0.13],
              [0.13, -0.13],
            ] as const
          ).map(([x, z], i) => (
            <mesh key={i} position={[x, seatY / 2, z]} castShadow>
              <cylinderGeometry args={[0.018, 0.014, seatY, 6]} />
              <Mat color={rattan} {...m} />
            </mesh>
          ))}
        </group>
      )
    }

    case 'shelf': {
      const h = Math.max(0.9, fd >= 2 ? 1.35 : 1.05)
      const wall = 0.035
      return (
        <group>
          <mesh position={[0, h / 2, -d * 0.28]} castShadow>
            <boxGeometry args={[w * 0.88, h, wall]} />
            <Mat color={tint} {...m} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh
              key={s}
              position={[s * w * 0.42, h / 2, 0]}
              castShadow
            >
              <boxGeometry args={[wall, h, d * 0.65]} />
              <Mat color={tint} {...m} />
            </mesh>
          ))}
          {[0.08, 0.35, 0.62, 0.9].map((t) => (
            <mesh key={t} position={[0, h * t, 0]} castShadow>
              <boxGeometry args={[w * 0.8, 0.03, d * 0.6]} />
              <Mat color={tint} {...m} />
            </mesh>
          ))}
        </group>
      )
    }

    case 'bookshelf': {
      const h = 1.55
      const caseW = w * 0.9
      const caseD = d * 0.82
      const wall = 0.04
      const oak = tint || OAK
      const bookColors = [
        '#E07070',
        '#70A0D0',
        '#E0C060',
        '#80C080',
        '#C080B0',
        '#D4886A',
        '#6B9AD4',
        '#F0A060',
      ]
      const shelfYs = [0.1, 0.42, 0.74, 1.06, 1.38]
      return (
        <group>
          <mesh position={[0, h / 2, -caseD / 2 + wall / 2]} castShadow>
            <boxGeometry args={[caseW, h, wall]} />
            <Mat color={oak} {...m} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh
              key={s}
              position={[s * (caseW / 2 - wall / 2), h / 2, 0]}
              castShadow
            >
              <boxGeometry args={[wall, h, caseD]} />
              <Mat color={oak} {...m} />
            </mesh>
          ))}
          <mesh position={[0, wall / 2, 0]} castShadow>
            <boxGeometry args={[caseW, wall, caseD]} />
            <Mat color={oak} {...m} />
          </mesh>
          <mesh position={[0, h - wall / 2, 0]} castShadow>
            <boxGeometry args={[caseW, wall, caseD]} />
            <Mat color={oak} {...m} />
          </mesh>
          {/* Crown */}
          <mesh position={[0, h + 0.015, 0]} castShadow>
            <boxGeometry args={[caseW * 1.05, 0.03, caseD * 1.05]} />
            <Mat color="#C4A882" {...m} />
          </mesh>
          {shelfYs.slice(0, 4).map((sy, si) => (
            <group key={sy}>
              <mesh position={[0, sy, 0]} castShadow>
                <boxGeometry
                  args={[caseW - wall * 2, 0.03, caseD - wall]}
                />
                <Mat color={oak} {...m} />
              </mesh>
              {bookColors.slice(0, 6).map((c, bi) => {
                const bookW = 0.032 + (bi % 3) * 0.01
                const bookH = 0.15 + (bi % 4) * 0.03
                const span = caseW - wall * 2.5
                const x = -span / 2 + bookW / 2 + bi * (span / 6.5)
                return (
                  <mesh
                    key={`${si}-${bi}`}
                    position={[x, sy + 0.02 + bookH / 2, caseD * 0.05]}
                    castShadow
                  >
                    <boxGeometry args={[bookW, bookH, 0.11]} />
                    <Mat color={c} {...m} />
                  </mesh>
                )
              })}
              {si === 0 && (
                <mesh position={[0, sy + 0.12, caseD * 0.05]} castShadow>
                  <boxGeometry args={[0.12, 0.14, 0.1]} />
                  <Mat color="#70B0E0" {...m} />
                </mesh>
              )}
            </group>
          ))}
        </group>
      )
    }

    case 'wardrobe': {
      // Photo: oak, 2 doors, 2 bottom drawers, round mauve knobs
      const h = 1.7
      const drawerH = 0.32
      const body = tint || OAK
      const knob = '#9A7A8A'
      return (
        <group>
          <Plinth w={w * 0.95} d={d * 0.8} color="#C4A882" {...m} />
          <mesh position={[0, drawerH / 2 + 0.04, 0]} castShadow>
            <boxGeometry args={[w * 0.92, drawerH, d * 0.78]} />
            <Mat color={body} {...m} />
          </mesh>
          {[-0.2, 0.2].map((xOff) => (
            <group key={xOff}>
              <mesh
                position={[w * xOff, 0.12, d * 0.4]}
                castShadow
              >
                <boxGeometry args={[w * 0.4, drawerH * 0.38, 0.02]} />
                <Mat color="#C4A882" {...m} />
              </mesh>
              <Knob
                position={[w * xOff, 0.12, d * 0.43]}
                color={knob}
                radius={0.035}
                {...m}
              />
              <mesh
                position={[w * xOff, 0.28, d * 0.4]}
                castShadow
              >
                <boxGeometry args={[w * 0.4, drawerH * 0.38, 0.02]} />
                <Mat color="#C4A882" {...m} />
              </mesh>
              <Knob
                position={[w * xOff, 0.28, d * 0.43]}
                color={knob}
                radius={0.035}
                {...m}
              />
            </group>
          ))}
          {/* Door carcass */}
          <mesh position={[0, drawerH + (h - drawerH) / 2 + 0.02, 0]} castShadow>
            <boxGeometry args={[w * 0.92, h - drawerH - 0.02, d * 0.78]} />
            <Mat color={body} {...m} />
          </mesh>
          {/* Door gap */}
          <mesh
            position={[0, drawerH + (h - drawerH) / 2 + 0.02, d * 0.4]}
            castShadow
          >
            <boxGeometry args={[0.02, h - drawerH - 0.1, 0.025]} />
            <Mat color="#B89870" {...m} />
          </mesh>
          {[-0.2, 0.2].map((xOff) => (
            <Knob
              key={xOff}
              position={[
                w * xOff,
                drawerH + (h - drawerH) * 0.55,
                d * 0.42,
              ]}
              color={knob}
              radius={0.038}
              {...m}
            />
          ))}
        </group>
      )
    }

    case 'trofast': {
      // Open rail frame + white trapezoid bins
      const h = 0.45
      const bins = Math.max(2, Math.min(4, Math.floor(fw)))
      const frame = tint || OAK
      return (
        <group>
          {/* Corner posts */}
          {(
            [
              [-w * 0.42, -d * 0.35],
              [w * 0.42, -d * 0.35],
              [-w * 0.42, d * 0.35],
              [w * 0.42, d * 0.35],
            ] as const
          ).map(([x, z], i) => (
            <mesh key={i} position={[x, h / 2, z]} castShadow>
              <boxGeometry args={[0.045, h, 0.045]} />
              <Mat color={frame} {...m} />
            </mesh>
          ))}
          {/* Top + rails */}
          <mesh position={[0, h - 0.02, 0]} castShadow>
            <boxGeometry args={[w * 0.9, 0.04, d * 0.78]} />
            <Mat color={frame} {...m} />
          </mesh>
          <mesh position={[0, 0.08, 0]} castShadow>
            <boxGeometry args={[w * 0.88, 0.03, d * 0.72]} />
            <Mat color={frame} {...m} />
          </mesh>
          {Array.from({ length: bins }, (_, i) => {
            const span = w * 0.78
            const bw = span / bins - 0.04
            const x = -span / 2 + bw / 2 + i * (span / bins)
            return (
              <group key={i} position={[x, 0.22, 0]}>
                <mesh castShadow>
                  <boxGeometry args={[bw, 0.28, d * 0.55]} />
                  <Mat color={WHITE} {...m} />
                </mesh>
                <mesh position={[0, 0.15, 0]} castShadow>
                  <boxGeometry args={[bw * 1.05, 0.03, d * 0.58]} />
                  <Mat color="#F0F0EE" {...m} />
                </mesh>
                <mesh position={[0, 0.05, d * 0.28]} castShadow>
                  <boxGeometry args={[bw * 0.35, 0.04, 0.02]} />
                  <Mat color={['#70A0D0', '#E07070', '#80C080', '#E0C060'][i % 4]} {...m} />
                </mesh>
              </group>
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
            args={[w * 0.95, h - 0.06, d * 0.85]}
            position={[0, (h - 0.06) / 2, 0]}
            color={tint}
            {...m}
          />
          {/* Lid slightly open */}
          <mesh
            position={[0, h - 0.02, -d * 0.05]}
            rotation={[-0.12, 0, 0]}
            castShadow
          >
            <boxGeometry args={[w * 0.97, 0.05, d * 0.88]} />
            <Mat color={tint} {...m} />
          </mesh>
          {/* LEGO studs */}
          {[-0.15, -0.05, 0.05, 0.15].map((x) => (
            <mesh key={x} position={[x * w, h + 0.01, d * 0.15]} castShadow>
              <cylinderGeometry args={[0.025, 0.025, 0.02, 10]} />
              <Mat color="#F0F0EE" {...m} />
            </mesh>
          ))}
          <Knob position={[0, h * 0.55, d * 0.44]} color="#C0C0C0" {...m} />
        </group>
      )
    }

    case 'rug': {
      return (
        <group>
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.012, 0]}
            receiveShadow
          >
            <planeGeometry args={[w * 0.95, d * 0.95]} />
            <Mat color={tint} {...m} />
          </mesh>
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.014, 0]}
            receiveShadow
          >
            <planeGeometry args={[w * 0.82, d * 0.82]} />
            <Mat color="#FFF8E8" {...m} />
          </mesh>
        </group>
      )
    }

    case 'rugHopscotch': {
      const cells = [
        [0, -0.32],
        [-0.22, -0.08],
        [0.22, -0.08],
        [0, 0.16],
        [-0.22, 0.4],
        [0.22, 0.4],
      ] as const
      return (
        <group>
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.01, 0]}
            receiveShadow
          >
            <planeGeometry args={[w * 0.95, d * 0.95]} />
            <Mat color="#F5B0C0" {...m} />
          </mesh>
          {cells.map(([cx, cz], i) => (
            <group key={i}>
              <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[cx * w, 0.015, cz * d]}
                receiveShadow
              >
                <planeGeometry args={[w * 0.28, d * 0.18]} />
                <Mat color={i % 2 ? '#FFE0E8' : '#F080A0'} {...m} />
              </mesh>
              {/* Number blob */}
              <mesh position={[cx * w, 0.02, cz * d]}>
                <boxGeometry args={[0.06, 0.01, 0.08]} />
                <Mat color="#6A4050" {...m} />
              </mesh>
            </group>
          ))}
        </group>
      )
    }

    case 'lamp': {
      return (
        <group>
          <mesh position={[0, 0.04, 0]} castShadow>
            <cylinderGeometry args={[0.09, 0.11, 0.08, 16]} />
            <Mat color={tint} {...m} />
          </mesh>
          <mesh position={[0, 0.22, 0]} castShadow>
            <cylinderGeometry args={[0.015, 0.015, 0.28, 8]} />
            <Mat color={CHROME} {...m} metalness={0.5} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.42, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.16, 0.16, 16]} />
            <Mat color="#FFF6E0" {...m} />
          </mesh>
          <mesh position={[0, 0.4, 0]}>
            <sphereGeometry args={[0.05, 10, 8]} />
            <Mat
              color="#FFE8B0"
              {...m}
              emissive="#FFE8B0"
              emissiveIntensity={0.55}
            />
          </mesh>
        </group>
      )
    }

    case 'lampRattan': {
      // Photo: gold stem, scalloped rattan flower shade
      return (
        <group>
          <mesh position={[0, 0.03, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.09, 0.06, 16]} />
            <Mat color={GOLD} {...m} metalness={0.45} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.18, 0]} castShadow>
            <cylinderGeometry args={[0.012, 0.012, 0.26, 8]} />
            <Mat color={GOLD} {...m} metalness={0.55} roughness={0.3} />
          </mesh>
          {/* Scalloped petal shade */}
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const a = (i / 6) * Math.PI * 2
            return (
              <mesh
                key={i}
                position={[
                  Math.cos(a) * 0.07,
                  0.38,
                  Math.sin(a) * 0.07,
                ]}
                castShadow
              >
                <sphereGeometry args={[0.06, 10, 8]} />
                <Mat color={tint || GOLD} {...m} />
              </mesh>
            )
          })}
          <mesh position={[0, 0.38, 0]} castShadow>
            <sphereGeometry args={[0.08, 12, 10]} />
            <Mat color={tint || GOLD} {...m} />
          </mesh>
          <mesh position={[0, 0.38, 0]}>
            <sphereGeometry args={[0.045, 10, 8]} />
            <Mat
              color="#FFF4D0"
              {...m}
              emissive="#FFE8B0"
              emissiveIntensity={0.7}
            />
          </mesh>
        </group>
      )
    }

    case 'plant': {
      return (
        <group>
          <mesh position={[0, 0.08, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.06, 0.16, 12]} />
            <Mat color="#C47850" {...m} />
          </mesh>
          <mesh position={[0, 0.16, 0]} castShadow>
            <cylinderGeometry args={[0.085, 0.085, 0.02, 12]} />
            <Mat color="#A06040" {...m} />
          </mesh>
          <mesh position={[0, 0.17, 0]}>
            <cylinderGeometry args={[0.07, 0.07, 0.02, 12]} />
            <Mat color="#5A4030" {...m} />
          </mesh>
          <mesh position={[0, 0.28, 0]} castShadow>
            <cylinderGeometry args={[0.01, 0.01, 0.2, 6]} />
            <Mat color="#4A7A40" {...m} />
          </mesh>
          {[
            [0.05, 0.38, 0],
            [-0.04, 0.42, 0.04],
            [0.02, 0.45, -0.05],
            [-0.06, 0.35, -0.03],
            [0.06, 0.4, 0.05],
          ].map(([x, y, z], i) => (
            <mesh
              key={i}
              position={[x, y, z]}
              scale={[1.2, 0.55, 0.9]}
              castShadow
            >
              <sphereGeometry args={[0.07, 10, 8]} />
              <Mat color={tint} {...m} />
            </mesh>
          ))}
        </group>
      )
    }

    case 'toy': {
      // Friendly robot — head, antenna, glowing eyes, arms, treads
      return (
        <group>
          <mesh position={[0, 0.22, 0]} castShadow>
            <boxGeometry args={[0.22, 0.28, 0.18]} />
            <Mat color={tint} {...m} metalness={0.35} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.42, 0]} castShadow>
            <boxGeometry args={[0.18, 0.16, 0.16]} />
            <Mat color={tint} {...m} metalness={0.3} roughness={0.42} />
          </mesh>
          <mesh position={[0, 0.52, 0]} castShadow>
            <cylinderGeometry args={[0.015, 0.015, 0.1, 8]} />
            <Mat color={CHROME} {...m} metalness={0.7} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0.58, 0]} castShadow>
            <sphereGeometry args={[0.03, 10, 8]} />
            <Mat
              color="#E07070"
              {...m}
              emissive="#E07070"
              emissiveIntensity={0.35}
            />
          </mesh>
          {[-0.05, 0.05].map((x) => (
            <mesh key={x} position={[x, 0.44, 0.09]} castShadow>
              <sphereGeometry args={[0.028, 10, 8]} />
              <Mat
                color="#FFE860"
                {...m}
                emissive="#FFE860"
                emissiveIntensity={0.5}
              />
            </mesh>
          ))}
          <mesh position={[0, 0.38, 0.1]} castShadow>
            <boxGeometry args={[0.08, 0.02, 0.02]} />
            <Mat color="#2A2A32" {...m} />
          </mesh>
          {([-1, 1] as const).map((s) => (
            <group key={s}>
              <mesh position={[s * 0.14, 0.28, 0]} castShadow>
                <boxGeometry args={[0.06, 0.08, 0.06]} />
                <Mat color={tint} {...m} metalness={0.3} roughness={0.45} />
              </mesh>
              <mesh position={[s * 0.14, 0.18, 0]} castShadow>
                <cylinderGeometry args={[0.025, 0.03, 0.12, 8]} />
                <Mat color={CHROME} {...m} metalness={0.65} roughness={0.3} />
              </mesh>
            </group>
          ))}
          <mesh position={[0, 0.06, 0]} castShadow>
            <boxGeometry args={[0.28, 0.06, 0.2]} />
            <Mat color="#3A3A48" {...m} metalness={0.4} roughness={0.5} />
          </mesh>
          {([-1, 1] as const).map((s) => (
            <mesh
              key={`t${s}`}
              position={[0, 0.05, s * 0.1]}
              rotation={[0, 0, Math.PI / 2]}
              castShadow
            >
              <cylinderGeometry args={[0.045, 0.045, 0.26, 12]} />
              <Mat color="#2A2A32" {...m} roughness={0.7} />
            </mesh>
          ))}
        </group>
      )
    }

    case 'dollhouse':
      return <DollhouseMesh w={w} d={d} tint={tint} {...m} />

    case 'beanbag': {
      return (
        <group>
          <mesh position={[0, 0.18, 0]} scale={[1.15, 0.75, 1.1]} castShadow>
            <sphereGeometry args={[0.22, 16, 12]} />
            <Mat color={tint} {...m} />
          </mesh>
          <mesh position={[0, 0.32, 0]} scale={[0.7, 0.35, 0.7]} castShadow>
            <sphereGeometry args={[0.15, 12, 10]} />
            <Mat color={tint} {...m} />
          </mesh>
          <mesh position={[0.12, 0.2, 0.08]} castShadow>
            <boxGeometry args={[0.02, 0.12, 0.08]} />
            <Mat color="#E07060" {...m} />
          </mesh>
        </group>
      )
    }

    case 'mirror': {
      return (
        <group>
          <mesh position={[0, 0.55, 0]} castShadow>
            <boxGeometry args={[w * 0.55, 1.05, 0.06]} />
            <Mat color={tint} {...m} />
          </mesh>
          {/* Arched top */}
          <mesh position={[0, 1.05, 0]} castShadow scale={[1, 0.55, 1]}>
            <cylinderGeometry args={[w * 0.28, w * 0.28, 0.06, 16]} />
            <Mat color={tint} {...m} />
          </mesh>
          <mesh position={[0, 0.55, 0.02]} castShadow>
            <boxGeometry args={[w * 0.42, 0.9, 0.02]} />
            <Mat color="#B8D4E8" {...m} metalness={0.4} roughness={0.15} />
          </mesh>
          <mesh position={[0, 0.04, 0.05]} castShadow>
            <boxGeometry args={[w * 0.45, 0.08, 0.2]} />
            <Mat color={tint} {...m} />
          </mesh>
        </group>
      )
    }

    case 'blocks': {
      const colors = [tint, '#70A0D0', '#E0C060', '#80C080']
      return (
        <group>
          <mesh position={[-0.08, 0.06, 0]} castShadow>
            <boxGeometry args={[0.12, 0.12, 0.12]} />
            <Mat color={colors[0]} {...m} />
          </mesh>
          {[
            [-0.04, -0.04],
            [0.04, -0.04],
            [-0.04, 0.04],
            [0.04, 0.04],
          ].map(([x, z], i) => (
            <mesh key={i} position={[-0.08 + x, 0.13, z]} castShadow>
              <cylinderGeometry args={[0.02, 0.02, 0.02, 8]} />
              <Mat color={colors[0]} {...m} />
            </mesh>
          ))}
          <mesh position={[0.08, 0.05, 0.04]} castShadow>
            <boxGeometry args={[0.1, 0.1, 0.1]} />
            <Mat color={colors[1]} {...m} />
          </mesh>
          <mesh position={[0.02, 0.16, -0.02]} castShadow>
            <boxGeometry args={[0.18, 0.08, 0.1]} />
            <Mat color={colors[2]} {...m} />
          </mesh>
          <mesh position={[0.02, 0.22, -0.02]} castShadow>
            <boxGeometry args={[0.06, 0.04, 0.02]} />
            <Mat color="#2A2A2E" {...m} />
          </mesh>
        </group>
      )
    }

    case 'basket': {
      // Panier osier lisible : corps, ouverture, bordure, anse en arche, échelle au footprint.
      const weave = tint || '#C4A882'
      const dark = '#9A7A55'
      const isOval = fw >= 2 || w > d * 1.35
      const hasPompoms = weave.toLowerCase() === '#c4a882'
      const rx = Math.max(w * (isOval ? 0.42 : 0.36), 0.12)
      const rz = Math.max(d * (isOval ? 0.32 : 0.36), 0.1)
      const bodyH = 0.2
      const rimY = bodyH
      const sx = rx / 0.14
      const sz = rz / 0.14
      return (
        <group>
          {/* Corps */}
          <mesh position={[0, bodyH / 2, 0]} castShadow scale={[sx, 1, sz]}>
            <cylinderGeometry args={[0.14, 0.115, bodyH, 20]} />
            <Mat color={weave} {...m} />
          </mesh>
          {/* Cavité (disque sombre = panier ouvert) */}
          <mesh position={[0, rimY - 0.01, 0]} castShadow scale={[sx * 0.85, 1, sz * 0.85]}>
            <cylinderGeometry args={[0.12, 0.12, 0.04, 20]} />
            <Mat color={dark} {...m} />
          </mesh>
          {/* Tressage vertical */}
          {Array.from({ length: isOval ? 12 : 10 }, (_, i) => {
            const a = (i / (isOval ? 12 : 10)) * Math.PI * 2
            return (
              <mesh
                key={i}
                position={[Math.cos(a) * rx * 0.92, bodyH / 2, Math.sin(a) * rz * 0.92]}
                rotation={[0, -a, 0]}
                castShadow
              >
                <boxGeometry args={[0.018, bodyH * 0.88, 0.012]} />
                <Mat color={i % 2 ? dark : weave} {...m} />
              </mesh>
            )
          })}
          {/* Bordure */}
          <mesh
            position={[0, rimY, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={[sx, sz, 1]}
            castShadow
          >
            <torusGeometry args={[0.14, 0.02, 8, 24]} />
            <Mat color={dark} {...m} />
          </mesh>
          {/* Anse en U (montants + barre) — lisible à toute échelle */}
          {[-1, 1].map((s) => (
            <mesh
              key={s}
              position={[s * rx * 0.55, rimY + 0.09, 0]}
              castShadow
            >
              <cylinderGeometry args={[0.012, 0.012, 0.18, 8]} />
              <Mat color={dark} {...m} />
            </mesh>
          ))}
          <mesh
            position={[0, rimY + 0.18, 0]}
            rotation={[0, 0, Math.PI / 2]}
            castShadow
          >
            <cylinderGeometry args={[0.012, 0.012, rx * 1.15, 8]} />
            <Mat color={dark} {...m} />
          </mesh>
          {/* Pompons accrochés au bord (panier pompons uniquement) */}
          {hasPompoms &&
            [-1, 0, 1].map((s) => (
              <mesh
                key={s}
                position={[s * rx * 0.4, rimY + 0.035, rz * 0.75]}
                castShadow
              >
                <sphereGeometry args={[0.035, 10, 8]} />
                <Mat color="#FAFAF8" {...m} />
              </mesh>
            ))}
        </group>
      )
    }

    case 'plush': {
      // Cream bunny (Lapin)
      return (
        <group>
          <mesh position={[0, 0.14, 0.02]} castShadow scale={[1, 1.1, 0.9]}>
            <sphereGeometry args={[0.11, 14, 12]} />
            <Mat color={tint} {...m} />
          </mesh>
          <mesh position={[0, 0.3, 0.02]} castShadow>
            <sphereGeometry args={[0.085, 14, 12]} />
            <Mat color={tint} {...m} />
          </mesh>
          {/* Long floppy ears */}
          {[-1, 1].map((s) => (
            <mesh
              key={s}
              position={[s * 0.04, 0.42, -0.02]}
              rotation={[0.35, 0, s * 0.25]}
              scale={[0.55, 1.4, 0.35]}
              castShadow
            >
              <sphereGeometry args={[0.07, 10, 8]} />
              <Mat color={tint} {...m} />
            </mesh>
          ))}
          <mesh position={[0, 0.28, 0.08]} castShadow>
            <sphereGeometry args={[0.04, 10, 8]} />
            <Mat color="#FFF5EE" {...m} />
          </mesh>
          <mesh position={[0, 0.27, 0.11]} castShadow>
            <sphereGeometry args={[0.015, 8, 6]} />
            <Mat color="#E8A0B0" {...m} />
          </mesh>
          {[-0.03, 0.03].map((x) => (
            <mesh key={x} position={[x, 0.31, 0.09]} castShadow>
              <sphereGeometry args={[0.012, 8, 6]} />
              <Mat color="#1A1A22" {...m} />
            </mesh>
          ))}
          <mesh position={[0, 0.2, 0.1]} castShadow>
            <torusGeometry args={[0.03, 0.01, 6, 12]} />
            <Mat color={FLORAL_PINK} {...m} />
          </mesh>
          <mesh position={[0, 0.08, -0.08]} castShadow>
            <sphereGeometry args={[0.035, 8, 6]} />
            <Mat color={tint} {...m} />
          </mesh>
        </group>
      )
    }

    case 'plushStitch':
      return <PlushStitch tint={tint} opacity={opacity} selected={selected} />
    case 'plushAngel':
      return <PlushAngel tint={tint} opacity={opacity} selected={selected} />

    case 'lightbox': {
      return (
        <group>
          <mesh position={[0, 0.1, 0]} castShadow>
            <boxGeometry args={[0.32, 0.2, 0.08]} />
            <Mat color={tint || WHITE} {...m} />
          </mesh>
          <mesh position={[0, 0.1, 0.035]} castShadow>
            <boxGeometry args={[0.28, 0.16, 0.02]} />
            <Mat color="#1A1A22" {...m} />
          </mesh>
          {/* LOUISE letters as rose tiles */}
          {[-0.1, -0.06, -0.02, 0.02, 0.06, 0.1].map((x, i) => (
            <mesh key={i} position={[x, 0.1, 0.048]} castShadow>
              <boxGeometry args={[0.032, 0.1, 0.012]} />
              <Mat
                color={DUSTY_ROSE}
                {...m}
                emissive={DUSTY_ROSE}
                emissiveIntensity={0.55}
              />
            </mesh>
          ))}
          <mesh position={[0.14, 0.1, 0]} castShadow>
            <boxGeometry args={[0.02, 0.04, 0.03]} />
            <Mat color="#888" {...m} />
          </mesh>
        </group>
      )
    }

    case 'legoCamper': {
      return (
        <group>
          <mesh position={[0, 0.06, 0]} castShadow>
            <boxGeometry args={[0.28, 0.1, 0.16]} />
            <Mat color="#E87840" {...m} />
          </mesh>
          <mesh position={[0, 0.16, 0]} castShadow>
            <boxGeometry args={[0.26, 0.12, 0.15]} />
            <Mat color={WHITE} {...m} />
          </mesh>
          {/* Pop-top */}
          <mesh position={[0.02, 0.26, 0]} castShadow>
            <boxGeometry args={[0.18, 0.06, 0.14]} />
            <Mat color={WHITE} {...m} />
          </mesh>
          <mesh position={[-0.1, 0.16, 0.08]} castShadow>
            <boxGeometry args={[0.08, 0.07, 0.01]} />
            <Mat color="#7EC8E8" {...m} />
          </mesh>
          {[-0.08, 0.08].map((z) => (
            <mesh key={z} position={[0.08, 0.16, z]} castShadow>
              <boxGeometry args={[0.06, 0.06, 0.01]} />
              <Mat color="#7EC8E8" {...m} />
            </mesh>
          ))}
          {[-1, 1].map((s) => (
            <mesh key={s} position={[0.12, 0.08, s * 0.09]} castShadow>
              <sphereGeometry args={[0.025, 8, 6]} />
              <Mat color="#F0E060" {...m} />
            </mesh>
          ))}
          {[
            [-0.08, 0.09],
            [0.08, 0.09],
            [-0.08, -0.09],
            [0.08, -0.09],
          ].map(([x, z], i) => (
            <mesh key={i} position={[x, 0.04, z]} castShadow rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.035, 0.035, 0.04, 12]} />
              <Mat color="#2A2A2E" {...m} />
            </mesh>
          ))}
          {[-0.06, 0, 0.06].map((x) => (
            <mesh key={x} position={[x, 0.3, 0]} castShadow>
              <cylinderGeometry args={[0.02, 0.02, 0.015, 8]} />
              <Mat color="#E07070" {...m} />
            </mesh>
          ))}
        </group>
      )
    }

    case 'legoCluster': {
      return (
        <group>
          <mesh position={[0, 0.01, 0]} receiveShadow>
            <boxGeometry args={[0.4, 0.02, 0.3]} />
            <Mat color="#80C070" {...m} />
          </mesh>
          <mesh position={[-0.08, 0.12, 0]} castShadow>
            <boxGeometry args={[0.16, 0.2, 0.14]} />
            <Mat color={tint || '#E8C8D0'} {...m} />
          </mesh>
          <mesh position={[-0.08, 0.26, 0]} castShadow>
            <coneGeometry args={[0.12, 0.1, 4]} />
            <Mat color="#E05050" {...m} />
          </mesh>
          <mesh position={[-0.08, 0.1, 0.08]} castShadow>
            <boxGeometry args={[0.05, 0.1, 0.02]} />
            <Mat color="#8B5A3C" {...m} />
          </mesh>
          <mesh position={[0.12, 0.08, 0.02]} castShadow>
            <boxGeometry args={[0.14, 0.12, 0.1]} />
            <Mat color="#70A0D0" {...m} />
          </mesh>
          {[
            [0.08, 0.04, -0.08, '#E0C060'],
            [0.14, 0.06, -0.1, '#80C080'],
            [-0.16, 0.05, 0.1, '#E07070'],
          ].map(([x, y, z, c], i) => (
            <mesh key={i} position={[x as number, y as number, z as number]} castShadow>
              <boxGeometry args={[0.08, 0.06, 0.06]} />
              <Mat color={c as string} {...m} />
            </mesh>
          ))}
        </group>
      )
    }

    case 'pirateShip': {
      return (
        <group>
          <mesh position={[0, 0.08, 0]} castShadow scale={[1.4, 0.7, 0.7]}>
            <sphereGeometry args={[0.14, 12, 10]} />
            <Mat color="#5A4030" {...m} />
          </mesh>
          <mesh position={[0, 0.14, 0]} castShadow>
            <boxGeometry args={[0.32, 0.04, 0.16]} />
            <Mat color="#8B6914" {...m} />
          </mesh>
          <mesh position={[0.18, 0.1, 0]} castShadow rotation={[0, 0, -0.4]}>
            <coneGeometry args={[0.06, 0.14, 8]} />
            <Mat color="#5A4030" {...m} />
          </mesh>
          <mesh position={[0, 0.32, 0]} castShadow>
            <cylinderGeometry args={[0.012, 0.012, 0.35, 6]} />
            <Mat color="#3A2A1A" {...m} />
          </mesh>
          <mesh position={[0, 0.28, 0.01]} castShadow>
            <boxGeometry args={[0.02, 0.2, 0.14]} />
            <Mat color="#1A1A22" {...m} />
          </mesh>
          {/* Jolly Roger */}
          <mesh position={[0, 0.3, 0.08]} castShadow>
            <sphereGeometry args={[0.03, 8, 6]} />
            <Mat color="#F5F5F2" {...m} />
          </mesh>
          {[-0.04, 0.04].map((x) => (
            <mesh key={x} position={[x, 0.26, 0.08]} castShadow rotation={[0, 0, 0.5]}>
              <boxGeometry args={[0.06, 0.012, 0.012]} />
              <Mat color="#F5F5F2" {...m} />
            </mesh>
          ))}
          {[-0.06, 0.06].map((z) => (
            <mesh key={z} position={[-0.05, 0.1, z]} castShadow>
              <cylinderGeometry args={[0.02, 0.02, 0.02, 8]} />
              <Mat color="#2A2A2E" {...m} />
            </mesh>
          ))}
        </group>
      )
    }

    case 'camperVan': {
      return (
        <group>
          <mesh position={[0, 0.1, 0]} castShadow>
            <boxGeometry args={[0.32, 0.16, 0.18]} />
            <Mat color={tint} {...m} />
          </mesh>
          {/* Rounded nose */}
          <mesh position={[0.16, 0.1, 0]} castShadow scale={[0.55, 1, 1]}>
            <sphereGeometry args={[0.09, 12, 10]} />
            <Mat color={tint} {...m} />
          </mesh>
          <mesh position={[0, 0.2, 0]} castShadow>
            <boxGeometry args={[0.3, 0.04, 0.17]} />
            <Mat color={WHITE} {...m} />
          </mesh>
          <mesh position={[0, 0.14, 0]} castShadow>
            <boxGeometry args={[0.28, 0.04, 0.185]} />
            <Mat color={WHITE} {...m} />
          </mesh>
          {/* Split windshield */}
          {[-0.04, 0.04].map((z) => (
            <mesh key={z} position={[0.14, 0.14, z]} castShadow>
              <boxGeometry args={[0.02, 0.07, 0.06]} />
              <Mat color="#7EC8E8" {...m} />
            </mesh>
          ))}
          <mesh position={[0, 0.14, 0.095]} castShadow>
            <boxGeometry args={[0.1, 0.06, 0.01]} />
            <Mat color="#7EC8E8" {...m} />
          </mesh>
          {/* Roof rack */}
          {[-0.08, 0.08].map((x) => (
            <mesh key={x} position={[x, 0.24, 0]} castShadow>
              <boxGeometry args={[0.02, 0.02, 0.16]} />
              <Mat color="#888" {...m} />
            </mesh>
          ))}
          {[
            [-0.1, 0.1],
            [0.08, 0.1],
            [-0.1, -0.1],
            [0.08, -0.1],
          ].map(([x, z], i) => (
            <mesh
              key={i}
              position={[x, 0.04, z]}
              rotation={[Math.PI / 2, 0, 0]}
              castShadow
            >
              <cylinderGeometry args={[0.04, 0.04, 0.04, 12]} />
              <Mat color="#2A2A2E" {...m} />
            </mesh>
          ))}
        </group>
      )
    }

    default:
      return (
        <mesh position={[0, 0.15, 0]} castShadow>
          <boxGeometry args={[w * 0.8, 0.3, d * 0.8]} />
          <Mat color={tint} opacity={opacity} selected={selected} />
        </mesh>
      )
  }
}
