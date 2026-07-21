import type { BedroomFileV1 } from './schema'
import { parseLayout } from './schema'
import {
  parseAnySave,
  type HouseFileV2,
} from './houseFile'

export const LOCAL_STORAGE_KEY = 'bedroom-layout-v1'

export function saveToLocalStorage(file: BedroomFileV1 | HouseFileV2): void {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(file))
}

/** @deprecated Prefer loadHouseFromLocalStorage — kept for callers expecting v1. */
export function loadFromLocalStorage(): BedroomFileV1 | null {
  const house = loadHouseFromLocalStorage()
  if (!house) return null
  return {
    version: 1,
    roomId: 'girl-bedroom-v1',
    items: house.rooms.bedroom,
  }
}

export function saveHouseToLocalStorage(file: HouseFileV2): void {
  saveToLocalStorage(file)
}

export function loadHouseFromLocalStorage(): HouseFileV2 | null {
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
  if (!raw) return null

  try {
    const parsed = parseAnySave(JSON.parse(raw))
    return parsed.ok ? parsed.file : null
  } catch {
    return null
  }
}

export function downloadBedroomFile(file: BedroomFileV1 | HouseFileV2): void {
  const blob = new Blob([JSON.stringify(file, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  const isHouse = 'kind' in file && file.version === 2
  anchor.download = isHouse ? 'ma-maison.minideco.json' : 'my-room.bedroom.json'
  anchor.click()
  URL.revokeObjectURL(url)
}

export async function readBedroomFile(
  file: File,
): Promise<
  | { ok: true; file: BedroomFileV1 }
  | { ok: false; error: string }
> {
  try {
    const text = await file.text()
    return parseLayout(JSON.parse(text))
  } catch {
    return { ok: false, error: 'Impossible de lire le fichier de chambre' }
  }
}

export async function readHouseFile(
  file: File,
): Promise<{ ok: true; file: HouseFileV2 } | { ok: false; error: string }> {
  try {
    const text = await file.text()
    return parseAnySave(JSON.parse(text))
  } catch {
    return { ok: false, error: 'Impossible de lire le fichier maison' }
  }
}
