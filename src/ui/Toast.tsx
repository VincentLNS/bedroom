import { useEffect } from 'react'
import { useRoomStore } from '../store/roomStore'

const AUTO_CLEAR_MS = 2200

export function Toast() {
  const toast = useRoomStore((s) => s.toast)
  const clearToast = useRoomStore((s) => s.clearToast)

  useEffect(() => {
    if (!toast) return
    const id = window.setTimeout(() => clearToast(), AUTO_CLEAR_MS)
    return () => window.clearTimeout(id)
  }, [toast, clearToast])

  if (!toast) return null

  return (
    <div
      className={`toast toast--${toast.tone}`}
      role="status"
      aria-live="polite"
    >
      {toast.message}
    </div>
  )
}
