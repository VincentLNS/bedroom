import { askPin } from './dialogStore'
import { useRoomStore } from '../store/roomStore'

const PIN_KEY = 'minideco-parent-pin-v1'

export function loadParentPin(): string | null {
  try {
    const raw = localStorage.getItem(PIN_KEY)
    if (!raw || !/^\d{4}$/.test(raw)) return null
    return raw
  } catch {
    return null
  }
}

export function saveParentPin(pin: string) {
  localStorage.setItem(PIN_KEY, pin)
}

/** Ask for / set PIN then unlock parent controls. Returns true if authorized. */
export async function requireParentAccess(): Promise<boolean> {
  const existing = loadParentPin()
  if (!existing) {
    const created = await askPin({
      mode: 'set',
      title: 'Code parent',
      message: 'Choisis un code à 4 chiffres pour protéger les réglages.',
    })
    if (!created) return false
    saveParentPin(created)
    useRoomStore.getState().flashToast('Code parent enregistré', 'ok')
    return true
  }

  const entered = await askPin({
    mode: 'unlock',
    title: 'Code parent',
    message: 'Entre le code pour ouvrir les réglages parents.',
  })
  if (!entered) return false
  if (entered !== existing) {
    useRoomStore.getState().flashToast('Code incorrect', 'error')
    return false
  }
  return true
}

export async function enableParentLockWithPin(): Promise<boolean> {
  let pin = loadParentPin()
  if (!pin) {
    const created = await askPin({
      mode: 'set',
      title: 'Activer le verrou',
      message: 'Choisis un code à 4 chiffres. L’enfant devra le demander pour déverrouiller.',
    })
    if (!created) return false
    saveParentPin(created)
    pin = created
  } else {
    const ok = await askPin({
      mode: 'unlock',
      title: 'Activer le verrou',
      message: 'Confirme avec ton code parent.',
    })
    if (!ok || ok !== pin) {
      if (ok) useRoomStore.getState().flashToast('Code incorrect', 'error')
      return false
    }
  }
  useRoomStore.getState().setParentLock(true)
  return true
}

export async function disableParentLockWithPin(): Promise<boolean> {
  const pin = loadParentPin()
  if (!pin) {
    useRoomStore.getState().setParentLock(false)
    return true
  }
  const entered = await askPin({
    mode: 'unlock',
    title: 'Désactiver le verrou',
    message: 'Entre le code parent.',
  })
  if (!entered) return false
  if (entered !== pin) {
    useRoomStore.getState().flashToast('Code incorrect', 'error')
    return false
  }
  useRoomStore.getState().setParentLock(false)
  return true
}
