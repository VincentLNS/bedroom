import { useMemo } from 'react'
import {
  CELL_SIZE,
  DOOR_CLEARANCE,
  GRID_COLS,
  GRID_ROWS,
  ROOM_DEPTH_M,
  ROOM_MIN_X,
  ROOM_MIN_Z,
  ROOM_WIDTH_M,
} from './constants'
import { cellToWorld } from '../placement/grid'

const GRID_COLOR = '#d4c4b4'
const CLEARANCE_COLOR = '#e8c4a8'

export function FloorGrid() {
  const linePositions = useMemo(() => {
    const pts: number[] = []
    for (let i = 0; i <= GRID_COLS; i++) {
      const x = ROOM_MIN_X + i * CELL_SIZE
      pts.push(x, 0.01, ROOM_MIN_Z, x, 0.01, ROOM_MIN_Z + ROOM_DEPTH_M)
    }
    for (let j = 0; j <= GRID_ROWS; j++) {
      const z = ROOM_MIN_Z + j * CELL_SIZE
      pts.push(ROOM_MIN_X, 0.01, z, ROOM_MIN_X + ROOM_WIDTH_M, 0.01, z)
    }
    return new Float32Array(pts)
  }, [])

  const clearanceMeshes = useMemo(
    () =>
      DOOR_CLEARANCE.map(({ cx, cz }) => {
        const { x, z } = cellToWorld(cx, cz)
        return { key: `${cx}-${cz}`, x, z }
      }),
    [],
  )

  return (
    <group>
      {clearanceMeshes.map(({ key, x, z }) => (
        <mesh
          key={key}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[x, 0.005, z]}
        >
          <planeGeometry args={[CELL_SIZE * 0.92, CELL_SIZE * 0.92]} />
          <meshStandardMaterial
            color={CLEARANCE_COLOR}
            transparent
            opacity={0.55}
            depthWrite={false}
          />
        </mesh>
      ))}

      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[linePositions, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color={GRID_COLOR} transparent opacity={0.7} />
      </lineSegments>
    </group>
  )
}
