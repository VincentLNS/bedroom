/** Shared low-poly mesh helpers for dollhouse furniture. */

export const SELECT_EMISSIVE = '#fff4dc'
export const SELECT_EMISSIVE_INTENSITY = 0.4

export const DUSTY_ROSE = '#C9899A'
export const FLORAL_CREAM = '#F2E6D8'
export const FLORAL_PINK = '#E8A8B8'
export const OAK = '#D4B896'
export const WHITE = '#FAF8F5'
export const CHROME = '#D0D4D8'
export const GOLD = '#D4A84A'

export type MatProps = { opacity?: number; selected?: boolean }

export function Mat({
  color,
  opacity = 1,
  selected = false,
  roughness = 0.72,
  metalness = 0.04,
  emissive,
  emissiveIntensity,
}: {
  color: string
  roughness?: number
  metalness?: number
  emissive?: string
  emissiveIntensity?: number
} & MatProps) {
  const transparent = opacity < 1
  return (
    <meshStandardMaterial
      color={color}
      transparent={transparent}
      opacity={opacity}
      depthWrite
      roughness={roughness}
      metalness={metalness}
      emissive={emissive ?? (selected ? SELECT_EMISSIVE : '#000000')}
      emissiveIntensity={
        emissiveIntensity ?? (selected ? SELECT_EMISSIVE_INTENSITY : 0)
      }
    />
  )
}

/** Soft textiles / plush — high roughness, warm. */
export function SoftMat({
  color,
  opacity = 1,
  selected = false,
}: {
  color: string
} & MatProps) {
  return (
    <Mat
      color={color}
      opacity={opacity}
      selected={selected}
      roughness={0.92}
      metalness={0}
    />
  )
}

/** Wood / painted furniture. */
export function WoodMat({
  color,
  opacity = 1,
  selected = false,
}: {
  color: string
} & MatProps) {
  return (
    <Mat
      color={color}
      opacity={opacity}
      selected={selected}
      roughness={0.78}
      metalness={0.02}
    />
  )
}

/** Chrome / hardware. */
export function MetalMat({
  color = CHROME,
  opacity = 1,
  selected = false,
}: {
  color?: string
} & MatProps) {
  return (
    <Mat
      color={color}
      opacity={opacity}
      selected={selected}
      roughness={0.28}
      metalness={0.72}
    />
  )
}

/** Glass / mirror — low roughness. */
export function GlassMat({
  color = '#C8E4F8',
  opacity = 1,
  selected = false,
}: {
  color?: string
} & MatProps) {
  return (
    <Mat
      color={color}
      opacity={opacity}
      selected={selected}
      roughness={0.12}
      metalness={0.35}
    />
  )
}

export function SoftBox({
  args,
  position,
  color,
  opacity = 1,
  selected = false,
}: {
  args: [number, number, number]
  position?: [number, number, number]
  color: string
} & MatProps) {
  const [w, h, d] = args
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={args} />
        <WoodMat color={color} opacity={opacity} selected={selected} />
      </mesh>
      <mesh position={[0, h / 2 + 0.004, 0]} castShadow>
        <boxGeometry args={[w * 0.96, 0.016, d * 0.96]} />
        <WoodMat color={color} opacity={opacity} selected={selected} />
      </mesh>
    </group>
  )
}

export function Knob({
  position,
  color = DUSTY_ROSE,
  radius = 0.028,
  opacity = 1,
  selected = false,
}: {
  position: [number, number, number]
  color?: string
  radius?: number
} & MatProps) {
  return (
    <mesh position={position} castShadow>
      <sphereGeometry args={[radius, 12, 10]} />
      <MetalMat
        color={color === DUSTY_ROSE ? GOLD : color}
        opacity={opacity}
        selected={selected}
      />
    </mesh>
  )
}

export function BarHandle({
  position,
  width = 0.12,
  color = '#8A7070',
  opacity = 1,
  selected = false,
}: {
  position: [number, number, number]
  width?: number
  color?: string
} & MatProps) {
  return (
    <mesh position={position} castShadow>
      <boxGeometry args={[width, 0.018, 0.018]} />
      <MetalMat color={color} opacity={opacity} selected={selected} />
    </mesh>
  )
}

export function Plinth({
  w,
  d,
  color,
  opacity = 1,
  selected = false,
}: {
  w: number
  d: number
  color: string
} & MatProps) {
  const h = 0.04
  return (
    <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
      <boxGeometry args={[w * 0.92, h, d * 0.92]} />
      <WoodMat color={color} opacity={opacity} selected={selected} />
    </mesh>
  )
}
