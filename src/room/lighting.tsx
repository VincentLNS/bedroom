import { Environment } from '@react-three/drei'
import { useRoomStore, type ShadowQuality } from '../store/roomStore'

export function SceneLights() {
  const quality = useRoomStore((s) => s.shadowQuality)
  const shadowsOn = quality !== 'off'
  const mapSize = quality === 'high' ? 1024 : 512

  return (
    <>
      {/* Softer ambient so materials (metal/glass/fabric) actually read */}
      <ambientLight intensity={0.42} color="#fff8f0" />
      <hemisphereLight args={['#e8f4ff', '#e8d8c8', 0.68]} />
      <directionalLight
        position={[4.2, 8.5, 3.2]}
        intensity={1.22}
        color="#fffef8"
        castShadow={shadowsOn}
        shadow-mapSize-width={mapSize}
        shadow-mapSize-height={mapSize}
        shadow-camera-far={28}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.0002}
      />
      <pointLight
        position={[0, 1.7, 2.0]}
        intensity={0.55}
        color="#ffe4a8"
        distance={8}
        decay={2}
      />
      {quality === 'high' && (
        <>
          <directionalLight
            position={[-6, 6, -4]}
            intensity={0.42}
            color="#dcecff"
          />
          <Environment preset="apartment" environmentIntensity={0.35} />
        </>
      )}
      {quality === 'low' && (
        <Environment preset="apartment" environmentIntensity={0.22} />
      )}
      {quality !== 'off' && (
        <pointLight
          position={[-0.5, 1.8, -1.9]}
          intensity={quality === 'high' ? 0.32 : 0.2}
          color="#f5f0ea"
          distance={5}
          decay={2}
        />
      )}
    </>
  )
}

export function nextShadowQuality(q: ShadowQuality): ShadowQuality {
  if (q === 'high') return 'low'
  if (q === 'low') return 'off'
  return 'high'
}

export function shadowQualityLabel(q: ShadowQuality): string {
  if (q === 'high') return 'Ombres ↑'
  if (q === 'low') return 'Ombres ↓'
  return 'Ombres off'
}
