/** Stylized low-poly Stitch & Angel — readable at dollhouse scale. */

type MatProps = {
  opacity?: number
  selected?: boolean
}

const SELECT_EMISSIVE = '#fff4dc'
const SELECT_EMISSIVE_INTENSITY = 0.35

function Mat({
  color,
  opacity = 1,
  selected = false,
}: {
  color: string
} & MatProps) {
  const transparent = opacity < 1
  return (
    <meshStandardMaterial
      color={color}
      transparent={transparent}
      opacity={opacity}
      depthWrite
      emissive={selected ? SELECT_EMISSIVE : '#000000'}
      emissiveIntensity={selected ? SELECT_EMISSIVE_INTENSITY : 0}
      roughness={0.85}
    />
  )
}

function Eye({
  position,
  scale = 1,
  opacity = 1,
  selected = false,
}: {
  position: [number, number, number]
  scale?: number
} & MatProps) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow>
        <sphereGeometry args={[0.038, 12, 10]} />
        <Mat color="#F8F8F8" opacity={opacity} selected={selected} />
      </mesh>
      <mesh position={[0, -0.004, 0.022]} castShadow>
        <sphereGeometry args={[0.026, 12, 10]} />
        <Mat color="#1A1A22" opacity={opacity} selected={selected} />
      </mesh>
      <mesh position={[0.008, 0.01, 0.04]}>
        <sphereGeometry args={[0.008, 8, 6]} />
        <Mat color="#FFFFFF" opacity={opacity} selected={selected} />
      </mesh>
    </group>
  )
}

