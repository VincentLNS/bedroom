export function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.55} color="#fff5eb" />
      <directionalLight
        position={[3, 6, 2]}
        intensity={0.75}
        color="#fff8f0"
        castShadow={false}
      />
      {/* Soft fill from the window (+Z) */}
      <pointLight
        position={[0, 1.6, 2.0]}
        intensity={0.45}
        color="#ffe8b0"
        distance={7}
        decay={2}
      />
      {/* Gentle bounce near door (−Z) */}
      <pointLight
        position={[0, 1.8, -1.9]}
        intensity={0.2}
        color="#f2d6e4"
        distance={5}
        decay={2}
      />
    </>
  )
}
