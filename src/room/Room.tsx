import { useLayoutEffect, useRef } from 'react'
import {
  DoubleSide,
  type Group,
  type Mesh,
  type MeshStandardMaterial,
} from 'three'
import { useFrame } from '@react-three/fiber'
import { Curtains } from './Curtains'
import { useRoomStore } from '../store/roomStore'
import { wallFade, type WallSide } from './WallFade'
import {
  DOOR_CENTER_X,
  DOOR_WIDTH_M,
  ROOM_DEPTH_M,
  ROOM_HEIGHT_M,
  ROOM_WIDTH_M,
} from './constants'

const FLOOR_COLOR = '#f0e0d8'
const WALL_COLOR = '#FFF8FA'
const DOOR_WIDTH = DOOR_WIDTH_M
const DOOR_HEIGHT = 2.1
const WINDOW_WIDTH = 1.6
const WINDOW_HEIGHT = 1.1
const WALL_THICKNESS = 0.08
const LANTERN_COLOR = '#f7f0e4'
/** Sims-style half-wall height for cutaway dollhouse view. */
const CUT_WALL_H = 1.15

function RoomOutline() {
  const halfW = ROOM_WIDTH_M / 2
  const halfD = ROOM_DEPTH_M / 2
  const t = 0.04
  const h = 0.06
  return (
    <group>
      <mesh position={[0, h / 2, -halfD]}>
        <boxGeometry args={[ROOM_WIDTH_M + t, h, t]} />
        <meshStandardMaterial color="#d4c4b0" roughness={0.9} />
      </mesh>
      <mesh position={[0, h / 2, halfD]}>
        <boxGeometry args={[ROOM_WIDTH_M + t, h, t]} />
        <meshStandardMaterial color="#d4c4b0" roughness={0.9} />
      </mesh>
      <mesh position={[-halfW, h / 2, 0]}>
        <boxGeometry args={[t, h, ROOM_DEPTH_M]} />
        <meshStandardMaterial color="#d4c4b0" roughness={0.9} />
      </mesh>
      <mesh position={[halfW, h / 2, 0]}>
        <boxGeometry args={[t, h, ROOM_DEPTH_M]} />
        <meshStandardMaterial color="#d4c4b0" roughness={0.9} />
      </mesh>
    </group>
  )
}

/** Wall mesh that fades / hides when the camera faces it (Sims pattern). */
function FadeWall({
  side,
  position,
  args,
  color = WALL_COLOR,
}: {
  side: WallSide
  position: [number, number, number]
  args: [number, number, number]
  color?: string
}) {
  const meshRef = useRef<Mesh>(null)
  const matRef = useRef<MeshStandardMaterial>(null)
  const last = useRef(1)

  useFrame(() => {
    const mesh = meshRef.current
    const mat = matRef.current
    if (!mesh || !mat) return
    const opacity = wallFade[side]
    if (opacity === last.current) return
    last.current = opacity
    mat.opacity = Math.max(opacity, 0.001)
    mat.transparent = opacity < 0.99
    mat.depthWrite = opacity >= 0.99
    mesh.visible = opacity > 0.12
  })

  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    // When nearly invisible, skip raycasts so placement hits the floor
    const original = mesh.raycast.bind(mesh)
    mesh.raycast = (raycaster, intersects) => {
      if (wallFade[side] <= 0.12) return
      original(raycaster, intersects)
    }
  }, [side])

  return (
    <mesh ref={meshRef} position={position} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial
        ref={matRef}
        color={color}
        roughness={0.92}
        metalness={0}
      />
    </mesh>
  )
}

function WindowGlass({
  windowBottom,
  wallThickness,
  maxHeight,
  side,
}: {
  windowBottom: number
  wallThickness: number
  maxHeight: number
  side: WallSide
}) {
  const groupRef = useRef<Group>(null)
  const frameT = 0.05
  const frameD = 0.06
  const innerW = WINDOW_WIDTH * 0.9
  const innerH = Math.min(
    WINDOW_HEIGHT * 0.88,
    Math.max(0.1, maxHeight - windowBottom - 0.05),
  )
  const tooHigh = windowBottom + WINDOW_HEIGHT / 2 - WINDOW_HEIGHT / 2 > maxHeight

  useFrame(() => {
    const g = groupRef.current
    if (!g) return
    g.visible = !tooHigh && wallFade[side] > 0.12
  })

  if (tooHigh) return null

  const frameZ = -wallThickness * 0.2

  return (
    <group ref={groupRef} position={[0, windowBottom + innerH / 2 + 0.02, frameZ]}>
      <mesh position={[0, innerH / 2 + frameT / 2, 0]}>
        <boxGeometry args={[innerW + frameT * 2, frameT, frameD]} />
        <meshStandardMaterial color="#3a322c" roughness={0.7} />
      </mesh>
      <mesh position={[0, -(innerH / 2 + frameT / 2), 0]}>
        <boxGeometry args={[innerW + frameT * 2, frameT, frameD]} />
        <meshStandardMaterial color="#3a322c" roughness={0.7} />
      </mesh>
      <mesh position={[-(innerW / 2 + frameT / 2), 0, 0]}>
        <boxGeometry args={[frameT, innerH, frameD]} />
        <meshStandardMaterial color="#3a322c" roughness={0.7} />
      </mesh>
      <mesh position={[innerW / 2 + frameT / 2, 0, 0]}>
        <boxGeometry args={[frameT, innerH, frameD]} />
        <meshStandardMaterial color="#3a322c" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[innerW * 0.98, innerH * 0.98]} />
        <meshStandardMaterial
          color="#c8e4f4"
          transparent
          opacity={0.22}
          roughness={0.12}
          metalness={0.05}
          depthWrite={false}
          side={DoubleSide}
        />
      </mesh>
    </group>
  )
}

