import { useMemo, useState } from 'react'
import type { ThreeEvent } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import type { HouseRoomId } from '../house/rooms'
import {
  ROOM_MIN_X,
  ROOM_MIN_Z,
  ROOM_WIDTH_M,
  ROOM_DEPTH_M,
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

function portalsFor(active: HouseRoomId): Portal[] {
  const cx = ROOM_MIN_X + ROOM_WIDTH_M / 2
  const zDoor = ROOM_MIN_Z + 0.08
  const zWin = ROOM_MIN_Z + ROOM_DEPTH_M - 0.08
  if (active === 'bedroom') {
    return [
      { to: 'hall', label: 'Couloir', x: cx - 0.6, z: zDoor, rotY: 0 },
      { to: 'salon', label: 'Salon', x: cx + 0.6, z: zWin, rotY: Math.PI },
    ]
  }
  if (active === 'hall') {
    return [
      { to: 'bedroom', label: 'Chambre', x: cx - 0.6, z: zDoor, rotY: 0 },
      { to: 'salon', label: 'Salon', x: cx + 0.6, z: zWin, rotY: Math.PI },
    ]
  }
  return [
    { to: 'hall', label: 'Couloir', x: cx - 0.6, z: zDoor, rotY: 0 },
    { to: 'bedroom', label: 'Chambre', x: cx + 0.6, z: zWin, rotY: Math.PI },
  ]
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

  // Phone: never float Html labels over the room (switcher is enough).
  const showLabel = !phone && (showDoorLabels || hover)

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
