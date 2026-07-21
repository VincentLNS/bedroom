import { useEffect, useRef, useState } from 'react'
import Peer, { type DataConnection } from 'peerjs'
import { cloneHouseRooms, type HouseSnapshot } from '../house/rooms'
import { useRoomStore } from '../store/roomStore'

type WireMsg =
  | { type: 'hello'; name: string }
  | { type: 'full'; snapshot: HouseSnapshot }
  | { type: 'patch'; snapshot: HouseSnapshot }

function snapshotFromStore(): HouseSnapshot {
  const s = useRoomStore.getState()
  return {
    activeRoom: s.activeRoom,
    rooms: cloneHouseRooms({
      ...s.rooms,
      [s.activeRoom]: s.items,
    }),
  }
}

function applySnapshot(snapshot: HouseSnapshot, silent = true) {
  useRoomStore.setState({
    applyingRemote: true,
    activeRoom: snapshot.activeRoom,
    rooms: cloneHouseRooms(snapshot.rooms),
    items: snapshot.rooms[snapshot.activeRoom].map((i) => ({ ...i })),
    selectedId: null,
    pendingCatalogId: null,
    mode: 'orbit',
  })
  // release on next tick so local subscribers don't echo
  queueMicrotask(() => {
    useRoomStore.setState({ applyingRemote: false })
  })
  if (!silent) {
    useRoomStore.getState().flashToast('Chambre synchronisée', 'ok')
  }
}

type Props = {
  open: boolean
  onClose: () => void
}

export function CoPlayModal({ open, onClose }: Props) {
  const flashToast = useRoomStore((s) => s.flashToast)
  const [mode, setMode] = useState<'idle' | 'host' | 'guest'>('idle')
  const [code, setCode] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [status, setStatus] = useState('Choisis : créer ou rejoindre.')
  const peerRef = useRef<Peer | null>(null)
  const connRef = useRef<DataConnection | null>(null)

  useEffect(() => {
    if (!open) return
    return () => {
      connRef.current?.close()
      peerRef.current?.destroy()
      connRef.current = null
      peerRef.current = null
    }
  }, [open])

  useEffect(() => {
    if (!open || mode === 'idle') return
    const unsub = useRoomStore.subscribe((state, prev) => {
      if (state.applyingRemote) return
      if (
        state.items === prev.items &&
        state.activeRoom === prev.activeRoom &&
        state.rooms === prev.rooms
      ) {
        return
      }
      const conn = connRef.current
      if (!conn?.open) return
      conn.send({
        type: 'patch',
        snapshot: snapshotFromStore(),
      } satisfies WireMsg)
    })
    return unsub
  }, [open, mode])

  const wireConn = (conn: DataConnection, asHost: boolean) => {
    connRef.current = conn
    conn.on('open', () => {
      setStatus(asHost ? 'Ami·e connecté·e — décorez ensemble !' : 'Connecté·e !')
      flashToast('Co-déco en direct !', 'ok')
      if (asHost) {
        conn.send({ type: 'full', snapshot: snapshotFromStore() } satisfies WireMsg)
      }
    })
    conn.on('data', (raw) => {
      const msg = raw as WireMsg
      if (msg.type === 'full' || msg.type === 'patch') {
        applySnapshot(msg.snapshot, msg.type === 'patch')
      }
    })
    conn.on('close', () => {
      setStatus('Connexion fermée.')
      flashToast('Co-déco terminée', 'info')
    })
  }

  const startHost = () => {
    setMode('host')
    setStatus('Ouverture du salon…')
    const peer = new Peer()
    peerRef.current = peer
    peer.on('open', (id) => {
      setCode(id)
      setStatus('Donne ce code à ton ami·e.')
    })
    peer.on('connection', (conn) => wireConn(conn, true))
    peer.on('error', (err) => {
      setStatus(`Erreur : ${err.type}`)
      flashToast('Co-déco impossible', 'error')
    })
  }

  const startGuest = () => {
    const hostId = joinCode.trim()
    if (!hostId) {
      flashToast('Entre le code', 'error')
      return
    }
    setMode('guest')
    setStatus('Connexion…')
    const peer = new Peer()
    peerRef.current = peer
    peer.on('open', () => {
      const conn = peer.connect(hostId, { reliable: true })
      wireConn(conn, false)
    })
    peer.on('error', (err) => {
      setStatus(`Erreur : ${err.type}`)
      flashToast('Code invalide ou hors-ligne', 'error')
    })
  }

  if (!open) return null

  return (
    <div className="magic-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="magic-modal"
        role="dialog"
        aria-label="Co-déco"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="magic-modal-title">Co-déco en direct</h2>
        <p className="magic-modal-hint">{status}</p>
        {mode === 'idle' && (
          <div className="magic-modal-actions magic-modal-actions--stack">
            <button
              type="button"
              className="top-bar-btn top-bar-btn--primary"
              onClick={startHost}
            >
              Créer un salon
            </button>
            <div className="coplay-join">
              <input
                className="coplay-input"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="Code de l’ami·e"
                aria-label="Code co-déco"
              />
              <button type="button" className="top-bar-btn" onClick={startGuest}>
                Rejoindre
              </button>
            </div>
          </div>
        )}
        {mode === 'host' && code && (
          <p className="coplay-code" aria-live="polite">
            Code : <strong>{code}</strong>
          </p>
        )}
        <div className="magic-modal-actions">
          <button type="button" className="top-bar-btn" onClick={onClose}>
            Fermer
          </button>
          {code && (
            <button
              type="button"
              className="top-bar-btn top-bar-btn--primary"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(code)
                  flashToast('Code copié', 'ok')
                } catch {
                  flashToast('Copie impossible', 'error')
                }
              }}
            >
              Copier le code
            </button>
          )}
        </div>
      </div>
    </div>
  )
}