export function Room() {
  const wallMode = useRoomStore((s) => s.wallMode)
  const viewMode = useRoomStore((s) => s.viewMode)
  const halfW = ROOM_WIDTH_M / 2
  const halfD = ROOM_DEPTH_M / 2
  const doorLeft = DOOR_CENTER_X - DOOR_WIDTH / 2
  const doorRight = DOOR_CENTER_X + DOOR_WIDTH / 2
  const leftDoorWallW = halfW + doorLeft
  const rightDoorWallW = halfW - doorRight
  const leftDoorWallX = -halfW + leftDoorWallW / 2
  const rightDoorWallX = halfW - rightDoorWallW / 2
  const windowSide = (ROOM_WIDTH_M - WINDOW_WIDTH) / 2
  const windowBottom = 0.9

  const wallH =
    wallMode === 'full' ? ROOM_HEIGHT_M : wallMode === 'cut' ? CUT_WALL_H : 0
  const showWalls = wallMode !== 'hidden'
  const showCurtains = wallMode === 'full'
  const showLantern = wallMode !== 'hidden' && viewMode !== 'plan'
  const showWindow =
    wallMode === 'full' || (wallMode === 'cut' && CUT_WALL_H > windowBottom + 0.15)

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[ROOM_WIDTH_M, ROOM_DEPTH_M]} />
        <meshStandardMaterial color={FLOOR_COLOR} />
      </mesh>

      {wallMode !== 'full' && <RoomOutline />}

      {showWalls && (
        <>
          <FadeWall
            side="negX"
            position={[-halfW, wallH / 2, 0]}
            args={[WALL_THICKNESS, wallH, ROOM_DEPTH_M]}
          />
          <FadeWall
            side="posX"
            position={[halfW, wallH / 2, 0]}
            args={[WALL_THICKNESS, wallH, ROOM_DEPTH_M]}
          />

          {/* −Z door wall */}
          <group position={[0, 0, -halfD]}>
            <FadeWall
              side="negZ"
              position={[leftDoorWallX, wallH / 2, 0]}
              args={[leftDoorWallW, wallH, WALL_THICKNESS]}
            />
            <FadeWall
              side="negZ"
              position={[rightDoorWallX, wallH / 2, 0]}
              args={[rightDoorWallW, wallH, WALL_THICKNESS]}
            />
            {wallMode === 'full' && (
              <FadeWall
                side="negZ"
                position={[
                  DOOR_CENTER_X,
                  DOOR_HEIGHT + (ROOM_HEIGHT_M - DOOR_HEIGHT) / 2,
                  0,
                ]}
                args={[DOOR_WIDTH, ROOM_HEIGHT_M - DOOR_HEIGHT, WALL_THICKNESS]}
              />
            )}
            <FadeWall
              side="negZ"
              position={[
                DOOR_CENTER_X,
                Math.min(DOOR_HEIGHT, wallH) / 2,
                WALL_THICKNESS * 0.6,
              ]}
              args={[
                DOOR_WIDTH * 0.92,
                Math.min(DOOR_HEIGHT, wallH) * 0.98,
                0.02,
              ]}
              color="#c4a090"
            />
          </group>

          {/* +Z window wall */}
          <group position={[0, 0, halfD]}>
            <FadeWall
              side="posZ"
              position={[-(WINDOW_WIDTH / 2 + windowSide / 2), wallH / 2, 0]}
              args={[windowSide, wallH, WALL_THICKNESS]}
            />
            <FadeWall
              side="posZ"
              position={[WINDOW_WIDTH / 2 + windowSide / 2, wallH / 2, 0]}
              args={[windowSide, wallH, WALL_THICKNESS]}
            />
            <FadeWall
              side="posZ"
              position={[0, Math.min(windowBottom, wallH) / 2, 0]}
              args={[
                WINDOW_WIDTH,
                Math.min(windowBottom, wallH),
                WALL_THICKNESS,
              ]}
            />
            {wallMode === 'full' && (
              <FadeWall
                side="posZ"
                position={[
                  0,
                  ROOM_HEIGHT_M -
                    (ROOM_HEIGHT_M - (windowBottom + WINDOW_HEIGHT)) / 2,
                  0,
                ]}
                args={[
                  WINDOW_WIDTH,
                  ROOM_HEIGHT_M - (windowBottom + WINDOW_HEIGHT),
                  WALL_THICKNESS,
                ]}
              />
            )}
            {showWindow && (
              <WindowGlass
                windowBottom={windowBottom}
                wallThickness={WALL_THICKNESS}
                maxHeight={wallH}
                side="posZ"
              />
            )}
          </group>
        </>
      )}

      {showCurtains && <Curtains windowBottom={windowBottom} />}

      {showLantern && (
        <group position={[0, ROOM_HEIGHT_M - 0.45, 0]}>
          <mesh>
            <sphereGeometry args={[0.28, 20, 16]} />
            <meshStandardMaterial
              color={LANTERN_COLOR}
              emissive="#ffe8c8"
              emissiveIntensity={0.35}
              roughness={0.85}
            />
          </mesh>
          <mesh position={[0, 0.32, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 0.2, 8]} />
            <meshStandardMaterial color="#d8c8b0" />
          </mesh>
          <pointLight
            intensity={0.35}
            color="#ffe8c0"
            distance={5}
            decay={2}
          />
        </group>
      )}
    </group>
  )
}
