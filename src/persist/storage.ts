import type { BedroomFileV1 } from './schema'
import { parseLayout } from './schema'

export const LOCAL_STORAGE_KEY = 'bedroom-layout-v1'

export function saveToLocalStorage(file: BedroomFileV1): void {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(file))
}

export function loadFromLocalStorage(): BedroomFileV1 | null {
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
  if (!raw) return null

  try {
    const parsed = parseLayout(JSON.parse(raw))
    return parsed.ok ? parsed.file : null
  } catch {
    return null
  }
}

export function downloadBedroomFile(file: BedroomFileV1): void {
  const blob = new Blob([JSON.stringify(file, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'my-room.bedroom.json'
  anchor.click()
  URL.revokeObjectURL(url)
}

export async function readBedroomFile(
  file: File,
): Promise<
  { ok: true; file: BedroomFileV1 } | { ok: false; error: string }
> {
  try {
    const text = await file.text()
    return parseLayout(JSON.parse(text))
  } catch {
    return { ok: false, error: 'Impossible de lire le fichier de chambre' }
  }
}
