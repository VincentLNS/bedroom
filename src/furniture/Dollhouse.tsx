/** Maison de poupée — volume fermé lisible (fenêtres + porte), toit simple. */

import {
  DUSTY_ROSE,
  GOLD,
  Mat,
  OAK,
  WHITE,
  type MatProps,
} from './MeshKit'

const GREY = '#8A8E94'
const GREY_DARK = '#6E7278'
const SHUTTER = '#7A7E84'
const GLASS = '#A8D0E8'
const PINK = '#E8A8B8'

const WIN_W = 0.14
const WIN_H = 0.14

function WindowPane({
  position,
  m,
}: {
  position: [number, number, number]
  m: MatProps
}) {
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[WIN_W, WIN_H, 0.03]} />
        <Mat color={GLASS} {...m} emissive={GLASS} emissiveIntensity={0.1} />
      </mesh>
      <mesh position={[0, 0, 0.012]} castShadow>
        <boxGeometry args={[0.012, WIN_H, 0.01]} />
        <Mat color={WHITE} {...m} />
      </mesh>
      <mesh position={[0, 0, 0.012]} castShadow>
        <boxGeometry args={[WIN_W, 0.012, 0.01]} />
        <Mat color={WHITE} {...m} />
      </mesh>
      {([-1, 1] as const).map((s) => (
        <mesh key={s} position={[s * (WIN_W / 2 + 0.02), 0, 0.01]} castShadow>
          <boxGeometry args={[0.03, WIN_H + 0.015, 0.015]} />
          <Mat color={SHUTTER} {...m} />
        </mesh>
      ))}
    </group>
  )
}

export function DollhouseMesh({
  w,
  d,
  tint = WHITE,
  opacity = 1,
  selected = false,
}: {
  w: number
  d: number
} & MatProps & { tint?: string }) {
  const m = { opacity, selected }
  const bodyW = w * 0.88
  const bodyD = d * 0.78
  const floorH = 0.34
  const floors = 3
  const bodyH = floorH * floors
  const facade = tint || WHITE
  const yBase = 0.05

  return (
    <group>
      {/* Socle */}
      <mesh position={[0, 0.025, 0]} castShadow receiveShadow>
        <boxGeometry args={[bodyW + 0.1, 0.05, bodyD + 0.1]} />
        <Mat color={OAK} {...m} />
      </mesh>

      {/* Corps — boîte pleine */}
      <mesh position={[0, yBase + bodyH / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[bodyW, bodyH, bodyD]} />
        <Mat color={facade} {...m} />
      </mesh>

      {/* Bandes d’étage */}
      {[1, 2].map((i) => (
        <mesh
          key={i}
          position={[0, yBase + floorH * i, bodyD / 2 + 0.001]}
          castShadow
        >
          <boxGeometry args={[bodyW * 0.98, 0.02, 0.01]} />
          <Mat color={OAK} {...m} />
        </mesh>
      ))}

      {/* Fenêtres façade (+Z) */}
      {Array.from({ length: floors }, (_, i) => {
        const y = yBase + floorH * i + floorH * 0.55
        return (
          <group key={`f-${i}`}>
            {([-1, 1] as const).map((s) => (
              <WindowPane
                key={s}
                position={[s * bodyW * 0.22, y, bodyD / 2 + 0.01]}
                m={m}
              />
            ))}
          </group>
        )
      })}

      {/* Fenêtres arrière (−Z) */}
      {Array.from({ length: floors }, (_, i) => {
        const y = yBase + floorH * i + floorH * 0.55
        return (
          <WindowPane
            key={`b-${i}`}
            position={[0, y, -bodyD / 2 - 0.01]}
            m={m}
          />
        )
      })}

      {/* Porte RDC */}
      <mesh position={[0, yBase + 0.16, bodyD / 2 + 0.01]} castShadow>
        <boxGeometry args={[0.14, 0.28, 0.02]} />
        <Mat color={DUSTY_ROSE} {...m} />
      </mesh>
      <mesh position={[0.04, yBase + 0.16, bodyD / 2 + 0.025]} castShadow>
        <sphereGeometry args={[0.015, 8, 6]} />
        <Mat color={GOLD} {...m} />
      </mesh>

      {/* Toit plat overhang — silhouette nette, zéro rotation foireuse */}
      <mesh position={[0, yBase + bodyH + 0.04, 0]} castShadow>
        <boxGeometry args={[bodyW * 1.12, 0.08, bodyD * 1.12]} />
        <Mat color={GREY} {...m} />
      </mesh>
      <mesh position={[0, yBase + bodyH + 0.1, 0]} castShadow>
        <boxGeometry args={[bodyW * 0.35, 0.1, bodyD * 0.35]} />
        <Mat color={GREY_DARK} {...m} />
      </mesh>
      <mesh
        position={[bodyW * 0.2, yBase + bodyH + 0.2, -bodyD * 0.05]}
        castShadow
      >
        <boxGeometry args={[0.07, 0.14, 0.07]} />
        <Mat color={GREY} {...m} />
      </mesh>
      <mesh
        position={[bodyW * 0.2, yBase + bodyH + 0.28, -bodyD * 0.05]}
        castShadow
      >
        <boxGeometry args={[0.1, 0.025, 0.1]} />
        <Mat color={GREY_DARK} {...m} />
      </mesh>

      {/* Jardinières */}
      {([-1, 1] as const).map((s) => (
        <group
          key={s}
          position={[s * bodyW * 0.28, yBase + floorH * 0.2, bodyD / 2 + 0.04]}
        >
          <mesh castShadow>
            <boxGeometry args={[0.1, 0.04, 0.06]} />
            <Mat color={OAK} {...m} />
          </mesh>
          <mesh position={[0, 0.04, 0]} castShadow>
            <sphereGeometry args={[0.035, 8, 6]} />
            <Mat color="#6FA87A" {...m} />
          </mesh>
        </group>
      ))}

      {/* Drapeau */}
      <group position={[-bodyW * 0.15, yBase + bodyH + 0.22, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.007, 0.007, 0.16, 6]} />
          <Mat color={OAK} {...m} />
        </mesh>
        <mesh position={[0.04, 0.04, 0]} castShadow>
          <boxGeometry args={[0.07, 0.04, 0.01]} />
          <Mat color={PINK} {...m} />
        </mesh>
      </group>

      {/* Liseré mural */}
      <mesh position={[bodyW / 2 + 0.001, yBase + bodyH / 2, 0]} castShadow>
        <boxGeometry args={[0.01, bodyH * 0.95, bodyD * 0.9]} />
        <Mat color="#E8E4DE" {...m} />
      </mesh>
    </group>
  )
}
