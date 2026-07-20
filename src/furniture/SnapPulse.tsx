import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, type Mesh } from 'three'
import { cellToWorld } from '../placement'
import { useRoomStore } from '../store/roomStore'

/** Expanding ring on the floor when an item snaps into place. */
export function SnapPulse() {
  const pulse = useRoomStore((s) => s.snapPulse)
  const clearSnapPulse = useRoomStore((s) => s.clearSnapPulse)
  const meshRef = useRef<Mesh>(null)
  const startRef = useRef(0)

  useEffect(() => {
    if (!pulse) return
    startRef.current = performance.now()
  }, [pulse])

  useFrame(() => {
    const mesh = meshRef.current
    if (!mesh || !pulse) return
    const t = (performance.now() - startRef.current) / 450
    if (t >= 1) {
      clearSnapPulse()
      return
    }
    const scale = 0.35 + t * 1.4
    mesh.scale.set(scale, scale, scale)
    const mat = mesh.material as { opacity: number; color: Color }
    mat.opacity = 0.55 * (1 - t)
  })

  if (!pulse) return null

  const { x, z } = cellToWorld(pulse.cx, pulse.cz)

  return (
    <mesh
      ref={meshRef}
      position={[x, 0.02, z]}
      rotation={[-Math.PI / 2, 0, 0]}
      renderOrder={10}
    >
      <ringGeometry args={[0.12, 0.22, 32]} />
      <meshBasicMaterial
        color={pulse.ok ? '#7ec8b3' : '#ff8b7b'}
        transparent
        opacity={0.55}
        depthWrite={false}
      />
    </mesh>
  )
}
