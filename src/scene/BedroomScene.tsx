import { Canvas } from '@react-three/fiber'
import { Room } from '../room/Room'
import { AtelierStage } from '../room/AtelierStage'
import { OutdoorScenery } from '../room/OutdoorScenery'
import { FloorGrid } from '../room/FloorGrid'
import { WallFadeDriver } from '../room/WallFade'
import { SceneLights } from '../room/lighting'
import { GhostPreview } from '../furniture/GhostPreview'
import { PlacedFurniture } from '../furniture/PlacedFurniture'
import { RoomPortals } from '../furniture/RoomPortals'
import { SnapPulse } from '../furniture/SnapPulse'
import { resolveShadowQuality } from '../perf/quality'
import { useRoomStore } from '../store/roomStore'
import { PlacementController } from './PlacementController'
import { SceneCameraControls } from './SceneCameraControls'
import { SceneCursor } from './SceneCursor'
import { GlCaptureBridge } from './GlCaptureBridge'

type Props = {
  onReady?: () => void
}

export function BedroomScene({ onReady }: Props) {
  const showGrid = useRoomStore((s) => s.showGrid)
  const shadowQuality = useRoomStore((s) => s.shadowQuality)
  const resolved = resolveShadowQuality(shadowQuality)

  return (
    <Canvas
      shadows={resolved !== 'off'}
      dpr={
        resolved === 'off'
          ? [1, 1]
          : resolved === 'low'
            ? [1, 1.5]
            : [1, 2]
      }
      camera={{ position: [3.6, 3.8, 5.2], fov: 40, near: 0.1, far: 80 }}
      gl={{
        preserveDrawingBuffer: true,
        powerPreference: resolved === 'high' ? 'high-performance' : 'default',
        antialias: resolved === 'high',
      }}
      onCreated={() => {
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
      <RoomPortals />
      <GhostPreview />
      <SnapPulse />
      <PlacementController />
      <SceneCameraControls />
      <SceneCursor />
      <GlCaptureBridge />
    </Canvas>
  )
}
