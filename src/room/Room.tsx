import { DoubleSide } from 'three'
import {
  ROOM_DEPTH_M,
  ROOM_HEIGHT_M,
  ROOM_WIDTH_M,
} from './constants'

const FLOOR_COLOR = '#f3e6d8'
const WALL_PINK = '#f2d6e4'
const WALL_BLUE = '#e8f0f7'
const DOOR_WIDTH = 1
const DOOR_HEIGHT = 2.1
const WINDOW_WIDTH = 1.6
const WINDOW_HEIGHT = 1.1
const WALL_THICKNESS = 0.08

export function Room() {
  const halfW = ROOM_WIDTH_M / 2
  const halfD = ROOM_DEPTH_M / 2
  const doorSide = (ROOM_WIDTH_M - DOOR_WIDTH) / 2
  const windowSide = (ROOM_WIDTH_M - WINDOW_WIDTH) / 2
  const windowBottom = 0.9
  const windowTop = ROOM_HEIGHT_M - (windowBottom + WINDOW_HEIGHT)

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[ROOM_WIDTH_M, ROOM_DEPTH_M]} />
        <meshStandardMaterial color={FLOOR_COLOR} />
      </mesh>

      {/* −X wall (pink) */}
      <mesh position={[-halfW, ROOM_HEIGHT_M / 2, 0]}>
        <boxGeometry args={[WALL_THICKNESS, ROOM_HEIGHT_M, ROOM_DEPTH_M]} />
        <meshStandardMaterial color={WALL_PINK} />
      </mesh>

      {/* +X wall (blue) */}
      <mesh position={[halfW, ROOM_HEIGHT_M / 2, 0]}>
        <boxGeometry args={[WALL_THICKNESS, ROOM_HEIGHT_M, ROOM_DEPTH_M]} />
        <meshStandardMaterial color={WALL_BLUE} />
      </mesh>

      {/* −Z wall with door opening (pink) */}
      <group position={[0, 0, -halfD]}>
        {/* Left of door */}
        <mesh position={[-(DOOR_WIDTH / 2 + doorSide / 2), ROOM_HEIGHT_M / 2, 0]}>
          <boxGeometry args={[doorSide, ROOM_HEIGHT_M, WALL_THICKNESS]} />
          <meshStandardMaterial color={WALL_PINK} />
        </mesh>
        {/* Right of door */}
        <mesh position={[DOOR_WIDTH / 2 + doorSide / 2, ROOM_HEIGHT_M / 2, 0]}>
          <boxGeometry args={[doorSide, ROOM_HEIGHT_M, WALL_THICKNESS]} />
          <meshStandardMaterial color={WALL_PINK} />
        </mesh>
        {/* Lintel above door */}
        <mesh
          position={[
            0,
            DOOR_HEIGHT + (ROOM_HEIGHT_M - DOOR_HEIGHT) / 2,
            0,
          ]}
        >
          <boxGeometry
            args={[DOOR_WIDTH, ROOM_HEIGHT_M - DOOR_HEIGHT, WALL_THICKNESS]}
          />
          <meshStandardMaterial color={WALL_PINK} />
        </mesh>
        {/* Darker door inset / threshold marker */}
        <mesh position={[0, DOOR_HEIGHT / 2, WALL_THICKNESS * 0.6]}>
          <boxGeometry args={[DOOR_WIDTH * 0.92, DOOR_HEIGHT * 0.98, 0.02]} />
          <meshStandardMaterial color="#c4a090" />
        </mesh>
      </group>

      {/* +Z wall with window (blue) */}
      <group position={[0, 0, halfD]}>
        {/* Left of window */}
        <mesh position={[-(WINDOW_WIDTH / 2 + windowSide / 2), ROOM_HEIGHT_M / 2, 0]}>
          <boxGeometry args={[windowSide, ROOM_HEIGHT_M, WALL_THICKNESS]} />
          <meshStandardMaterial color={WALL_BLUE} />
        </mesh>
        {/* Right of window */}
        <mesh position={[WINDOW_WIDTH / 2 + windowSide / 2, ROOM_HEIGHT_M / 2, 0]}>
          <boxGeometry args={[windowSide, ROOM_HEIGHT_M, WALL_THICKNESS]} />
          <meshStandardMaterial color={WALL_BLUE} />
        </mesh>
        {/* Below window */}
        <mesh position={[0, windowBottom / 2, 0]}>
          <boxGeometry args={[WINDOW_WIDTH, windowBottom, WALL_THICKNESS]} />
          <meshStandardMaterial color={WALL_BLUE} />
        </mesh>
        {/* Above window */}
        <mesh position={[0, ROOM_HEIGHT_M - windowTop / 2, 0]}>
          <boxGeometry args={[WINDOW_WIDTH, windowTop, WALL_THICKNESS]} />
          <meshStandardMaterial color={WALL_BLUE} />
        </mesh>
        {/* Emissive window panel */}
        <mesh
          position={[0, windowBottom + WINDOW_HEIGHT / 2, -WALL_THICKNESS * 0.3]}
        >
          <planeGeometry args={[WINDOW_WIDTH * 0.92, WINDOW_HEIGHT * 0.9]} />
          <meshStandardMaterial
            color="#fff8e7"
            emissive="#ffe8b0"
            emissiveIntensity={0.85}
            side={DoubleSide}
          />
        </mesh>
      </group>

      {/* Very transparent ceiling so top-down orbit stays readable */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM_HEIGHT_M, 0]}>
        <planeGeometry args={[ROOM_WIDTH_M, ROOM_DEPTH_M]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.08}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}
