import type { BedroomFileV1 } from './schema'
import { parseLayout } from './schema'

const CLOUD_KEY = 'minideco-cloud-saves-v1'
const MAX_SAVES = 12

export type CloudSave = {
  id: string
  name: string
  savedAt: number
  file: BedroomFileV1
}

function readAll(): CloudSave[] {
  try {
    const raw = localStorage.getItem(CLOUD_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    const out: CloudSave[] = []
    for (const entry of parsed) {
      if (!entry || typeof entry !== 'object') continue
      const e = entry as Record<string, unknown>
      if (typeof e.id !== 'string' || typeof e.name !== 'string') continue
      if (typeof e.savedAt !== 'number') continue
      const file = parseLayout(e.file)
      if (!file.ok) continue
      out.push({ id: e.id, name: e.name, savedAt: e.savedAt, file: file.file })
    }
    return out
  } catch {
    return []
  }
}

function writeAll(saves: CloudSave[]) {
  localStorage.setItem(CLOUD_KEY, JSON.stringify(saves.slice(0, MAX_SAVES)))
}

export function listCloudSaves(): CloudSave[] {
  return readAll().sort((a, b) => b.savedAt - a.savedAt)
}

export function saveToCloud(name: string, file: BedroomFileV1): CloudSave {
  const label = name.trim() || 'Ma chambre'
  const saves = readAll().filter((s) => s.name !== label)
  const entry: CloudSave = {
    id: crypto.randomUUID(),
    name: label,
    savedAt: Date.now(),
    file,
  }
  writeAll([entry, ...saves])
  return entry
}

export function loadCloudSave(id: string): CloudSave | null {
  return readAll().find((s) => s.id === id) ?? null
}

export function deleteCloudSave(id: string) {
  writeAll(readAll().filter((s) => s.id !== id))
}
