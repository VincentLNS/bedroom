import { useEffect, useRef, useState } from 'react'
import Peer, { type DataConnection } from 'peerjs'
import { cloneHouseRooms, type HouseSnapshot } from '../house/rooms'
import { useRoomStore } from '../store/roomStore'

type WireMsg =
  | { type: 'hello'; name: string }
  | { type: 'full'; snapshot: HouseSnapshot }
  | { type: 'patch'; snapshot: HouseSnapshot }

type SessionMode = 'idle' | 'host' | 'guest'

/** Module-level session so Fermer keeps the link alive. */
const session = {
  peer: null as Peer | null,
  conn: null as DataConnection | null,
  mode: 'idle' as SessionMode,
  code: '',
  joinCode: '',
  status: 'Choisis : créer ou rejoindre.',
  connected: false,
}

function peerErrorMessage(type: string): string {
  switch (type) {
    case 'peer-unavailable':
      return 'Code introuvable — vérifie ou redemande-le.'
    case 'network':
      return 'Réseau coupé — même Wi‑Fi recommandé.'
    case 'disconnected':
      return 'Déconnecté du serveur PeerJS.'
    case 'server-error':
      return 'Serveur Co-déco indisponible.'
    case 'browser-incompatible':
      return 'Navigateur trop ancien pour Co-déco.'
    default:
      return 'Co-déco impossible pour le moment.'
  }
}

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
    undoStack: [],
    redoStack: [],
  })
  queueMicrotask(() => {
    useRoomStore.setState({ applyingRemote: false })
  })
  if (!silent) {
    useRoomStore.getState().flashToast('Maison synchronisée', 'ok')
  }
}

function destroySession() {
  session.conn?.close()
  session.peer?.destroy()
  session.conn = null
  session.peer = null
  session.mode = 'idle'
  session.code = ''
  session.connected = false
  session.status = 'Choisis : créer ou rejoindre.'
}

type Props = {
  open: boolean
  onClose: () => void
}

export function CoPlayModal({ open, onClose }: Props) {
  const flashToast = useRoomStore((s) => s.flashToast)
  const [mode, setMode] = useState<SessionMode>(session.mode)
  const [code, setCode] = useState(session.code)
  const [joinCode, setJoinCode] = useState(session.joinCode)
  const [status, setStatus] = useState(session.status)
  const [connected, setConnected] = useState(session.connected)
  const syncingRef = useRef(false)

  const pushStatus = (next: string) => {
    session.status = next
    setStatus(next)
  }

  useEffect(() => {
    if (!open) return
    setMode(session.mode)
    setCode(session.code)
    setJoinCode(session.joinCode)
    setStatus(session.status)
    setConnected(session.connected)
  }, [open])

  useEffect(() => {
    if (!open || mode === 'idle') return
    syncingRef.current = true
    const unsub = useRoomStore.subscribe((state, prev) => {
      if (!syncingRef.current) return
      if (state.applyingRemote) return
      if (
        state.items === prev.items &&
        state.activeRoom === prev.activeRoom &&
        state.rooms === prev.rooms
      ) {
        return
      }
      const conn = session.conn
      if (!conn?.open) return
      conn.send({
        type: 'patch',
        snapshot: snapshotFromStore(),
      } satisfies WireMsg)
    })
    return () => {
      syncingRef.current = false
      unsub()
    }
  }, [open, mode])

  const wireConn = (conn: DataConnection, asHost: boolean) => {
    session.conn = conn
    conn.on('open', () => {
      session.connected = true
      setConnected(true)
      pushStatus(
        asHost
          ? 'Ami·e connecté·e — décorez ensemble !'
          : 'Connecté·e — la maison se synchronise.',
      )
      flashToast('Co-déco en direct !', 'ok')
      if (asHost) {
        conn.send({
          type: 'full',
          snapshot: snapshotFromStore(),
        } satisfies WireMsg)
      }
    })
    conn.on('data', (raw) => {
      const msg = raw as WireMsg
      if (msg.type === 'full' || msg.type === 'patch') {
        applySnapshot(msg.snapshot, msg.type === 'patch')
      }
    })
    conn.on('close', () => {
      session.connected = false
      setConnected(false)
      pushStatus('Connexion fermée — tu peux réessayer.')
      flashToast('Co-déco terminée', 'info')
    })
    conn.on('error', () => {
      pushStatus('Lien instable — réessaie dans un instant.')
      flashToast('Lien Co-déco instable', 'error')
    })
  }

  const startHost = () => {
    destroySession()
    session.mode = 'host'
    setMode('host')
    setConnected(false)
    pushStatus('Ouverture du salon…')
    const peer = new Peer()
    session.peer = peer
    peer.on('open', (id) => {
      session.code = id
      setCode(id)
      pushStatus('Donne ce code à ton ami·e (même Wi‑Fi recommandé).')
    })
    peer.on('connection', (conn) => {
      // Prefer a single guest for this beta.
      if (session.conn?.open) {
        conn.close()
        return
      }
      wireConn(conn, true)
    })
    peer.on('error', (err) => {
      const msg = peerErrorMessage(String(err.type))
      pushStatus(msg)
      flashToast(msg, 'error')
    })
  }

  const startGuest = (hostId = joinCode.trim()) => {
    if (!hostId) {
      flashToast('Entre le code', 'error')
      return
    }
    destroySession()
    session.joinCode = hostId
    session.mode = 'guest'
    setJoinCode(hostId)
    setMode('guest')
    setConnected(false)
    pushStatus('Connexion…')
    const peer = new Peer()
    session.peer = peer
    peer.on('open', () => {
      const conn = peer.connect(hostId, { reliable: true })
      wireConn(conn, false)
    })
    peer.on('error', (err) => {
      const msg = peerErrorMessage(String(err.type))
      pushStatus(msg)
      flashToast(msg, 'error')
    })
  }

  const leaveSalon = () => {
    destroySession()
    setMode('idle')
    setCode('')
    setConnected(false)
    pushStatus('Choisis : créer ou rejoindre.')
    flashToast('Salon fermé', 'info')
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
        <p className="magic-modal-hint">
          Beta · même Wi‑Fi recommandé · le code est temporaire.
        </p>
        <p className="magic-modal-hint" aria-live="polite">
          {status}
        </p>
        {connected && (
          <p className="coplay-live" role="status">
            ● En direct
          </p>
        )}

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
                onChange={(e) => {
                  session.joinCode = e.target.value
                  setJoinCode(e.target.value)
                }}
                placeholder="Code de l’ami·e"
                aria-label="Code co-déco"
              />
              <button
                type="button"
                className="top-bar-btn"
                onClick={() => startGuest()}
              >
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
            {connected ? 'Continuer (garder le lien)' : 'Fermer'}
          </button>
          {mode === 'host' && code && (
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
          {mode === 'host' && !connected && (
            <button type="button" className="top-bar-btn" onClick={startHost}>
              Relancer le salon
            </button>
          )}
          {mode === 'guest' && !connected && (
            <button
              type="button"
              className="top-bar-btn"
              onClick={() => startGuest(session.joinCode || joinCode)}
            >
              Réessayer
            </button>
          )}
          {mode !== 'idle' && (
            <button type="button" className="top-bar-btn" onClick={leaveSalon}>
              Quitter le salon
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
