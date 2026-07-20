import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { registerSceneGl } from './capture'

/** Keeps a module-level WebGL ref for photo capture outside the Canvas tree. */
export function GlCaptureBridge() {
  const gl = useThree((s) => s.gl)
  useEffect(() => {
    registerSceneGl(gl)
    return () => registerSceneGl(null)
  }, [gl])
  return null
}
