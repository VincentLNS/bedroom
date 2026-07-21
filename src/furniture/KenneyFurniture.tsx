import { useLayoutEffect, useMemo } from 'react'
import { useLoader } from '@react-three/fiber'
import {
  Box3,
  Color,
  Mesh,
  MeshPhongMaterial,
  MeshStandardMaterial,
  Vector3,
  type Group,
  type Material,
  type Object3D,
} from 'three'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { CELL_SIZE } from '../room/constants'

const SELECT_EMISSIVE = new Color('#fff4dc')

type MatRole = 'metal' | 'wood' | 'fabric' | 'glass' | 'lamp' | 'plant' | 'plastic'

function classifyMat(name: string): MatRole {
  const n = name.toLowerCase()
  if (n.includes('glass') || n.includes('mirror')) return 'glass'
  if (n.includes('lamp') || n.includes('light') || n.includes('bulb')) return 'lamp'
  if (n.includes('plant') || n.includes('leaf') || n.includes('foliage')) return 'plant'
  if (n.includes('metal') || n.includes('chrome') || n.includes('steel')) return 'metal'
  if (
    n.includes('carpet') ||
    n.includes('fabric') ||
    n.includes('cloth') ||
    n.includes('fur') ||
    n.includes('cushion') ||
    n.includes('pillow') ||
    n.includes('rug')
  )
    return 'fabric'
  if (n.includes('wood') || n.includes('oak') || n.includes('plank')) return 'wood'
  return 'plastic'
}

/** Soft goods get tint; wood/metal/glass keep more of Kenney’s own palette. */
function tintStrength(role: MatRole): number {
  switch (role) {
    case 'fabric':
      return 0.72
    case 'plastic':
      return 0.48
    case 'wood':
      return 0.28
    case 'plant':
      return 0.2
    case 'lamp':
      return 0.15
    case 'metal':
    case 'glass':
      return 0.08
  }
}

/**
 * Kenney Furniture Kit (CC0) — OBJ + MTL with vivid PBR materials,
 * selective tinting, and footprint fit.
 */
export function KenneyFurniture({
  model,
  footprint,
  tint,
  surfaceHeight,
  opacity = 1,
  selected = false,
  castShadow = true,
}: {
  model: string
  footprint: [number, number]
  tint?: string
  surfaceHeight?: number
  opacity?: number
  selected?: boolean
  castShadow?: boolean
}) {
  const base = `/models/kenney/${model}`

  // Pass absolute URLs only — do NOT setPath() (Three would prepend and double the path).
  const materials = useLoader(MTLLoader, `${base}.mtl`)
  materials.preload()

  const object = useLoader(OBJLoader, `${base}.obj`, (loader) => {
    loader.setMaterials(materials)
  })

  const root = useMemo(() => {
    const clone = object.clone(true) as Group
    clone.traverse((child) => {
      if (!(child instanceof Mesh)) return
      child.material = toStandardMaterials(child.material, tint)
    })
    fitToFootprint(clone, footprint, surfaceHeight)
    return clone
  }, [object, footprint, surfaceHeight, tint])

  useLayoutEffect(() => {
    root.traverse((child) => {
      if (!(child instanceof Mesh)) return
      child.castShadow = castShadow
      child.receiveShadow = castShadow
      const mats = Array.isArray(child.material)
        ? child.material
        : [child.material]
      for (const mat of mats) {
        if (!(mat instanceof MeshStandardMaterial)) continue
        mat.transparent = opacity < 1
        mat.opacity = opacity
        mat.depthWrite = true
        const role = classifyMat(mat.name || '')
        const baseEmissive =
          role === 'lamp' && opacity >= 1
            ? new Color(mat.color).multiplyScalar(0.35)
            : new Color(0x000000)
        if (selected) {
          mat.emissive.copy(SELECT_EMISSIVE)
          mat.emissiveIntensity = 0.4
        } else {
          mat.emissive.copy(baseEmissive)
          mat.emissiveIntensity = role === 'lamp' ? 0.55 : 0
        }
        mat.needsUpdate = true
      }
    })
  }, [root, opacity, selected, castShadow])

  return <primitive object={root} />
}

