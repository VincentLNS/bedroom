import { useFrame } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { Group } from 'three'
import { useRoomStore } from '../store/roomStore'
import { ROOM_DEPTH_M } from './constants'

const WINDOW_WIDTH = 1.6
const WINDOW_HEIGHT = 1.1
const WALL_THICKNESS = 0.08
const CURTAIN_COLOR = '#c4878a'
const CURTAIN_COLOR_DEEP = '#b07078'
const FOLDS = 5
/** Rest width of each panel mesh before scale.x is applied. */
const BASE_PANEL_W = 0.28

type CurtainsProps = {
  windowBottom?: number
}

/**
 * Interactive dusty-rose curtains on the +Z window wall.
 * Click (or TopBar) toggles open ↔ closed with a short lerp.
 */
export function Curtains({ windowBottom = 0.9 }: CurtainsProps) {
  const curtainsOpen = useRoomStore((s) => s.curtainsOpen)
  const toggleCurtains = useRoomStore((s) => s.toggleCurtains)
  const openAmount = useRef(curtainsOpen ? 1 : 0)
  const leftRef = useRef<Group>(null)
  const rightRef = useRef<Group>(null)

  const halfD = ROOM_DEPTH_M / 2
  const curtainH = WINDOW_HEIGHT + 0.35
  const curtainY = windowBottom + WINDOW_HEIGHT / 2 + 0.05
  const curtainZ = halfD - WALL_THICKNESS * 1.2
  const rodY = curtainY + curtainH / 2 + 0.04
  const rodLen = WINDOW_WIDTH + 0.7

  const foldOffsets = useMemo(
    () => Array.from({ length: FOLDS }, (_, i) => (i + 0.5) / FOLDS),
    [],
  )

  useFrame((_, dt) => {
    const target = curtainsOpen ? 1 : 0
    openAmount.current += (target - openAmount.current) * Math.min(1, dt * 7)
    const t = openAmount.current

    // Open: gathered at sides · Closed: panels meet at center
    const panelW = 0.22 + (1 - t) * (WINDOW_WIDTH * 0.48)
    const edgeGap = 0.06 + t * 0.12
    const leftX = -(WINDOW_WIDTH / 2 + edgeGap) + panelW / 2
    const rightX = WINDOW_WIDTH / 2 + edgeGap - panelW / 2
    const sx = panelW / BASE_PANEL_W

    if (leftRef.current) {
      leftRef.current.position.x = leftX
      leftRef.current.scale.x = sx
    }
    if (rightRef.current) {
      rightRef.current.position.x = rightX
      rightRef.current.scale.x = sx
    }
  })

  const onCurtainPointer = (e: ThreeEvent<PointerEvent>) => {
    if (e.button !== 0) return
    e.stopPropagation()
    toggleCurtains()
  }

  const setPointer = (hover: boolean) => {
    document.body.style.cursor = hover ? 'pointer' : 'auto'
  }

  const panel = (side: 'left' | 'right') => (
    <group
      ref={side === 'left' ? leftRef : rightRef}
      position={[side === 'left' ? -0.9 : 0.9, curtainY, curtainZ]}
      onPointerDown={onCurtainPointer}
      onPointerOver={(e) => {
        e.stopPropagation()
        setPointer(true)
      }}
      onPointerOut={() => setPointer(false)}
    >
      <mesh>
        <boxGeometry args={[BASE_PANEL_W, curtainH, 0.08]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {foldOffsets.map((u, i) => {
        const x = (u - 0.5) * (BASE_PANEL_W - 0.02)
        const bulge = i % 2 === 0 ? 0.02 : -0.01
        return (
          <mesh key={i} position={[x, 0, bulge]} castShadow>
            <boxGeometry args={[0.055, curtainH * 0.98, 0.05]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? CURTAIN_COLOR : CURTAIN_COLOR_DEEP}
              roughness={0.92}
            />
          </mesh>
        )
      })}
      <mesh position={[0, curtainH / 2 - 0.04, 0.01]}>
        <boxGeometry args={[BASE_PANEL_W, 0.06, 0.06]} />
        <meshStandardMaterial color={CURTAIN_COLOR_DEEP} roughness={0.9} />
      </mesh>
    </group>
  )

  return (
    <group>
      {panel('left')}
      {panel('right')}

      <mesh
        position={[0, rodY, curtainZ]}
        onPointerDown={onCurtainPointer}
        onPointerOver={(e) => {
          e.stopPropagation()
          setPointer(true)
        }}
        onPointerOut={() => setPointer(false)}
      >
        <boxGeometry args={[rodLen, 0.03, 0.03]} />
        <meshStandardMaterial color="#8a7568" metalness={0.3} roughness={0.5} />
      </mesh>
      <mesh position={[-rodLen / 2, rodY, curtainZ]}>
        <sphereGeometry args={[0.035, 10, 8]} />
        <meshStandardMaterial
          color="#8a7568"
          metalness={0.35}
          roughness={0.45}
        />
      </mesh>
      <mesh position={[rodLen / 2, rodY, curtainZ]}>
        <sphereGeometry args={[0.035, 10, 8]} />
        <meshStandardMaterial
          color="#8a7568"
          metalness={0.35}
          roughness={0.45}
        />
      </mesh>
    </group>
  )
}
