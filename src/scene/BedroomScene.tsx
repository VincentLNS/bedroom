import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Room } from '../room/Room'
import { FloorGrid } from '../room/FloorGrid'
import { SceneLights } from '../room/lighting'
import { GhostPreview } from '../furniture/GhostPreview'
import { PlacedFurniture } from '../furniture/PlacedFurniture'
import { PlacementController } from './PlacementController'
import { useRoomStore } from '../store/roomStore'

export function BedroomScene() {
  const placing = useRoomStore((s) => s.mode === 'place')

  return (
    <Canvas camera={{ position: [4, 5, 6], fov: 45 }}>
      <color attach="background" args={['#f7efe8']} />
      <SceneLights />
      <Room />
      <FloorGrid />
      <PlacedFurniture />
      <GhostPreview />
      <PlacementController />
      <OrbitControls
        makeDefault
        target={[0, 0.8, 0]}
        maxPolarAngle={Math.PI / 2.05}
        enableRotate={!placing}
        enablePan={!placing}
      />
    </Canvas>
  )
}
