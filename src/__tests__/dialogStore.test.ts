import { describe, expect, it } from 'vitest'
import { askConfirm, useDialogStore } from '../ui/dialogStore'

describe('dialogStore', () => {
  it('resolves confirm via open request', async () => {
    useDialogStore.getState().clear()
    const pending = askConfirm({
      title: 'Test',
      message: 'Hello',
    })
    const current = useDialogStore.getState().current
    expect(current?.kind).toBe('confirm')
    if (current?.kind === 'confirm') current.resolve(true)
    useDialogStore.getState().clear()
    await expect(pending).resolves.toBe(true)
  })
})