/** Disney-blue experiment 626 — notched ears, big eyes, light belly. */
export function PlushStitch({
  tint = '#4A90D9',
  opacity = 1,
  selected = false,
}: {
  tint?: string
} & MatProps) {
  const m = { opacity, selected }
  const blue = tint
  const blueDark = '#2B5F9E'
  const belly = '#D6ECFA'
  const navy = '#1C2A44'

  return (
    <group>
      {/* Seated body */}
      <mesh position={[0, 0.14, 0.02]} castShadow scale={[1, 1.05, 0.9]}>
        <sphereGeometry args={[0.13, 18, 14]} />
        <Mat color={blue} {...m} />
      </mesh>
      {/* Light belly patch */}
      <mesh position={[0, 0.13, 0.1]} castShadow scale={[0.72, 0.85, 0.35]}>
        <sphereGeometry args={[0.11, 14, 12]} />
        <Mat color={belly} {...m} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.34, 0.04]} castShadow>
        <sphereGeometry args={[0.125, 18, 14]} />
        <Mat color={blue} {...m} />
      </mesh>
      {/* Dark head marking */}
      <mesh position={[0, 0.4, -0.04]} castShadow scale={[0.7, 0.55, 0.45]}>
        <sphereGeometry args={[0.08, 12, 10]} />
        <Mat color={blueDark} {...m} />
      </mesh>
      {/* Muzzle */}
      <mesh position={[0, 0.3, 0.12]} castShadow scale={[1.1, 0.75, 0.7]}>
        <sphereGeometry args={[0.055, 12, 10]} />
        <Mat color={belly} {...m} />
      </mesh>
      {/* Nose */}
      <mesh position={[0, 0.312, 0.16]} castShadow scale={[1.1, 0.85, 0.7]}>
        <sphereGeometry args={[0.028, 10, 8]} />
        <Mat color={navy} {...m} />
      </mesh>
      {/* Eyes — close-set classic Stitch look */}
      <Eye position={[-0.042, 0.36, 0.13]} {...m} />
      <Eye position={[0.042, 0.36, 0.13]} {...m} />
      {/* Antennae */}
      <mesh position={[-0.035, 0.46, 0.02]} castShadow>
        <cylinderGeometry args={[0.008, 0.01, 0.06, 6]} />
        <Mat color={navy} {...m} />
      </mesh>
      <mesh position={[0.035, 0.46, 0.02]} castShadow>
        <cylinderGeometry args={[0.008, 0.01, 0.06, 6]} />
        <Mat color={navy} {...m} />
      </mesh>
      <mesh position={[-0.035, 0.5, 0.02]} castShadow>
        <sphereGeometry args={[0.014, 8, 6]} />
        <Mat color={navy} {...m} />
      </mesh>
      <mesh position={[0.035, 0.5, 0.02]} castShadow>
        <sphereGeometry args={[0.014, 8, 6]} />
        <Mat color={navy} {...m} />
      </mesh>
      {/* Tall notched ears */}
      <group position={[-0.11, 0.42, -0.02]} rotation={[0.15, 0, 0.45]}>
        <mesh castShadow scale={[0.55, 1.35, 0.35]}>
          <sphereGeometry args={[0.09, 12, 10]} />
          <Mat color={blue} {...m} />
        </mesh>
        <mesh position={[0, 0.02, 0.02]} castShadow scale={[0.35, 0.9, 0.2]}>
          <sphereGeometry args={[0.07, 10, 8]} />
          <Mat color="#F0A8C0" {...m} />
        </mesh>
        {/* Notch cut hint */}
        <mesh position={[0.02, 0.08, 0]} castShadow scale={[0.4, 0.35, 0.5]}>
          <sphereGeometry args={[0.04, 8, 6]} />
          <Mat color={blueDark} {...m} />
        </mesh>
      </group>
      <group position={[0.11, 0.42, -0.02]} rotation={[0.15, 0, -0.45]}>
        <mesh castShadow scale={[0.55, 1.35, 0.35]}>
          <sphereGeometry args={[0.09, 12, 10]} />
          <Mat color={blue} {...m} />
        </mesh>
        <mesh position={[0, 0.02, 0.02]} castShadow scale={[0.35, 0.9, 0.2]}>
          <sphereGeometry args={[0.07, 10, 8]} />
          <Mat color="#F0A8C0" {...m} />
        </mesh>
        <mesh position={[-0.02, 0.08, 0]} castShadow scale={[0.4, 0.35, 0.5]}>
          <sphereGeometry args={[0.04, 8, 6]} />
          <Mat color={blueDark} {...m} />
        </mesh>
      </group>
      {/* Arms */}
      <mesh
        position={[-0.14, 0.16, 0.06]}
        rotation={[0.3, 0, 0.8]}
        castShadow
        scale={[0.45, 1, 0.45]}
      >
        <sphereGeometry args={[0.07, 10, 8]} />
        <Mat color={blue} {...m} />
      </mesh>
      <mesh
        position={[0.14, 0.16, 0.06]}
        rotation={[0.3, 0, -0.8]}
        castShadow
        scale={[0.45, 1, 0.45]}
      >
        <sphereGeometry args={[0.07, 10, 8]} />
        <Mat color={blue} {...m} />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.07, 0.05, 0.08]} castShadow scale={[0.7, 0.55, 0.9]}>
        <sphereGeometry args={[0.055, 10, 8]} />
        <Mat color={blue} {...m} />
      </mesh>
      <mesh position={[0.07, 0.05, 0.08]} castShadow scale={[0.7, 0.55, 0.9]}>
        <sphereGeometry args={[0.055, 10, 8]} />
        <Mat color={blue} {...m} />
      </mesh>
      {/* Tiny claws */}
      {([-0.17, 0.17] as const).map((x) => (
        <mesh key={x} position={[x, 0.12, 0.11]} castShadow>
          <coneGeometry args={[0.012, 0.03, 5]} />
          <Mat color={navy} {...m} />
        </mesh>
      ))}
      {/* Back spines */}
      {[-0.04, 0.02, 0.08].map((_, i) => (
        <mesh
          key={i}
          position={[0, 0.22 + i * 0.04, -0.1]}
          rotation={[-0.5, 0, 0]}
          castShadow
        >
          <coneGeometry args={[0.02, 0.05, 5]} />
          <Mat color={navy} {...m} />
        </mesh>
      ))}
      {/* Toe claws */}
      {([-0.09, -0.05, 0.05, 0.09] as const).map((x) => (
        <mesh key={x} position={[x, 0.02, 0.12]} castShadow>
          <coneGeometry args={[0.01, 0.025, 5]} />
          <Mat color={navy} {...m} />
        </mesh>
      ))}
    </group>
  )
}

