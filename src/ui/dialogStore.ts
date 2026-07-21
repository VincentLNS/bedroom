import { create } from 'zustand'

export type DialogOption = { id: string; label: string; meta?: string }

type ConfirmRequest = {
  kind: 'confirm'
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  resolve: (ok: boolean) => void
}

type PromptRequest = {
  kind: 'prompt'
  title: string
  message?: string
  defaultValue?: string
  placeholder?: string
  confirmLabel?: string
  resolve: (value: string | null) => void
}

type PickRequest = {
  kind: 'pick'
  title: string
  message?: string
  options: DialogOption[]
  resolve: (id: string | null) => void
}

type AlertRequest = {
  kind: 'alert'
  title: string
  message: string
  confirmLabel?: string
  resolve: () => void
}

type PinRequest = {
  kind: 'pin'
  mode: 'set' | 'unlock'
  title: string
  message?: string
  resolve: (pin: string | null) => void
}

export type DialogRequest =
  | ConfirmRequest
  | PromptRequest
  | PickRequest
  | AlertRequest
  | PinRequest

type DialogStore = {
  current: DialogRequest | null
  open: (req: DialogRequest) => void
  clear: () => void
}

export const useDialogStore = create<DialogStore>((set, get) => ({
  current: null,
  open: (req) => {
    const prev = get().current
    if (prev) {
      // Cancel any pending dialog so we never leave a dangling promise.
      if (prev.kind === 'confirm') prev.resolve(false)
      else if (prev.kind === 'prompt' || prev.kind === 'pick' || prev.kind === 'pin') {
        prev.resolve(null)
      } else prev.resolve()
    }
    set({ current: req })
  },
  clear: () => set({ current: null }),
}))

export function askConfirm(opts: {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}): Promise<boolean> {
  return new Promise((resolve) => {
    useDialogStore.getState().open({ kind: 'confirm', resolve, ...opts })
  })
}

export function askPrompt(opts: {
  title: string
  message?: string
  defaultValue?: string
  placeholder?: string
  confirmLabel?: string
}): Promise<string | null> {
  return new Promise((resolve) => {
    useDialogStore.getState().open({ kind: 'prompt', resolve, ...opts })
  })
}

export function askPick(opts: {
  title: string
  message?: string
  options: DialogOption[]
}): Promise<string | null> {
  return new Promise((resolve) => {
    useDialogStore.getState().open({ kind: 'pick', resolve, ...opts })
  })
}

export function askAlert(opts: {
  title: string
  message: string
  confirmLabel?: string
}): Promise<void> {
  return new Promise((resolve) => {
    useDialogStore.getState().open({ kind: 'alert', resolve, ...opts })
  })
}

export function askPin(opts: {
  mode: 'set' | 'unlock'
  title: string
  message?: string
}): Promise<string | null> {
  return new Promise((resolve) => {
    useDialogStore.getState().open({ kind: 'pin', resolve, ...opts })
  })
}
