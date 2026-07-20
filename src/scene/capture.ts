import type { WebGLRenderer } from 'three'

let glRef: WebGLRenderer | null = null

export function registerSceneGl(gl: WebGLRenderer | null) {
  glRef = gl
}

export function captureScenePng(): string | null {
  if (!glRef) return null
  try {
    return glRef.domElement.toDataURL('image/png')
  } catch {
    return null
  }
}
