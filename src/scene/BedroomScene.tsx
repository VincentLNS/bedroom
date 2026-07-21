import { Canvas } from '@react-three/fiber'
import { Room } from '../room/Room'
import { AtelierStage } from '../room/AtelierStage'
import { OutdoorScenery } from '../room/OutdoorScenery'
import { FloorGrid } from '../room/FloorGrid'
import { WallFadeDriver } from '../room/WallFade'
import { SceneLights } from '../room/lighting'
import { GhostPreview } from '../furniture/GhostPreview'
import { PlacedFurniture } from '../furniture/PlacedFurniture'
import { SnapPulse } from '../furniture/SnapPulse'
import { useRoomStore } from '../store/roomStore'
import { PlacementController } from './PlacementController'
import { SceneCameraControls } from './SceneCameraControls'
import { GlCaptureBridge } from './GlCaptureBridge'

type Props = {
  onReady?: () => void
}

export function BedroomScene({ onReady }: Props) {
  const showGrid = useRoomStore((s) => s.showGrid)
  const shadowQuality = useRoomStore((s) => s.shadowQuality)

  return (
    <Canvas
      shadows={shadowQuality !== 'off'}
      dpr={shadowQuality === 'off' ? [1, 1.25] : [1, 2]}
      camera={{ position: [3.6, 3.8, 5.2], fov: 40, near: 0.1, far: 80 }}
      gl={{ preserveDrawingBuffer: true }}
      onCreated={() => {
        // Let materials/HDR settle one frame before dismissing splash.
        requestAnimationFrame(() => onReady?.())
      }}
    >
      <color attach="background" args={['#c8e0f0']} />
      <fog attach="fog" args={['#c8e0f0', 24, 52]} />
      <SceneLights />
      <AtelierStage />
      <OutdoorScenery />
      <WallFadeDriver />
      <Room />
      {showGrid && <FloorGrid />}
      <PlacedFurniture />
      <GhostPreview />
      <SnapPulse />
      <PlacementController />
      <SceneCameraControls />
      <GlCaptureBridge />
    </Canvas>
  )
}
