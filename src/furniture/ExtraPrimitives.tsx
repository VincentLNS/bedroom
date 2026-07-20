/** Extra stylized primitives — recognizable at dollhouse scale. */

import {
  CHROME,
  FLORAL_PINK,
  GOLD,
  Mat,
  OAK,
  SoftBox,
  WHITE,
  type MatProps,
} from './MeshKit'

export type ExtraKind =
  | 'nightstand'
  | 'dresser'
  | 'canopyBed'
  | 'stool'
  | 'easel'
  | 'playTent'
  | 'rockingHorse'
  | 'plushBear'
  | 'plushUnicorn'
  | 'plushDino'
  | 'trainSet'
  | 'ball'
  | 'scooter'
  | 'xylophone'
  | 'globe'
  | 'nightLight'
  | 'toyKitchen'
  | 'laundryHamper'
  | 'floorLamp'
  | 'booksStack'
  | 'crayonBox'
  | 'dollPram'
  | 'cloudRug'
  | 'pouf'
  | 'photoFrame'
  | 'floorMattress'
  | 'teepee'

export function ExtraPrimitive({
  kind,
  footprint,
  tint = '#E8A0B0',
  opacity = 1,
  selected = false,
}: {
  kind: ExtraKind
  footprint: [number, number]
  tint?: string
  opacity?: number
  selected?: boolean
}) {
  const [fw, fd] = footprint
  const CELL = 0.5
  const w = fw * CELL
  const d = fd * CELL
  const m: MatProps = { opacity, selected }

  switch (kind) {
    case 'nightstand': {
      const h = 0.54
      return (
        <group>
          <mesh position={[0, h / 2, 0]} castShadow>
            <boxGeometry args={[w * 0.88, h - 0.06, d * 0.8]} />
            <Mat color={tint} {...m} />
          </mesh>
          <mesh position={[0, h - 0.02, 0]} castShadow>
            <boxGeometry args={[w * 0.95, 0.04, d * 0.88]} />
            <Mat color={tint} {...m} />
          </mesh>
          <mesh position={[0, 0.38, d * 0.42]} castShadow>
            <boxGeometry args={[w * 0.75, 0.14, 0.03]} />
            <Mat color={tint} {...m} />
          </mesh>
          <mesh position={[0, 0.38, d * 0.45]} castShadow>
            <boxGeometry args={[0.1, 0.015, 0.015]} />
            <Mat color="#8A7070" {...m} />
          </mesh>
          <mesh position={[0, 0.16, d * 0.15]} castShadow>
            <boxGeometry args={[w * 0.7, 0.02, d * 0.5]} />
            <Mat color={tint} {...m} />
          </mesh>
        </group>
      )
    }

    case 'dresser': {
      const h = 0.85
      return (
        <group>
          <mesh position={[0, 0.03, 0]} castShadow>
            <boxGeometry args={[w * 0.9, 0.06, d * 0.78]} />
            <Mat color={tint} {...m} />
          </mesh>
          <mesh position={[0, h / 2, 0]} castShadow>
            <boxGeometry args={[w * 0.92, h - 0.08, d * 0.8]} />
            <Mat color={tint} {...m} />
          </mesh>
          <mesh position={[0, h - 0.02, 0]} castShadow>
            <boxGeometry args={[w * 0.98, 0.04, d * 0.86]} />
            <Mat color={tint} {...m} />
          </mesh>
          {[0.22, 0.42, 0.62].map((y, i) => (
            <group key={y}>
              <mesh position={[0, y, d * 0.42]} castShadow>
                <boxGeometry args={[w * 0.82, 0.16 - i * 0.01, 0.025]} />
                <Mat color={i === 0 ? FLORAL_PINK : tint} {...m} />
              </mesh>
              <mesh position={[0, y, d * 0.45]} castShadow>
                <boxGeometry args={[0.14, 0.016, 0.016]} />
                <Mat color="#8A7070" {...m} />
              </mesh>
            </group>
          ))}
        </group>
      )
    }

    case 'canopyBed': {
      const mattressH = 0.2
      const frameH = 0.1
      const postH = 1.15
      return (
        <group>
          <mesh position={[0, frameH / 2, 0]} castShadow>
            <boxGeometry args={[w * 0.95, frameH, d * 0.95]} />
            <Mat color={tint} {...m} />
          </mesh>
          <mesh position={[0, frameH + mattressH / 2, 0]} castShadow>
            <boxGeometry args={[w * 0.88, mattressH, d * 0.85]} />
            <Mat color="#FFF5F8" {...m} />
          </mesh>
          <mesh position={[0, frameH + mattressH + 0.08, -d * 0.3]} castShadow>
            <boxGeometry args={[w * 0.7, 0.1, d * 0.14]} />
            <Mat color="#FFE8F0" {...m} />
          </mesh>
          {(
            [
              [-w * 0.42, -d * 0.42],
              [w * 0.42, -d * 0.42],
              [-w * 0.42, d * 0.42],
              [w * 0.42, d * 0.42],
            ] as const
          ).map(([x, z], i) => (
            <group key={i}>
              <mesh position={[x, postH / 2, z]} castShadow>
                <cylinderGeometry args={[0.03, 0.03, postH, 8]} />
                <Mat color={tint} {...m} />
              </mesh>
              <mesh position={[x, postH + 0.03, z]} castShadow>
                <sphereGeometry args={[0.04, 10, 8]} />
                <Mat color={GOLD} {...m} />
              </mesh>
            </group>
          ))}
          {/* Canopy rails + drapes */}
          <mesh position={[0, postH, 0]} castShadow>
            <boxGeometry args={[w * 0.88, 0.03, d * 0.88]} />
            <Mat color={tint} {...m} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh
              key={s}
              position={[s * w * 0.35, postH * 0.55, 0]}
              rotation={[0, 0, s * 0.15]}
              castShadow
            >
              <boxGeometry args={[0.02, postH * 0.7, d * 0.7]} />
              <Mat color="#FFE8F0" {...m} opacity={(opacity ?? 1) * 0.85} />
            </mesh>
          ))}
        </group>
      )
    }

    case 'stool': {
      const seatY = 0.4
      return (
        <group>
          <mesh position={[0, seatY, 0]} castShadow>
            <cylinderGeometry args={[0.16, 0.15, 0.06, 20]} />
            <Mat color={tint} {...m} />
          </mesh>
          <mesh position={[0, seatY + 0.04, 0]} castShadow scale={[1, 0.4, 1]}>
            <sphereGeometry args={[0.14, 14, 10]} />
            <Mat color={tint} {...m} />
          </mesh>
          <mesh position={[0, 0.18, 0]} castShadow>
            <torusGeometry args={[0.12, 0.015, 8, 20]} />
            <Mat color={OAK} {...m} />
          </mesh>
          {[0, 1, 2, 3].map((i) => {
            const a = (i / 4) * Math.PI * 2 + Math.PI / 4
            return (
              <mesh
                key={i}
                position={[Math.cos(a) * 0.12, seatY / 2, Math.sin(a) * 0.12]}
                castShadow
              >
                <cylinderGeometry args={[0.02, 0.015, seatY, 6]} />
                <Mat color={OAK} {...m} />
              </mesh>
            )
          })}
        </group>
      )
    }

    case 'easel': {
      return (
        <group>
          {[-0.12, 0.12].map((x) => (
            <mesh
              key={x}
              position={[x, 0.45, 0]}
              rotation={[0.2, 0, x > 0 ? 0.12 : -0.12]}
              castShadow
            >
              <boxGeometry args={[0.04, 0.95, 0.04]} />
              <Mat color={tint} {...m} />
            </mesh>
          ))}
          <mesh
            position={[0, 0.4, -0.18]}
            rotation={[0.5, 0, 0]}
            castShadow
          >
            <boxGeometry args={[0.04, 0.7, 0.04]} />
            <Mat color={tint} {...m} />
          </mesh>
          <mesh position={[0, 0.55, 0.02]} castShadow>
            <boxGeometry args={[0.35, 0.42, 0.02]} />
            <Mat color="#FAFAF8" {...m} />
          </mesh>
          <mesh position={[0.02, 0.55, 0.03]} castShadow>
            <boxGeometry args={[0.22, 0.28, 0.01]} />
            <Mat color="#70A0D0" {...m} />
          </mesh>
          <mesh position={[-0.08, 0.42, 0.03]} castShadow>
            <sphereGeometry args={[0.03, 8, 6]} />
            <Mat color="#E07070" {...m} />
          </mesh>
          <mesh position={[0, 0.28, 0.05]} castShadow>
            <boxGeometry args={[0.32, 0.03, 0.1]} />
            <Mat color={tint} {...m} />
          </mesh>
          <mesh position={[0.1, 0.32, 0.08]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 0.015, 12]} />
            <Mat color="#E8D4B0" {...m} />
          </mesh>
        </group>
      )
    }

    case 'playTent':
    case 'teepee': {
      const h = 0.95
      return (
        <group>
          {[0, 1, 2, 3].map((i) => {
            const a = (i / 4) * Math.PI * 2 + Math.PI / 4
            return (
              <mesh
                key={i}
                position={[Math.cos(a) * 0.08, h / 2, Math.sin(a) * 0.08]}
                rotation={[0.35, a, 0]}
                castShadow
              >
                <cylinderGeometry args={[0.015, 0.015, h + 0.15, 6]} />
                <Mat color={OAK} {...m} />
              </mesh>
            )
          })}
          <mesh position={[0, h * 0.45, 0]} castShadow>
            <coneGeometry args={[w * 0.45, h * 0.9, 4]} />
            <Mat color={tint} {...m} />
          </mesh>
          <mesh position={[0, 0.35, d * 0.28]} castShadow>
            <boxGeometry args={[0.18, 0.45, 0.02]} />
            <Mat color="#F0D060" {...m} />
          </mesh>
          {/* X lacing */}
          <mesh position={[0, 0.55, d * 0.3]} rotation={[0, 0, 0.6]} castShadow>
            <boxGeometry args={[0.2, 0.015, 0.015]} />
            <Mat color={OAK} {...m} />
          </mesh>
          <mesh position={[0, 0.55, d * 0.3]} rotation={[0, 0, -0.6]} castShadow>
            <boxGeometry args={[0.2, 0.015, 0.015]} />
            <Mat color={OAK} {...m} />
          </mesh>
          {/* Pennant */}
          <mesh position={[0.05, h + 0.12, 0]} castShadow>
            <coneGeometry args={[0.05, 0.1, 3]} />
            <Mat color="#E07070" {...m} />
          </mesh>
        </group>
      )
    }

    case 'rockingHorse': {
      return (
        <group>
          {[-1, 1].map((s) => (
            <mesh
              key={s}
              position={[0, 0.06, s * 0.08]}
              rotation={[Math.PI / 2, 0, Math.PI / 2]}
              castShadow
            >
              <torusGeometry args={[0.2, 0.02, 8, 20, Math.PI]} />
              <Mat color={OAK} {...m} />
            </mesh>
          ))}
          <mesh position={[0, 0.22, 0]} castShadow scale={[1.2, 0.8, 0.7]}>
            <sphereGeometry args={[0.12, 12, 10]} />
            <Mat color={tint} {...m} />
          </mesh>
          {/* Legs */}
          {(
            [
              [-0.08, 0.1],
              [0.08, 0.1],
              [-0.08, -0.1],
              [0.08, -0.1],
            ] as const
          ).map(([x, z], i) => (
            <mesh key={i} position={[x, 0.12, z]} castShadow>
              <cylinderGeometry args={[0.02, 0.02, 0.16, 6]} />
              <Mat color={tint} {...m} />
            </mesh>
          ))}
          <mesh position={[0.14, 0.32, 0]} castShadow>
            <sphereGeometry args={[0.07, 12, 10]} />
            <Mat color={tint} {...m} />
          </mesh>
          <mesh position={[0.2, 0.3, 0]} castShadow>
            <boxGeometry args={[0.08, 0.04, 0.05]} />
            <Mat color={tint} {...m} />
          </mesh>
          {/* Mane */}
          {[-0.02, 0.02, 0.06].map((x, i) => (
            <mesh key={i} position={[0.1 + x, 0.4, 0]} castShadow>
              <coneGeometry args={[0.02, 0.06, 5]} />
              <Mat color="#F5F0EA" {...m} />
            </mesh>
          ))}
          <mesh position={[0, 0.28, 0]} castShadow>
            <boxGeometry args={[0.12, 0.04, 0.1]} />
            <Mat color="#E05050" {...m} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[0.16, 0.36, s * 0.05]} castShadow>
              <cylinderGeometry args={[0.012, 0.012, 0.08, 6]} />
              <Mat color="#8B6914" {...m} />
            </mesh>
          ))}
        </group>
      )
    }

    case 'plushBear': {
      return (
        <group>
          <mesh position={[0, 0.14, 0]} castShadow scale={[1, 1.05, 0.9]}>
            <sphereGeometry args={[0.12, 14, 12]} />
            <Mat color={tint} {...m} />
          </mesh>
          <mesh position={[0, 0.3, 0]} castShadow>
            <sphereGeometry args={[0.09, 14, 12]} />
            <Mat color={tint} {...m} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.07, 0.36, 0]} castShadow>
              <sphereGeometry args={[0.035, 10, 8]} />
              <Mat color={tint} {...m} />
            </mesh>
          ))}
          <mesh position={[0, 0.27, 0.07]} castShadow>
            <boxGeometry args={[0.07, 0.05, 0.05]} />
            <Mat color="#F5E6D0" {...m} />
          </mesh>
          <mesh position={[0, 0.27, 0.1]} castShadow>
            <sphereGeometry args={[0.015, 8, 6]} />
            <Mat color="#3A2A1A" {...m} />
          </mesh>
          {[-0.03, 0.03].map((x) => (
            <mesh key={x} position={[x, 0.32, 0.07]} castShadow>
              <sphereGeometry args={[0.012, 8, 6]} />
              <Mat color="#1A1A22" {...m} />
            </mesh>
          ))}
          <mesh position={[0, 0.18, 0.1]} castShadow>
            <torusGeometry args={[0.035, 0.012, 6, 12]} />
            <Mat color="#E07070" {...m} />
          </mesh>
          {[-0.08, 0.08].map((x) => (
            <mesh key={x} position={[x, 0.04, 0.06]} castShadow>
              <sphereGeometry args={[0.025, 8, 6]} />
              <Mat color="#E8C8A0" {...m} />
            </mesh>
          ))}
        </group>
      )
    }

    case 'plushUnicorn': {
      return (
        <group>
          <mesh position={[0, 0.14, 0]} castShadow scale={[1, 1.05, 0.9]}>
            <sphereGeometry args={[0.11, 14, 12]} />
            <Mat color={tint} {...m} />
          </mesh>
          <mesh position={[0, 0.3, 0.02]} castShadow>
            <sphereGeometry args={[0.085, 14, 12]} />
            <Mat color={tint} {...m} />
          </mesh>
          <mesh position={[0, 0.4, 0.02]} rotation={[-0.3, 0, 0]} castShadow>
            <coneGeometry args={[0.025, 0.12, 8]} />
            <Mat color={GOLD} {...m} metalness={0.4} roughness={0.35} />
          </mesh>
          {/* Mane */}
          {['#E8A0D0', '#A0C0F0', '#F0D0A0'].map((c, i) => (
            <mesh
              key={c}
              position={[-0.02 - i * 0.02, 0.34 + i * 0.02, -0.04]}
              castShadow
            >
              <sphereGeometry args={[0.035, 8, 6]} />
              <Mat color={c} {...m} />
            </mesh>
          ))}
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.06, 0.36, 0]} castShadow>
              <sphereGeometry args={[0.03, 8, 6]} />
              <Mat color="#D0A0E8" {...m} />
            </mesh>
          ))}
          {[-0.03, 0.03].map((x) => (
            <mesh key={x} position={[x, 0.31, 0.08]} castShadow>
              <sphereGeometry args={[0.012, 8, 6]} />
              <Mat color="#1A1A22" {...m} />
            </mesh>
          ))}
          <mesh position={[0, 0.12, -0.12]} castShadow>
            <sphereGeometry args={[0.04, 8, 6]} />
            <Mat color="#E8A0D0" {...m} />
          </mesh>
          <mesh position={[0, 0.08, -0.18]} castShadow>
            <sphereGeometry args={[0.03, 8, 6]} />
            <Mat color="#A0C0F0" {...m} />
          </mesh>
        </group>
      )
    }

    case 'plushDino': {
      return (
        <group>
          <mesh position={[0, 0.14, 0]} castShadow scale={[1.1, 0.9, 0.85]}>
            <sphereGeometry args={[0.13, 14, 12]} />
            <Mat color={tint} {...m} />
          </mesh>
          <mesh position={[0.12, 0.22, 0]} castShadow>
            <sphereGeometry args={[0.08, 12, 10]} />
            <Mat color={tint} {...m} />
          </mesh>
          <mesh position={[0.18, 0.2, 0]} castShadow>
            <boxGeometry args={[0.06, 0.04, 0.06]} />
            <Mat color={tint} {...m} />
          </mesh>
          {/* Back plates */}
          {[-0.06, 0, 0.06, 0.12].map((x, i) => (
            <mesh key={i} position={[x, 0.26, 0]} castShadow>
              <boxGeometry args={[0.04, 0.08, 0.02]} />
              <Mat color="#5A9E50" {...m} />
            </mesh>
          ))}
          {/* Tail */}
          <mesh position={[-0.14, 0.12, 0]} castShadow>
            <sphereGeometry args={[0.06, 10, 8]} />
            <Mat color={tint} {...m} />
          </mesh>
          <mesh position={[-0.22, 0.1, 0]} castShadow>
            <sphereGeometry args={[0.04, 8, 6]} />
            <Mat color={tint} {...m} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[0.1, 0.16, s * 0.08]} castShadow>
              <sphereGeometry args={[0.03, 8, 6]} />
              <Mat color={tint} {...m} />
            </mesh>
          ))}
          {[-0.025, 0.025].map((z) => (
            <mesh key={z} position={[0.18, 0.24, z]} castShadow>
              <sphereGeometry args={[0.012, 8, 6]} />
              <Mat color="#1A1A22" {...m} />
            </mesh>
          ))}
        </group>
      )
    }

    case 'trainSet': {
      return (
        <group>
          <mesh position={[-0.08, 0.08, 0]} castShadow>
            <boxGeometry args={[0.18, 0.12, 0.12]} />
            <Mat color={tint} {...m} />
          </mesh>
          <mesh position={[-0.08, 0.18, 0]} castShadow>
            <boxGeometry args={[0.1, 0.1, 0.1]} />
            <Mat color="#E05050" {...m} />
          </mesh>
          <mesh position={[-0.08, 0.28, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.035, 0.08, 10]} />
            <Mat color="#2A2A2E" {...m} />
          </mesh>
          <mesh position={[0.12, 0.07, 0]} castShadow>
            <boxGeometry args={[0.16, 0.1, 0.12]} />
            <Mat color="#70A0D0" {...m} />
          </mesh>
          <mesh position={[0.02, 0.08, 0]} castShadow>
            <boxGeometry args={[0.04, 0.03, 0.03]} />
            <Mat color="#888" {...m} />
          </mesh>
          {[
            [-0.14, 0.07],
            [-0.02, 0.07],
            [0.08, 0.07],
            [0.18, 0.07],
          ].map(([x, z], i) => (
            <mesh
              key={i}
              position={[x, 0.035, z > 0.05 ? 0.07 : -0.07]}
              rotation={[Math.PI / 2, 0, 0]}
              castShadow
            >
              <cylinderGeometry args={[0.03, 0.03, 0.03, 10]} />
              <Mat color="#2A2A2E" {...m} />
            </mesh>
          ))}
        </group>
      )
    }

    case 'ball': {
      return (
        <group>
          <mesh position={[0, 0.12, 0]} castShadow>
            <sphereGeometry args={[0.12, 20, 16]} />
            <Mat color={tint} {...m} />
          </mesh>
          <mesh position={[0, 0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.12, 0.008, 6, 24]} />
            <Mat color="#FAFAF8" {...m} />
          </mesh>
          <mesh position={[0, 0.12, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.12, 0.008, 6, 24]} />
            <Mat color="#FAFAF8" {...m} />
          </mesh>
        </group>
      )
    }

    case 'scooter': {
      return (
        <group>
          <mesh position={[0, 0.05, 0]} castShadow>
            <boxGeometry args={[0.28, 0.03, 0.1]} />
            <Mat color={tint} {...m} />
          </mesh>
          <mesh
            position={[0.1, 0.28, 0]}
            rotation={[0, 0, -0.25]}
            castShadow
          >
            <cylinderGeometry args={[0.015, 0.015, 0.5, 8]} />
            <Mat color={CHROME} {...m} metalness={0.5} roughness={0.3} />
          </mesh>
          <mesh position={[0.18, 0.5, 0]} castShadow>
            <boxGeometry args={[0.04, 0.03, 0.22]} />
            <Mat color={CHROME} {...m} metalness={0.5} roughness={0.3} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[0.18, 0.5, s * 0.12]} castShadow>
              <cylinderGeometry args={[0.02, 0.02, 0.06, 8]} />
              <Mat color={tint} {...m} />
            </mesh>
          ))}
          <mesh
            position={[-0.12, 0.05, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            castShadow
          >
            <cylinderGeometry args={[0.04, 0.04, 0.04, 12]} />
            <Mat color="#2A2A2E" {...m} />
          </mesh>
          <mesh
            position={[0.14, 0.06, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            castShadow
          >
            <cylinderGeometry args={[0.045, 0.045, 0.04, 12]} />
            <Mat color="#2A2A2E" {...m} />
          </mesh>
          <mesh position={[-0.12, 0.1, 0]} castShadow>
            <boxGeometry args={[0.06, 0.04, 0.08]} />
            <Mat color={tint} {...m} />
          </mesh>
        </group>
      )
    }

    case 'xylophone': {
      const colors = [
        '#E05050',
        '#E87840',
        '#E0C060',
        '#80C070',
        '#70A0D0',
        '#A070D0',
      ]
      return (
        <group>
          <mesh position={[0, 0.04, 0]} castShadow>
            <boxGeometry args={[w * 0.9, 0.06, d * 0.7]} />
            <Mat color={tint} {...m} />
          </mesh>
          {colors.map((c, i) => (
            <mesh
              key={c}
              position={[(i - 2.5) * 0.055, 0.1, 0]}
              castShadow
            >
              <boxGeometry args={[0.045, 0.025, 0.08 + i * 0.025]} />
              <Mat color={c} {...m} />
            </mesh>
          ))}
          {[-0.08, 0.08].map((x, i) => (
            <group key={x} position={[x, 0.14, d * 0.35]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.008, 0.008, 0.16, 6]} />
                <Mat color={OAK} {...m} />
              </mesh>
              <mesh position={[0, 0.09, 0]} castShadow>
                <sphereGeometry args={[0.022, 8, 6]} />
                <Mat color={i ? '#E07070' : '#70A0D0'} {...m} />
              </mesh>
            </group>
          ))}
        </group>
      )
    }

    case 'globe': {
      return (
        <group>
          <mesh position={[0, 0.04, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.1, 0.06, 16]} />
            <Mat color={OAK} {...m} />
          </mesh>
          <mesh
            position={[0, 0.22, 0]}
            rotation={[0, 0, 0.4]}
            castShadow
          >
            <torusGeometry args={[0.14, 0.01, 8, 24]} />
            <Mat color="#A8A8A8" {...m} metalness={0.4} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.22, 0]} rotation={[0.4, 0.3, 0]} castShadow>
            <sphereGeometry args={[0.13, 20, 16]} />
            <Mat color={tint} {...m} />
          </mesh>
          <mesh position={[0.04, 0.26, 0.06]} castShadow scale={[1.2, 0.6, 0.8]}>
            <sphereGeometry args={[0.05, 10, 8]} />
            <Mat color="#80C070" {...m} />
          </mesh>
          <mesh position={[-0.06, 0.18, -0.05]} castShadow scale={[0.9, 0.5, 0.7]}>
            <sphereGeometry args={[0.04, 10, 8]} />
            <Mat color="#80C070" {...m} />
          </mesh>
        </group>
      )
    }

    case 'nightLight': {
      return (
        <group>
          <mesh position={[0, 0.04, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.08, 0.08, 12]} />
            <Mat color={WHITE} {...m} />
          </mesh>
          <mesh position={[0, 0.18, 0]} castShadow>
            <sphereGeometry args={[0.1, 16, 12]} />
            <Mat
              color={tint}
              {...m}
              emissive={tint}
              emissiveIntensity={0.65}
            />
          </mesh>
          {[0, 1, 2, 3, 4].map((i) => {
            const a = (i / 5) * Math.PI * 2 - Math.PI / 2
            return (
              <mesh
                key={i}
                position={[Math.cos(a) * 0.12, 0.18 + Math.sin(a) * 0.12, 0]}
                castShadow
              >
                <coneGeometry args={[0.035, 0.08, 4]} />
                <Mat
                  color={tint}
                  {...m}
                  emissive={tint}
                  emissiveIntensity={0.5}
                />
              </mesh>
            )
          })}
          <mesh position={[0.05, 0.04, 0.06]} castShadow>
            <boxGeometry args={[0.03, 0.02, 0.02]} />
            <Mat color="#888" {...m} />
          </mesh>
        </group>
      )
    }

    case 'toyKitchen': {
      const h = 0.7
      return (
        <group>
          <mesh position={[0, h / 2, 0]} castShadow>
            <boxGeometry args={[w * 0.95, h, d * 0.8]} />
            <Mat color={tint} {...m} />
          </mesh>
          {/* Counter */}
          <mesh position={[0, h + 0.02, 0]} castShadow>
            <boxGeometry args={[w * 0.98, 0.04, d * 0.85]} />
            <Mat color={WHITE} {...m} />
          </mesh>
          {/* Burners */}
          {[-0.12, 0.12].map((x) => (
            <mesh key={x} position={[x, h + 0.05, -d * 0.15]} castShadow>
              <cylinderGeometry args={[0.05, 0.05, 0.015, 12]} />
              <Mat color="#2A2A2E" {...m} />
            </mesh>
          ))}
          {/* Sink + tap */}
          <mesh position={[0.05, h + 0.04, d * 0.15]} castShadow>
            <boxGeometry args={[0.14, 0.04, 0.12]} />
            <Mat color="#C8D8E8" {...m} />
          </mesh>
          <mesh position={[0.05, h + 0.12, d * 0.1]} castShadow>
            <torusGeometry args={[0.04, 0.01, 6, 12, Math.PI]} />
            <Mat color={CHROME} {...m} metalness={0.6} roughness={0.3} />
          </mesh>
          {/* Knobs */}
          {[-0.15, -0.05, 0.05, 0.15].map((x) => (
            <mesh key={x} position={[x, h * 0.75, d * 0.42]} castShadow>
              <cylinderGeometry args={[0.02, 0.02, 0.025, 10]} />
              <Mat color="#555" {...m} />
            </mesh>
          ))}
          {/* Oven door */}
          <mesh position={[0, 0.28, d * 0.42]} castShadow>
            <boxGeometry args={[w * 0.55, 0.35, 0.03]} />
            <Mat color="#E8E0D8" {...m} />
          </mesh>
          <mesh position={[0, 0.32, d * 0.44]} castShadow>
            <boxGeometry args={[w * 0.35, 0.15, 0.01]} />
            <Mat color="#A8D0E8" {...m} />
          </mesh>
          {/* Overhead */}
          <mesh position={[0, h + 0.28, -d * 0.2]} castShadow>
            <boxGeometry args={[w * 0.7, 0.25, 0.2]} />
            <Mat color={tint} {...m} />
          </mesh>
        </group>
      )
    }

    case 'laundryHamper': {
      return (
        <group>
          <mesh position={[0, 0.25, 0]} castShadow>
            <cylinderGeometry args={[0.16, 0.13, 0.48, 16]} />
            <Mat color={tint} {...m} />
          </mesh>
          {Array.from({ length: 6 }, (_, i) => {
            const a = (i / 6) * Math.PI * 2
            return (
              <mesh
                key={i}
                position={[Math.cos(a) * 0.145, 0.25, Math.sin(a) * 0.145]}
                castShadow
              >
                <boxGeometry args={[0.02, 0.42, 0.015]} />
                <Mat color="#B8956A" {...m} />
              </mesh>
            )
          })}
          <mesh
            position={[0, 0.52, -0.05]}
            rotation={[-0.8, 0, 0]}
            castShadow
          >
            <cylinderGeometry args={[0.16, 0.16, 0.03, 16, 1, false, 0, Math.PI]} />
            <Mat color={tint} {...m} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.16, 0.35, 0]} castShadow>
              <torusGeometry args={[0.04, 0.012, 6, 12]} />
              <Mat color="#B8956A" {...m} />
            </mesh>
          ))}
          <mesh position={[0.04, 0.55, 0.04]} castShadow>
            <sphereGeometry args={[0.06, 10, 8]} />
            <Mat color="#70A0D0" {...m} />
          </mesh>
          <mesh position={[-0.05, 0.52, 0.02]} castShadow>
            <sphereGeometry args={[0.05, 10, 8]} />
            <Mat color="#E8A0B0" {...m} />
          </mesh>
        </group>
      )
    }

    case 'floorLamp': {
      return (
        <group>
          <mesh position={[0, 0.04, 0]} castShadow>
            <cylinderGeometry args={[0.14, 0.16, 0.08, 16]} />
            <Mat color="#6A6A6E" {...m} />
          </mesh>
          <mesh position={[0, 0.55, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 1.0, 8]} />
            <Mat color={CHROME} {...m} metalness={0.55} roughness={0.3} />
          </mesh>
          {/* Gooseneck */}
          <mesh
            position={[0.08, 1.1, 0]}
            rotation={[0, 0, -1.1]}
            castShadow
          >
            <cylinderGeometry args={[0.018, 0.018, 0.28, 8]} />
            <Mat color={CHROME} {...m} metalness={0.55} roughness={0.3} />
          </mesh>
          <mesh
            position={[0.22, 1.05, 0]}
            rotation={[0.4, 0, -0.3]}
            castShadow
          >
            <cylinderGeometry args={[0.12, 0.16, 0.14, 16]} />
            <Mat color={tint} {...m} />
          </mesh>
          <mesh position={[0.22, 1.02, 0]}>
            <sphereGeometry args={[0.04, 10, 8]} />
            <Mat
              color="#FFE8B0"
              {...m}
              emissive="#FFE8B0"
              emissiveIntensity={0.6}
            />
          </mesh>
        </group>
      )
    }

    case 'booksStack': {
      const colors = [tint, '#70A0D0', '#E0C060', '#80C080']
      return (
        <group>
          {colors.map((c, i) => (
            <mesh
              key={i}
              position={[i * 0.01, 0.025 + i * 0.045, i * 0.008]}
              castShadow
            >
              <boxGeometry args={[0.16 - i * 0.01, 0.04, 0.12]} />
              <Mat color={c} {...m} />
            </mesh>
          ))}
          <mesh position={[0.08, 0.1, 0]} castShadow>
            <boxGeometry args={[0.01, 0.14, 0.1]} />
            <Mat color="#F5F0EA" {...m} />
          </mesh>
          <mesh position={[0.02, 0.2, 0]} castShadow>
            <boxGeometry args={[0.02, 0.08, 0.01]} />
            <Mat color="#E05050" {...m} />
          </mesh>
        </group>
      )
    }

    case 'crayonBox': {
      const crayons = ['#E05050', '#E87840', '#E0C060', '#80C070', '#70A0D0']
      return (
        <group>
          <mesh position={[0, 0.06, 0]} castShadow>
            <boxGeometry args={[0.16, 0.12, 0.1]} />
            <Mat color={tint} {...m} />
          </mesh>
          <mesh position={[0, 0.08, 0.052]} castShadow>
            <boxGeometry args={[0.12, 0.06, 0.01]} />
            <Mat color="#FFF8E0" {...m} />
          </mesh>
          {crayons.map((c, i) => (
            <group key={c} position={[(i - 2) * 0.028, 0.16 + (i % 3) * 0.02, 0]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.012, 0.012, 0.14, 8]} />
                <Mat color={c} {...m} />
              </mesh>
              <mesh position={[0, 0.08, 0]} castShadow>
                <coneGeometry args={[0.012, 0.04, 8]} />
                <Mat color="#F5E6D0" {...m} />
              </mesh>
            </group>
          ))}
        </group>
      )
    }

    case 'dollPram': {
      return (
        <group>
          <mesh position={[0, 0.22, 0]} castShadow>
            <boxGeometry args={[0.22, 0.12, 0.14]} />
            <Mat color={tint} {...m} />
          </mesh>
          <mesh
            position={[-0.02, 0.32, 0]}
            rotation={[0, 0, Math.PI / 2]}
            castShadow
          >
            <cylinderGeometry
              args={[0.1, 0.1, 0.14, 16, 1, false, 0, Math.PI]}
            />
            <Mat color={tint} {...m} />
          </mesh>
          <mesh position={[0, 0.24, 0]} castShadow>
            <sphereGeometry args={[0.05, 10, 8]} />
            <Mat color="#FFE8F0" {...m} />
          </mesh>
          <mesh
            position={[0.14, 0.35, 0]}
            rotation={[0, 0, 0.4]}
            castShadow
          >
            <cylinderGeometry args={[0.012, 0.012, 0.28, 6]} />
            <Mat color={CHROME} {...m} />
          </mesh>
          {[
            [-0.08, 0.08, 0.04],
            [-0.08, -0.08, 0.04],
            [0.08, 0.09, 0.05],
            [0.08, -0.09, 0.05],
          ].map(([x, z, r], i) => (
            <mesh
              key={i}
              position={[x, r, z]}
              rotation={[Math.PI / 2, 0, 0]}
              castShadow
            >
              <cylinderGeometry args={[r, r, 0.03, 12]} />
              <Mat color="#2A2A2E" {...m} />
            </mesh>
          ))}
        </group>
      )
    }

    case 'cloudRug': {
      return (
        <group>
          {[
            [0, 0],
            [-0.2, 0.05],
            [0.22, 0.02],
            [-0.05, -0.12],
            [0.12, -0.1],
          ].map(([x, z], i) => (
            <mesh
              key={i}
              position={[x * w, 0.03, z * d]}
              scale={[1, 0.35, 1]}
              castShadow
              receiveShadow
            >
              <sphereGeometry args={[0.14 + (i % 3) * 0.02, 14, 10]} />
              <Mat color={tint} {...m} />
            </mesh>
          ))}
        </group>
      )
    }

    case 'pouf': {
      return (
        <group>
          <mesh position={[0, 0.16, 0]} scale={[1.15, 0.85, 1.15]} castShadow>
            <cylinderGeometry args={[0.2, 0.18, 0.32, 20]} />
            <Mat color={tint} {...m} roughness={0.92} />
          </mesh>
          <mesh position={[0, 0.32, 0]} castShadow>
            <sphereGeometry args={[0.04, 10, 8]} />
            <Mat color={tint} {...m} roughness={0.92} />
          </mesh>
          <mesh position={[0, 0.16, 0.2]} castShadow>
            <boxGeometry args={[0.015, 0.28, 0.01]} />
            <Mat color="#E08090" {...m} />
          </mesh>
        </group>
      )
    }

    case 'floorMattress': {
      return (
        <group>
          <mesh position={[0, 0.06, 0]} castShadow receiveShadow>
            <boxGeometry args={[w * 0.96, 0.12, d * 0.96]} />
            <Mat color={tint} {...m} roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.13, 0]} castShadow>
            <boxGeometry args={[w * 0.9, 0.04, d * 0.9]} />
            <Mat color="#FFF8F0" {...m} roughness={0.88} />
          </mesh>
          <mesh position={[0, 0.16, -d * 0.28]} castShadow>
            <boxGeometry args={[w * 0.55, 0.08, d * 0.22]} />
            <Mat color="#FFE8F0" {...m} roughness={0.9} />
          </mesh>
          {[-0.2, 0.2].map((x) => (
            <mesh key={x} position={[x * w, 0.18, -d * 0.28]} castShadow>
              <sphereGeometry args={[0.05, 10, 8]} />
              <Mat color="#FFF0F5" {...m} roughness={0.92} />
            </mesh>
          ))}
        </group>
      )
    }

    case 'photoFrame': {
      return (
        <group>
          <mesh position={[0, 0.14, 0]} castShadow>
            <boxGeometry args={[0.22, 0.26, 0.04]} />
            <Mat color={tint} {...m} />
          </mesh>
          <mesh position={[0, 0.14, 0.018]} castShadow>
            <boxGeometry args={[0.16, 0.18, 0.01]} />
            <Mat color="#FFE8D0" {...m} />
          </mesh>
          <mesh position={[0, 0.16, 0.025]} castShadow>
            <sphereGeometry args={[0.04, 10, 8]} />
            <Mat color="#F0B090" {...m} />
          </mesh>
          <mesh position={[0, 0.1, 0.025]} castShadow scale={[1, 0.7, 0.5]}>
            <sphereGeometry args={[0.05, 10, 8]} />
            <Mat color="#70A0D0" {...m} />
          </mesh>
          <mesh position={[0, 0.01, 0.04]} castShadow>
            <boxGeometry args={[0.18, 0.02, 0.08]} />
            <Mat color={tint} {...m} />
          </mesh>
        </group>
      )
    }

    default:
      return (
        <SoftBox
          args={[w * 0.8, 0.3, d * 0.8]}
          position={[0, 0.15, 0]}
          color={tint}
          {...m}
        />
      )
  }
}
