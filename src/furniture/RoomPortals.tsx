import { useMemo, useState } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { roomLabel, type HouseRoomId } from '../house/rooms'
import {
  ROOM_DEPTH_M,
  ROOM_MIN_X,
  ROOM_MIN_Z,
  ROOM_WIDTH_M,
} from '../room/constants'
import { useRoomStore } from '../store/roomStore'
import { usePhoneLayout } from '../ui/usePhoneLayout'

const DOOR_H = 1.35
const DOOR_W = 0.72

type Portal = {
  to: HouseRoomId
  label: string
  x: number
  z: number
  rotY: number
}

/**
 * Door graph (≤3 exits; hall has a side door to cuisine):
 *   bedroom ←→ hall ←→ salon
 *                ↕
 *             cuisine ←→ bathroom
 */
function portalsFor(active: HouseRoomId): Portal[] {
  const cx = ROOM_MIN_X + ROOM_WIDTH_M / 2
  const zDoor = ROOM_MIN_Z + 0.08
  const zWin = ROOM_MIN_Z + ROOM_DEPTH_M - 0.08
  const xSide = ROOM_MIN_X + 0.08
  const zSide = ROOM_MIN_Z + ROOM_DEPTH_M / 2

  switch (active) {
    case 'bedroom':
      return [
        { to: 'hall', label: roomLabel('hall'), x: cx - 0.6, z: zDoor, rotY: 0 },
        {
          to: 'salon',
          label: roomLabel('salon'),
          x: cx + 0.6,
          z: zWin,
          rotY: Math.PI,
        },
      ]
    case 'hall':
      return [
        {
          to: 'bedroom',
          label: roomLabel('bedroom'),
          x: cx - 0.6,
          z: zDoor,
          rotY: 0,
        },
        {
          to: 'salon',
          label: roomLabel('salon'),
          x: cx + 0.6,
          z: zWin,
          rotY: Math.PI,
        },
        {
          to: 'cuisine',
          label: roomLabel('cuisine'),
          x: xSide,
          z: zSide,
          rotY: Math.PI / 2,
        },
      ]
    case 'salon':
      return [
        { to: 'hall', label: roomLabel('hall'), x: cx - 0.6, z: zDoor, rotY: 0 },
        {
          to: 'bedroom',
          label: roomLabel('bedroom'),
          x: cx + 0.6,
          z: zWin,
          rotY: Math.PI,
        },
      ]
    case 'cuisine':
      return [
        { to: 'hall', label: roomLabel('hall'), x: cx - 0.6, z: zDoor, rotY: 0 },
        {
          to: 'bathroom',
          label: roomLabel('bathroom'),
          x: cx + 0.6,
          z: zWin,
          rotY: Math.PI,
        },
      ]
    case 'bathroom':
      return [
        {
          to: 'cuisine',
          label: roomLabel('cuisine'),
          x: cx - 0.6,
          z: zDoor,
          rotY: 0,
        },
      ]
  }
}

function DoorPortal({ portal }: { portal: Portal }) {
  const setActiveRoom = useRoomStore((s) => s.setActiveRoom)
  const mode = useRoomStore((s) => s.mode)
  const showDoorLabels = useRoomStore((s) => s.showDoorLabels)
  const phone = usePhoneLayout()
  const [hover, setHover] = useState(false)

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (mode === 'place') return
    e.stopPropagation()
    setActiveRoom(portal.to)
  }

  // Sur téléphone : uniquement si « Noms portes » est activé (pas au survol).
  const showLabel = showDoorLabels || (!phone && hover)

  return (
    <group
      position={[portal.x, 0, portal.z]}
      rotation={[0, portal.rotY, 0]}
      onClick={onClick}
      onPointerOver={(e) => {
        if (phone) return
        e.stopPropagation()
        setHover(true)
      }}
      onPointerOut={() => setHover(false)}
    >
      <mesh position={[0, DOOR_H / 2, 0]} castShadow>
        <boxGeometry args={[DOOR_W, DOOR_H, 0.06]} />
        <meshStandardMaterial color="#E8C4A8" roughness={0.55} />
      </mesh>
      <mesh position={[DOOR_W * 0.28, DOOR_H * 0.48, 0.04]}>
        <sphereGeometry args={[0.035, 10, 8]} />
        <meshStandardMaterial
          color="#D4A017"
          metalness={0.6}
          roughness={0.35}
        />
      </mesh>
      {showLabel && (
        <Html position={[0, DOOR_H + 0.22, 0.05]} center distanceFactor={6}>
          <span className="door-label">{portal.label}</span>
        </Html>
      )}
      <mesh position={[0, DOOR_H / 2, 0.05]} visible={false} onClick={onClick}>
        <boxGeometry args={[DOOR_W + 0.25, DOOR_H + 0.3, 0.35]} />
      </mesh>
    </group>
  )
}

/** Clickable doors between house wings. */
export function RoomPortals() {
  const activeRoom = useRoomStore((s) => s.activeRoom)
  const portals = useMemo(() => portalsFor(activeRoom), [activeRoom])

  return (
    <group>
      {portals.map((p) => (
        <DoorPortal key={`${activeRoom}-${p.to}`} portal={p} />
      ))}
    </group>
  )
}
