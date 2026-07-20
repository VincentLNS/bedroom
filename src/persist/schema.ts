import type { PlacedItem, Rotation } from '../store/roomStore'

export type BedroomFileItemV1 = {
  instanceId: string
  catalogId: string
  x: number
  z: number
  rot: Rotation
  /** Optional host instance for surface stacking. */
  parentId?: string
}

export type BedroomFileV1 = {
  version: 1
  roomId: 'girl-bedroom-v1'
  items: BedroomFileItemV1[]
}

const VALID_ROTS = new Set<number>([0, 90, 180, 270])

export function serializeLayout(items: PlacedItem[]): BedroomFileV1 {
  return {
    version: 1,
    roomId: 'girl-bedroom-v1',
    items: items.map(({ instanceId, catalogId, cx, cz, rot, parentId }) => ({
      instanceId,
      catalogId,
      x: cx,
      z: cz,
      rot,
      ...(parentId ? { parentId } : {}),
    })),
  }
}

function isBedroomFileItemV1(value: unknown): value is BedroomFileItemV1 {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  const base =
    typeof item.instanceId === 'string' &&
    typeof item.catalogId === 'string' &&
    typeof item.x === 'number' &&
    typeof item.z === 'number' &&
    VALID_ROTS.has(item.rot as number)
  if (!base) return false
  if (item.parentId !== undefined && typeof item.parentId !== 'string') {
    return false
  }
  return true
}

export function parseLayout(
  data: unknown,
): { ok: true; file: BedroomFileV1 } | { ok: false; error: string } {
  if (!data || typeof data !== 'object') {
    return { ok: false, error: 'Objet de plan de chambre attendu' }
  }

  const record = data as Record<string, unknown>

  if (record.version !== 1) {
    return { ok: false, error: 'Version de fichier non prise en charge' }
  }

  if (record.roomId !== 'girl-bedroom-v1') {
    return { ok: false, error: 'Identifiant de chambre non pris en charge' }
  }

  if (!Array.isArray(record.items)) {
    return { ok: false, error: 'Liste de meubles invalide' }
  }

  if (!record.items.every(isBedroomFileItemV1)) {
    return { ok: false, error: 'Meuble invalide dans le plan' }
  }

  return {
    ok: true,
    file: {
      version: 1,
      roomId: 'girl-bedroom-v1',
      items: record.items,
    },
  }
}

export function fileToPlacedItems(file: BedroomFileV1): PlacedItem[] {
  return file.items.map(({ instanceId, catalogId, x, z, rot, parentId }) => ({
    instanceId,
    catalogId,
    cx: x,
    cz: z,
    rot,
    ...(parentId ? { parentId } : {}),
  }))
}
