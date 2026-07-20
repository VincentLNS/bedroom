/** Stylish kid-bedroom extras — vanity, castle, rainbow, garden fun. */

import { GOLD, Mat, OAK, WHITE, type MatProps } from './MeshKit'

export type StylishKind =
  | 'vanityPink'
  | 'starMobile'
  | 'mushroomLamp'
  | 'rainbowShelf'
  | 'musicBox'
  | 'fairyLights'
  | 'toyCastle'
  | 'dreamcatcher'
  | 'toySlide'
  | 'gardenSwing'
  | 'miniTrampoline'
  | 'cloudShelf'

export function StylishPrimitive({
  kind,
  footprint,
  tint = '#F0A0B8',
  opacity = 1,
  selected = false,
}: {
  kind: StylishKind
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
    case 'vanityPink': {
      const topY = 0.72
      return (
        <group>
          <mesh position={[0, topY, 0]} castShadow>
            <boxGeometry args={[w * 0.92, 0.05, d * 0.7]} />
            <Mat color={WHITE} {...m} />
          </mesh>
          <mesh position={[0, topY + 0.02, 0]} castShadow>
            <boxGeometry args={[w * 0.5, 0.01, d * 0.4]} />
            <Mat color={tint} {...m} />
          </mesh>
          <mesh position={[-w * 0.28, 0.36, 0]} castShadow>
            <boxGeometry args={[w * 0.28, 0.7, d * 0.62]} />
            <Mat color={tint} {...m} />
          </mesh>
          <mesh position={[w * 0.28, 0.36, 0]} castShadow>
            <boxGeometry args={[w * 0.28, 0.7, d * 0.62]} />
            <Mat color={tint} {...m} />
          </mesh>
          {/* Miroir ovale */}
          <mesh position={[0, 1.05, -d * 0.2]} castShadow>
            <cylinderGeometry args={[0.16, 0.16, 0.04, 20]} />
            <Mat color={GOLD} {...m} metalness={0.4} roughness={0.35} />
          </mesh>
          <mesh position={[0, 1.05, -d * 0.18]} rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.13, 20]} />
            <Mat color="#C8E4F8" {...m} metalness={0.2} roughness={0.15} />
          </mesh>
          <mesh position={[-0.08, topY + 0.06, 0.05]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 0.08, 10]} />
            <Mat color="#F8D0E0" {...m} />
          </mesh>
          <mesh position={[0.08, topY + 0.05, 0.06]} castShadow>
            <sphereGeometry args={[0.035, 10, 8]} />
            <Mat color="#FFB0C8" {...m} />
          </mesh>
        </group>
      )
    }

    case 'starMobile': {
      const colors = [tint, '#F0D040', '#A8D0F0', '#C8A0E8', '#F08070']
      return (
        <group>
          <mesh position={[0, 0.55, 0]} castShadow>
            <cylinderGeometry args={[0.015, 0.02, 1.1, 8]} />
            <Mat color={OAK} {...m} />
          </mesh>
          <mesh position={[0, 1.12, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.12, 0.02, 12]} />
            <Mat color={OAK} {...m} />
          </mesh>
          {colors.map((c, i) => {
            const a = (i / colors.length) * Math.PI * 2
            return (
              <group key={i} position={[Math.cos(a) * 0.18, 0.95 - i * 0.06, Math.sin(a) * 0.18]}>
                <mesh castShadow>
                  <cylinderGeometry args={[0.004, 0.004, 0.2, 6]} />
                  <Mat color="#E8E0D0" {...m} />
                </mesh>
                <mesh position={[0, -0.12, 0]} rotation={[0, 0, Math.PI / 5]} castShadow>
                  <octahedronGeometry args={[0.05, 0]} />
                  <Mat color={c} {...m} />
                </mesh>
              </group>
            )
          })}
        </group>
      )
    }

    case 'mushroomLamp': {
      return (
        <group>
          <mesh position={[0, 0.12, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.08, 0.24, 14]} />
            <Mat color="#FFF5E8" {...m} />
          </mesh>
          <mesh position={[0, 0.28, 0]} castShadow>
            <sphereGeometry args={[0.16, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <Mat color={tint} {...m} emissive={tint} emissiveIntensity={0.25} />
          </mesh>
          {[0, 1, 2, 3, 4].map((i) => {
            const a = (i / 5) * Math.PI * 2
            return (
              <mesh
                key={i}
                position={[Math.cos(a) * 0.09, 0.32, Math.sin(a) * 0.09]}
                castShadow
              >
                <sphereGeometry args={[0.025, 8, 6]} />
                <Mat color="#FFF8E0" {...m} />
              </mesh>
            )
          })}
        </group>
      )
    }

    case 'rainbowShelf': {
      const cols = ['#F07070', '#F0A040', '#F0D040', '#70C070', '#70A0E0', '#A070E0']
      return (
        <group>
          <mesh position={[0, 0.58, 0]} castShadow>
            <boxGeometry args={[w * 0.95, 0.06, d * 0.55]} />
            <Mat color={WHITE} {...m} />
          </mesh>
          <mesh position={[0, 0.04, 0]} castShadow>
            <boxGeometry args={[w * 0.95, 0.06, d * 0.55]} />
            <Mat color={WHITE} {...m} />
          </mesh>
          {cols.map((c, i) => (
            <group key={c}>
              <mesh position={[(i - 2.5) * 0.13, 0.3, 0]} castShadow>
                <boxGeometry args={[0.11, 0.48, d * 0.42]} />
                <Mat color={c} {...m} />
              </mesh>
              <mesh position={[(i - 2.5) * 0.13, 0.3, d * 0.22]} castShadow>
                <boxGeometry args={[0.08, 0.1, 0.02]} />
                <Mat color={WHITE} {...m} />
              </mesh>
            </group>
          ))}
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[(i - 1) * 0.08, 0.66, 0]} castShadow>
              <boxGeometry args={[0.06, 0.1, 0.08]} />
              <Mat color={cols[i + 1]} {...m} />
            </mesh>
          ))}
        </group>
      )
    }

    case 'musicBox': {
      return (
        <group>
          <mesh position={[0, 0.08, 0]} castShadow>
            <boxGeometry args={[0.22, 0.14, 0.18]} />
            <Mat color={tint} {...m} />
          </mesh>
          <mesh position={[0, 0.16, 0]} castShadow>
            <boxGeometry args={[0.24, 0.03, 0.2]} />
            <Mat color={GOLD} {...m} metalness={0.35} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.28, 0]} castShadow>
            <cylinderGeometry args={[0.025, 0.03, 0.2, 10]} />
            <Mat color="#F8E0F0" {...m} />
          </mesh>
          <mesh position={[0, 0.4, 0]} castShadow>
            <sphereGeometry args={[0.045, 12, 10]} />
            <Mat color="#F8E0F0" {...m} />
          </mesh>
          <mesh position={[0, 0.42, 0]} rotation={[0.2, 0, 0]} castShadow scale={[1.4, 0.3, 0.8]}>
            <sphereGeometry args={[0.06, 10, 8]} />
            <Mat color={tint} {...m} />
          </mesh>
        </group>
      )
    }

    case 'fairyLights': {
      return (
        <group>
          <mesh position={[0, 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.025, 1.0, 8]} />
            <Mat color={OAK} {...m} />
          </mesh>
          {Array.from({ length: 8 }, (_, i) => {
            const t = i / 7
            const x = Math.sin(t * Math.PI * 2) * 0.12
            const y = 0.85 - t * 0.55
            const z = Math.cos(t * Math.PI * 2) * 0.08
            return (
              <mesh key={i} position={[x, y, z]} castShadow>
                <sphereGeometry args={[0.03, 8, 6]} />
                <Mat
                  color={i % 2 ? '#FFE8A0' : tint}
                  {...m}
                  emissive={i % 2 ? '#FFE8A0' : tint}
                  emissiveIntensity={0.4}
                />
              </mesh>
            )
          })}
        </group>
      )
    }

    case 'toyCastle': {
      return (
        <group>
          <mesh position={[0, 0.2, 0]} castShadow>
            <boxGeometry args={[w * 0.7, 0.4, d * 0.55]} />
            <Mat color="#F5F0EA" {...m} />
          </mesh>
          {([-1, 1] as const).map((s) => (
            <group key={s} position={[s * w * 0.28, 0, 0]}>
              <mesh position={[0, 0.28, 0]} castShadow>
                <cylinderGeometry args={[0.08, 0.09, 0.55, 12]} />
                <Mat color="#F5F0EA" {...m} />
              </mesh>
              <mesh position={[0, 0.58, 0]} castShadow>
                <coneGeometry args={[0.1, 0.16, 10]} />
                <Mat color={tint} {...m} />
              </mesh>
            </group>
          ))}
          <mesh position={[0, 0.22, d * 0.28]} castShadow>
            <boxGeometry args={[0.1, 0.16, 0.04]} />
            <Mat color={GOLD} {...m} />
          </mesh>
          <mesh position={[0, 0.48, 0]} castShadow>
            <boxGeometry args={[w * 0.35, 0.12, d * 0.4]} />
            <Mat color={tint} {...m} />
          </mesh>
        </group>
      )
    }

    case 'dreamcatcher': {
      return (
        <group>
          <mesh position={[0, 0.55, 0]} castShadow>
            <cylinderGeometry args={[0.012, 0.015, 1.1, 8]} />
            <Mat color={OAK} {...m} />
          </mesh>
          <mesh position={[0, 1.05, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={[0.12, 0.015, 8, 20]} />
            <Mat color={tint} {...m} />
          </mesh>
          {[0, 1, 2, 3].map((i) => (
            <mesh
              key={i}
              position={[
                Math.cos((i / 4) * Math.PI * 2) * 0.06,
                0.9 - i * 0.08,
                Math.sin((i / 4) * Math.PI * 2) * 0.06,
              ]}
              castShadow
            >
              <sphereGeometry args={[0.025, 8, 6]} />
              <Mat color={['#F0D040', '#70C0E0', tint, '#C8A0E8'][i]} {...m} />
            </mesh>
          ))}
          {[-1, 0, 1].map((s) => (
            <mesh key={s} position={[s * 0.05, 0.72, 0]} castShadow scale={[0.4, 1.2, 0.3]}>
              <sphereGeometry args={[0.04, 8, 6]} />
              <Mat color="#E8D0B0" {...m} />
            </mesh>
          ))}
        </group>
      )
    }

    case 'toySlide': {
      return (
        <group>
          {([-1, 1] as const).map((s) => (
            <mesh key={s} position={[-w * 0.18, 0.4, s * d * 0.18]} castShadow>
              <cylinderGeometry args={[0.025, 0.03, 0.8, 8]} />
              <Mat color={tint} {...m} />
            </mesh>
          ))}
          {[0.15, 0.35, 0.55].map((y) => (
            <mesh key={y} position={[-w * 0.18, y, 0]} castShadow>
              <boxGeometry args={[0.04, 0.03, d * 0.4]} />
              <Mat color="#F0D040" {...m} />
            </mesh>
          ))}
          {[0, 1, 2, 3, 4].map((i) => {
            const t = i / 4
            return (
              <mesh
                key={i}
                position={[-w * 0.05 + t * w * 0.45, 0.62 - t * 0.52, 0]}
                rotation={[0, 0, -0.55]}
                castShadow
              >
                <boxGeometry args={[0.18, 0.05, d * 0.38]} />
                <Mat color="#7EC8E8" {...m} />
              </mesh>
            )
          })}
          {([-1, 1] as const).map((s) => (
            <mesh
              key={`r${s}`}
              position={[w * 0.08, 0.35, s * d * 0.2]}
              rotation={[0, 0, -0.55]}
              castShadow
            >
              <boxGeometry args={[0.55, 0.03, 0.03]} />
              <Mat color={tint} {...m} />
            </mesh>
          ))}
          <mesh position={[w * 0.32, 0.05, 0]} castShadow>
            <boxGeometry args={[0.18, 0.08, d * 0.42]} />
            <Mat color="#F0D040" {...m} />
          </mesh>
        </group>
      )
    }

    case 'gardenSwing': {
      return (
        <group>
          {([-1, 1] as const).map((s) => (
            <group key={s}>
              <mesh
                position={[s * 0.24, 0.55, 0.08]}
                rotation={[0.12, 0, s * 0.08]}
                castShadow
              >
                <cylinderGeometry args={[0.028, 0.035, 1.15, 8]} />
                <Mat color={OAK} {...m} />
              </mesh>
              <mesh
                position={[s * 0.24, 0.55, -0.08]}
                rotation={[-0.12, 0, s * 0.08]}
                castShadow
              >
                <cylinderGeometry args={[0.028, 0.035, 1.15, 8]} />
                <Mat color={OAK} {...m} />
              </mesh>
            </group>
          ))}
          <mesh position={[0, 1.1, 0]} castShadow>
            <boxGeometry args={[0.55, 0.05, 0.08]} />
            <Mat color={OAK} {...m} />
          </mesh>
          {([-1, 1] as const).map((s) => (
            <mesh key={`r${s}`} position={[s * 0.1, 0.72, 0]} castShadow>
              <cylinderGeometry args={[0.01, 0.01, 0.72, 6]} />
              <Mat color="#E8E0D0" {...m} />
            </mesh>
          ))}
          <mesh position={[0, 0.36, 0]} castShadow>
            <boxGeometry args={[0.3, 0.045, 0.18]} />
            <Mat color={tint} {...m} roughness={0.88} />
          </mesh>
          <mesh position={[0, 0.42, -0.06]} castShadow>
            <boxGeometry args={[0.28, 0.12, 0.04]} />
            <Mat color={tint} {...m} roughness={0.88} />
          </mesh>
        </group>
      )
    }

    case 'miniTrampoline': {
      return (
        <group>
          <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={[0.28, 0.035, 8, 24]} />
            <Mat color={tint} {...m} />
          </mesh>
          <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <circleGeometry args={[0.26, 24]} />
            <Mat color="#E8F0FF" {...m} />
          </mesh>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const a = (i / 6) * Math.PI * 2
            return (
              <mesh
                key={i}
                position={[Math.cos(a) * 0.28, 0.06, Math.sin(a) * 0.28]}
                castShadow
              >
                <cylinderGeometry args={[0.02, 0.025, 0.12, 8]} />
                <Mat color="#C0C4C8" {...m} metalness={0.4} roughness={0.4} />
              </mesh>
            )
          })}
        </group>
      )
    }

    case 'cloudShelf': {
      return (
        <group>
          <mesh position={[0, 0.55, 0]} castShadow scale={[1.4, 0.7, 0.7]}>
            <sphereGeometry args={[0.16, 14, 12]} />
            <Mat color={WHITE} {...m} />
          </mesh>
          <mesh position={[-0.14, 0.5, 0]} castShadow scale={[1, 0.75, 0.7]}>
            <sphereGeometry args={[0.12, 12, 10]} />
            <Mat color={WHITE} {...m} />
          </mesh>
          <mesh position={[0.14, 0.5, 0]} castShadow scale={[1, 0.75, 0.7]}>
            <sphereGeometry args={[0.12, 12, 10]} />
            <Mat color={WHITE} {...m} />
          </mesh>
          <mesh position={[0, 0.42, 0]} castShadow>
            <boxGeometry args={[w * 0.85, 0.05, d * 0.45]} />
            <Mat color={tint} {...m} />
          </mesh>
          <mesh position={[-0.1, 0.28, 0]} castShadow>
            <boxGeometry args={[0.04, 0.28, 0.04]} />
            <Mat color={OAK} {...m} />
          </mesh>
          <mesh position={[0.1, 0.28, 0]} castShadow>
            <boxGeometry args={[0.04, 0.28, 0.04]} />
            <Mat color={OAK} {...m} />
          </mesh>
        </group>
      )
    }

    default:
      return (
        <mesh position={[0, 0.15, 0]} castShadow>
          <boxGeometry args={[w * 0.7, 0.3, d * 0.7]} />
          <Mat color={tint} {...m} />
        </mesh>
      )
  }
}
