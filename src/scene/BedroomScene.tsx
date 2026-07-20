import { Canvas } from '@react-three/fiber'
import { Room } from '../room/Room'
import { FloorGrid } from '../room/FloorGrid'
import { SceneLights } from '../room/lighting'
import { GhostPreview } from '../furniture/GhostPreview'
import { PlacedFurniture } from '../furniture/PlacedFurniture'
import { PlacementController } from './PlacementController'
import { SceneCameraControls } from './SceneCameraControls'

export function BedroomScene() {
  return (
    <Canvas camera={{ position: [4.5, 5.2, 6.5], fov: 42 }}>
      <color attach="background" args={['#f7efe8']} />
      <SceneLights />
      <Room />
      <FloorGrid />
      <PlacedFurniture />
      <GhostPreview />
      <PlacementController />
      <SceneCameraControls />
    </Canvas>
  )
}