/** Pink Experiment 624 — heart nose, white muzzle, softer ears. */
export function PlushAngel({
  tint = '#F4A0BE',
  opacity = 1,
  selected = false,
}: {
  tint?: string
} & MatProps) {
  const m = { opacity, selected }
  const pink = tint
  const pinkDark = '#E0789A'
  const cream = '#FFF5F8'
  const nose = '#E85A8A'

  return (
    <group>
      <mesh position={[0, 0.13, 0.02]} castShadow scale={[1, 1.05, 0.9]}>
        <sphereGeometry args={[0.12, 18, 14]} />
        <Mat color={pink} {...m} />
      </mesh>
      <mesh position={[0, 0.12, 0.09]} castShadow scale={[0.7, 0.8, 0.35]}>
        <sphereGeometry args={[0.1, 14, 12]} />
        <Mat color={cream} {...m} />
      </mesh>
      <mesh position={[0, 0.32, 0.04]} castShadow>
        <sphereGeometry args={[0.115, 18, 14]} />
        <Mat color={pink} {...m} />
      </mesh>
      {/* Cream face muzzle */}
      <mesh position={[0, 0.29, 0.11]} castShadow scale={[1.15, 0.85, 0.75]}>
        <sphereGeometry args={[0.055, 12, 10]} />
        <Mat color={cream} {...m} />
      </mesh>
      {/* Heart-ish nose (two lobes + tip) */}
      <mesh position={[-0.012, 0.3, 0.155]} castShadow>
        <sphereGeometry args={[0.016, 8, 6]} />
        <Mat color={nose} {...m} />
      </mesh>
      <mesh position={[0.012, 0.3, 0.155]} castShadow>
        <sphereGeometry args={[0.016, 8, 6]} />
        <Mat color={nose} {...m} />
      </mesh>
      <mesh position={[0, 0.288, 0.16]} castShadow scale={[0.9, 0.7, 0.7]}>
        <sphereGeometry args={[0.014, 8, 6]} />
        <Mat color={nose} {...m} />
      </mesh>
      <Eye position={[-0.04, 0.345, 0.12]} scale={0.95} {...m} />
      <Eye position={[0.04, 0.345, 0.12]} scale={0.95} {...m} />
      {/* Soft lashes */}
      {([-0.04, 0.04] as const).map((x) =>
        ([-0.012, 0, 0.012] as const).map((dx) => (
          <mesh
            key={`${x}-${dx}`}
            position={[x + dx * 0.4, 0.372, 0.125]}
            rotation={[0.4, 0, x < 0 ? 0.3 : -0.3]}
            castShadow
          >
            <cylinderGeometry args={[0.003, 0.003, 0.022, 4]} />
            <Mat color="#3A2A30" {...m} />
          </mesh>
        )),
      )}
      {/* Antennae */}
      <mesh position={[-0.03, 0.43, 0.02]} castShadow>
        <cylinderGeometry args={[0.007, 0.009, 0.05, 6]} />
        <Mat color={pinkDark} {...m} />
      </mesh>
      <mesh position={[0.03, 0.43, 0.02]} castShadow>
        <cylinderGeometry args={[0.007, 0.009, 0.05, 6]} />
        <Mat color={pinkDark} {...m} />
      </mesh>
      <mesh position={[-0.03, 0.465, 0.02]} castShadow>
        <sphereGeometry args={[0.013, 8, 6]} />
        <Mat color={pinkDark} {...m} />
      </mesh>
      <mesh position={[0.03, 0.465, 0.02]} castShadow>
        <sphereGeometry args={[0.013, 8, 6]} />
        <Mat color={pinkDark} {...m} />
      </mesh>
      {/* Floppy rounded ears */}
      <group position={[-0.1, 0.38, -0.01]} rotation={[0.35, 0.2, 0.9]}>
        <mesh castShadow scale={[0.5, 1.1, 0.32]}>
          <sphereGeometry args={[0.085, 12, 10]} />
          <Mat color={pink} {...m} />
        </mesh>
        <mesh position={[0, 0.01, 0.015]} castShadow scale={[0.32, 0.75, 0.18]}>
          <sphereGeometry args={[0.065, 10, 8]} />
          <Mat color="#FFD0E0" {...m} />
        </mesh>
      </group>
      <group position={[0.1, 0.38, -0.01]} rotation={[0.35, -0.2, -0.9]}>
        <mesh castShadow scale={[0.5, 1.1, 0.32]}>
          <sphereGeometry args={[0.085, 12, 10]} />
          <Mat color={pink} {...m} />
        </mesh>
        <mesh position={[0, 0.01, 0.015]} castShadow scale={[0.32, 0.75, 0.18]}>
          <sphereGeometry args={[0.065, 10, 8]} />
          <Mat color="#FFD0E0" {...m} />
        </mesh>
      </group>
      {/* Arms */}
      <mesh
        position={[-0.13, 0.15, 0.05]}
        rotation={[0.2, 0, 0.7]}
        castShadow
        scale={[0.45, 0.95, 0.45]}
      >
        <sphereGeometry args={[0.065, 10, 8]} />
        <Mat color={pink} {...m} />
      </mesh>
      <mesh
        position={[0.13, 0.15, 0.05]}
        rotation={[0.2, 0, -0.7]}
        castShadow
        scale={[0.45, 0.95, 0.45]}
      >
        <sphereGeometry args={[0.065, 10, 8]} />
        <Mat color={pink} {...m} />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.065, 0.045, 0.07]} castShadow scale={[0.7, 0.5, 0.85]}>
        <sphereGeometry args={[0.05, 10, 8]} />
        <Mat color={pink} {...m} />
      </mesh>
      <mesh position={[0.065, 0.045, 0.07]} castShadow scale={[0.7, 0.5, 0.85]}>
        <sphereGeometry args={[0.05, 10, 8]} />
        <Mat color={pink} {...m} />
      </mesh>
      {/* Blush */}
      {[-0.06, 0.06].map((x) => (
        <mesh key={x} position={[x, 0.3, 0.1]} castShadow>
          <sphereGeometry args={[0.02, 8, 6]} />
          <Mat color="#FFB0C8" {...m} />
        </mesh>
      ))}
      {/* Tail tuft */}
      <mesh position={[0, 0.1, -0.1]} castShadow>
        <sphereGeometry args={[0.04, 8, 6]} />
        <Mat color={pink} {...m} />
      </mesh>
    </group>
  )
}
