import { DoubleSide } from 'three'
import {
  ROOM_DEPTH_M,
  ROOM_HEIGHT_M,
  ROOM_WIDTH_M,
} from './constants'

const FLOOR_COLOR = '#e8d9c4'
const WALL_COLOR = '#f5f2ed'
const DOOR_WIDTH = 1
const DOOR_HEIGHT = 2.1
const WINDOW_WIDTH = 1.6
const WINDOW_HEIGHT = 1.1
const WALL_THICKNESS = 0.08
const CURTAIN_COLOR = '#c4878a'
const LANTERN_COLOR = '#f7f0e4'

export function Room() {
  const halfW = ROOM_WIDTH_M / 2
  const halfD = ROOM_DEPTH_M / 2
  const doorSide = (ROOM_WIDTH_M - DOOR_WIDTH) / 2
  const windowSide = (ROOM_WIDTH_M - WINDOW_WIDTH) / 2
  const windowBottom = 0.9
  const windowTop = ROOM_HEIGHT_M - (windowBottom + WINDOW_HEIGHT)
  const curtainW = 0.28
  const curtainH = WINDOW_HEIGHT + 0.35
  const curtainY = windowBottom + WINDOW_HEIGHT / 2 + 0.05
  const curtainZ = halfD - WALL_THICKNESS * 1.2
  const curtainX = WINDOW_WIDTH / 2 + curtainW * 0.35

  return (
    <group>
      {/* Floor — light wood */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[ROOM_WIDTH_M, ROOM_DEPTH_M]} />
        <meshStandardMaterial color={FLOOR_COLOR} />
      </mesh>

      {/* −X wall */}
      <mesh position={[-halfW, ROOM_HEIGHT_M / 2, 0]}>
        <boxGeometry args={[WALL_THICKNESS, ROOM_HEIGHT_M, ROOM_DEPTH_M]} />
        <meshStandardMaterial color={WALL_COLOR} />
      </mesh>

      {/* +X wall */}
      <mesh position={[halfW, ROOM_HEIGHT_M / 2, 0]}>
        <boxGeometry args={[WALL_THICKNESS, ROOM_HEIGHT_M, ROOM_DEPTH_M]} />
        <meshStandardMaterial color={WALL_COLOR} />
      </mesh>

      {/* −Z wall with door opening */}
      <group position={[0, 0, -halfD]}>
        <mesh position={[-(DOOR_WIDTH / 2 + doorSide / 2), ROOM_HEIGHT_M / 2, 0]}>
          <boxGeometry args={[doorSide, ROOM_HEIGHT_M, WALL_THICKNESS]} />
          <meshStandardMaterial color={WALL_COLOR} />
        </mesh>
        <mesh position={[DOOR_WIDTH / 2 + doorSide / 2, ROOM_HEIGHT_M / 2, 0]}>
          <boxGeometry args={[doorSide, ROOM_HEIGHT_M, WALL_THICKNESS]} />
          <meshStandardMaterial color={WALL_COLOR} />
        </mesh>
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
          <meshStandardMaterial color={WALL_COLOR} />
        </mesh>
        <mesh position={[0, DOOR_HEIGHT / 2, WALL_THICKNESS * 0.6]}>
          <boxGeometry args={[DOOR_WIDTH * 0.92, DOOR_HEIGHT * 0.98, 0.02]} />
          <meshStandardMaterial color="#c4a090" />
        </mesh>
      </group>

      {/* +Z wall with window */}
      <group position={[0, 0, halfD]}>
        <mesh position={[-(WINDOW_WIDTH / 2 + windowSide / 2), ROOM_HEIGHT_M / 2, 0]}>
          <boxGeometry args={[windowSide, ROOM_HEIGHT_M, WALL_THICKNESS]} />
          <meshStandardMaterial color={WALL_COLOR} />
        </mesh>
        <mesh position={[WINDOW_WIDTH / 2 + windowSide / 2, ROOM_HEIGHT_M / 2, 0]}>
          <boxGeometry args={[windowSide, ROOM_HEIGHT_M, WALL_THICKNESS]} />
          <meshStandardMaterial color={WALL_COLOR} />
        </mesh>
        <mesh position={[0, windowBottom / 2, 0]}>
          <boxGeometry args={[WINDOW_WIDTH, windowBottom, WALL_THICKNESS]} />
          <meshStandardMaterial color={WALL_COLOR} />
        </mesh>
        <mesh position={[0, ROOM_HEIGHT_M - windowTop / 2, 0]}>
          <boxGeometry args={[WINDOW_WIDTH, windowTop, WALL_THICKNESS]} />
          <meshStandardMaterial color={WALL_COLOR} />
        </mesh>
        {/* Dark window frame */}
        <mesh
          position={[0, windowBottom + WINDOW_HEIGHT / 2, -WALL_THICKNESS * 0.15]}
        >
          <boxGeometry
            args={[WINDOW_WIDTH * 0.98, WINDOW_HEIGHT * 0.98, 0.04]}
          />
          <meshStandardMaterial color="#3a322c" />
        </mesh>
        {/* Emissive window panel */}
        <mesh
          position={[0, windowBottom + WINDOW_HEIGHT / 2, -WALL_THICKNESS * 0.3]}
        >
          <planeGeometry args={[WINDOW_WIDTH * 0.86, WINDOW_HEIGHT * 0.84]} />
          <meshStandardMaterial
            color="#fff8e7"
            emissive="#ffe8b0"
            emissiveIntensity={0.85}
            side={DoubleSide}
          />
        </mesh>
      </group>

      {/* Dusty-rose curtains flanking the window (+Z) */}
      <mesh position={[-curtainX, curtainY, curtainZ]}>
        <boxGeometry args={[curtainW, curtainH, 0.06]} />
        <meshStandardMaterial color={CURTAIN_COLOR} roughness={0.9} />
      </mesh>
      <mesh position={[curtainX, curtainY, curtainZ]}>
        <boxGeometry args={[curtainW, curtainH, 0.06]} />
        <meshStandardMaterial color={CURTAIN_COLOR} roughness={0.9} />
      </mesh>
      {/* Curtain rod */}
      <mesh position={[0, curtainY + curtainH / 2 + 0.04, curtainZ]}>
        <boxGeometry args={[WINDOW_WIDTH + curtainW * 2.2, 0.03, 0.03]} />
        <meshStandardMaterial color="#8a7568" metalness={0.3} roughness={0.5} />
      </mesh>

      {/* Paper lantern — fixed ceiling prop */}
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