function toStandardMaterials(
  material: Material | Material[],
  tint?: string,
): MeshStandardMaterial | MeshStandardMaterial[] {
  if (Array.isArray(material)) {
    return material.map((m) => toStandardMaterial(m, tint))
  }
  return toStandardMaterial(material, tint)
}

function toStandardMaterial(
  material: Material,
  tint?: string,
): MeshStandardMaterial {
  const color = new Color('#d4b896')
  let metalness = 0.06
  let roughness = 0.7
  let role: MatRole = 'plastic'

  if (
    material instanceof MeshStandardMaterial ||
    material instanceof MeshPhongMaterial
  ) {
    color.copy(material.color)
    role = classifyMat(material.name || '')
    switch (role) {
      case 'metal':
        metalness = 0.78
        roughness = 0.28
        break
      case 'wood':
        metalness = 0.02
        roughness = 0.82
        break
      case 'fabric':
        metalness = 0
        roughness = 0.94
        break
      case 'glass':
        metalness = 0.4
        roughness = 0.1
        break
      case 'lamp':
        metalness = 0.05
        roughness = 0.45
        break
      case 'plant':
        metalness = 0.02
        roughness = 0.75
        break
      default:
        metalness = 0.06
        roughness = 0.68
    }
  }

  // Punch up dull greys so furniture never looks colourless
  const hsl = { h: 0, s: 0, l: 0 }
  color.getHSL(hsl)
  if (hsl.s < 0.08 && hsl.l > 0.2 && hsl.l < 0.92) {
    if (role === 'metal') color.setHSL(0.58, 0.08, hsl.l)
    else if (role === 'plant') color.setHSL(0.32, 0.45, Math.min(0.55, hsl.l))
    else color.setHSL(0.08, 0.38, hsl.l)
  } else if (hsl.s > 0.05) {
    const boost = role === 'fabric' || role === 'plant' ? 1.35 : 1.22
    color.setHSL(hsl.h, Math.min(1, hsl.s * boost), hsl.l)
  }

  if (tint) {
    color.lerp(new Color(tint), tintStrength(role))
  }

  return new MeshStandardMaterial({
    color,
    roughness,
    metalness,
    name: material.name,
  })
}

function fitToFootprint(
  object: Object3D,
  footprint: [number, number],
  surfaceHeight?: number,
) {
  object.position.set(0, 0, 0)
  object.scale.set(1, 1, 1)
  object.updateMatrixWorld(true)

  const box = new Box3().setFromObject(object)
  const size = box.getSize(new Vector3())
  if (size.x < 1e-6 || size.z < 1e-6) return

  const targetW = footprint[0] * CELL_SIZE * 0.92
  const targetD = footprint[1] * CELL_SIZE * 0.92
  const scaleXY = Math.min(targetW / size.x, targetD / size.z)
  const MAX_FURNITURE_H = 1.55
  const scaleH = size.y > 1e-6 ? MAX_FURNITURE_H / size.y : scaleXY
  const scale = Math.min(scaleXY, scaleH)
  object.scale.setScalar(scale)
  object.updateMatrixWorld(true)

  let fitted = new Box3().setFromObject(object)
  const h = fitted.max.y - fitted.min.y

  if (
    surfaceHeight != null &&
    surfaceHeight > 0.05 &&
    h > 1e-6 &&
    surfaceHeight >= h * 0.85
  ) {
    object.scale.y *= surfaceHeight / h
    object.updateMatrixWorld(true)
    fitted = new Box3().setFromObject(object)
  }

  const center = fitted.getCenter(new Vector3())
  object.position.x -= center.x
  object.position.z -= center.z
  object.position.y -= fitted.min.y
}
