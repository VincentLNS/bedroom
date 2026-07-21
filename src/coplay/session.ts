import Peer, { type DataConnection } from 'peerjs'
import { cloneHouseRooms, type HouseSnapshot } from '../house/rooms'
import { useRoomStore } from '../store/roomStore'

export type CoPlayMode = 'idle' | 'host' | 'guest'

export type CoPlaySnapshot = {
  mode: CoPlayMode
  /** Short kid-facing code (e.g. AB12), empty when idle/guest without host yet. */
  code: string
  joinCode: string
  status: string
  connected: boolean
  waiting: boolean
}

type WireMsg =
  | { type: 'hello'; name: string }
  | { type: 'full'; snapshot: HouseSnapshot }
  | { type: 'patch'; snapshot: HouseSnapshot }

const CODE_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
const PEER_PREFIX = 'md-'
const CODE_LEN = 4

type Listener = (snap: CoPlaySnapshot) => void

const listeners = new Set<Listener>()

let peer: Peer | null = null
let conn: DataConnection | null = null
let mode: CoPlayMode = 'idle'
let code = ''
let joinCode = ''
let status = 'Choisis : créer ou rejoindre.'
let connected = false
let waiting = false
let storeUnsub: (() => void) | null = null

function snapshot(): CoPlaySnapshot {
  return { mode, code, joinCode, status, connected, waiting }
}

function emit() {
  const snap = snapshot()
  for (const listener of listeners) listener(snap)
}

export function getCoPlaySnapshot(): CoPlaySnapshot {
  return snapshot()
}

export function subscribeCoPlay(listener: Listener): () => void {
  listeners.add(listener)
  listener(snapshot())
  return () => {
    listeners.delete(listener)
  }
}

export function peerErrorMessage(type: string): string {
  switch (type) {
    case 'peer-unavailable':
      return 'Code introuvable — vérifie ou redemande-le.'
    case 'unavailable-id':
      return 'Code déjà pris — nouvel essai…'
    case 'network':
      return 'Réseau coupé — même Wi‑Fi recommandé.'
    case 'disconnected':
      return 'Déconnecté du serveur PeerJS.'
    case 'server-error':
      return 'Serveur Co-déco indisponible.'
    case 'browser-incompatible':
      return 'Navigateur trop ancien pour Co-déco.'
    case 'invalid-id':
      return 'Code invalide.'
    default:
      return 'Co-déco impossible pour le moment.'
  }
}

/** Generate a short 4-char salon code (no ambiguous 0/O/1/I). */
export function generateSalonCode(): string {
  const bytes = new Uint8Array(CODE_LEN)
  crypto.getRandomValues(bytes)
  let out = ''
  for (let i = 0; i < CODE_LEN; i++) {
    out += CODE_ALPHABET[bytes[i]! % CODE_ALPHABET.length]!
  }
  return out
}

/** Normalize user input → PeerJS id (`md-AB12`). Accepts AB12, md-AB12, or legacy UUID. */
export function toPeerId(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ''
  const upper = trimmed.toUpperCase().replace(/\s+/g, '')
  if (/^[2-9A-HJ-NP-Z]{4}$/.test(upper)) return `${PEER_PREFIX}${upper}`
  if (/^MD-[2-9A-HJ-NP-Z]{4}$/i.test(trimmed)) {
    return `${PEER_PREFIX}${trimmed.slice(3).toUpperCase()}`
  }
  // Legacy / full PeerJS id
  return trimmed
}

/** Display form for kids (AB12). */
export function displayCodeFromPeerId(peerId: string): string {
  if (peerId.toLowerCase().startsWith(PEER_PREFIX)) {
    return peerId.slice(PEER_PREFIX.length).toUpperCase()
  }
  return peerId
}

function houseSnapshot(): HouseSnapshot {
  const s = useRoomStore.getState()
  return {
    activeRoom: s.activeRoom,
    rooms: cloneHouseRooms({
      ...s.rooms,
      [s.activeRoom]: s.items,
    }),
  }
}

function applyHouseSnapshot(next: HouseSnapshot, silent = true) {
  useRoomStore.setState({
    applyingRemote: true,
    activeRoom: next.activeRoom,
    rooms: cloneHouseRooms(next.rooms),
    items: next.rooms[next.activeRoom].map((i) => ({ ...i })),
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

function stopStoreSync() {
  storeUnsub?.()
  storeUnsub = null
}

function startStoreSync() {
  stopStoreSync()
  storeUnsub = useRoomStore.subscribe((state, prev) => {
    if (state.applyingRemote) return
    if (
      state.items === prev.items &&
      state.activeRoom === prev.activeRoom &&
      state.rooms === prev.rooms
    ) {
      return
    }
    if (!conn?.open) return
    conn.send({
      type: 'patch',
      snapshot: houseSnapshot(),
    } satisfies WireMsg)
  })
}

function setStatus(next: string) {
  status = next
  emit()
}

function wireConn(next: DataConnection, asHost: boolean) {
  conn = next
  next.on('open', () => {
    connected = true
    waiting = false
    setStatus(
      asHost
        ? 'Ami·e connecté·e — décorez ensemble !'
        : 'Connecté·e — la maison se synchronise.',
    )
    useRoomStore.getState().flashToast('Co-déco en direct !', 'ok')
    startStoreSync()
    if (asHost) {
      next.send({
        type: 'full',
        snapshot: houseSnapshot(),
      } satisfies WireMsg)
    }
    emit()
  })
  next.on('data', (raw) => {
    const msg = raw as WireMsg
    if (msg.type === 'full' || msg.type === 'patch') {
      applyHouseSnapshot(msg.snapshot, msg.type === 'patch')
    }
  })
  next.on('close', () => {
    connected = false
    stopStoreSync()
    setStatus('Connexion fermée — tu peux réessayer.')
    useRoomStore.getState().flashToast('Co-déco terminée', 'info')
    emit()
  })
  next.on('error', () => {
    setStatus('Lien instable — réessaie dans un instant.')
    useRoomStore.getState().flashToast('Lien Co-déco instable', 'error')
  })
}

function destroyPeerOnly() {
  stopStoreSync()
  conn?.close()
  peer?.destroy()
  conn = null
  peer = null
}

export function destroyCoPlaySession() {
  destroyPeerOnly()
  mode = 'idle'
  code = ''
  connected = false
  waiting = false
  status = 'Choisis : créer ou rejoindre.'
  emit()
}

export function startCoPlayHost(attempt = 0) {
  destroyPeerOnly()
  mode = 'host'
  connected = false
  waiting = true
  const short = generateSalonCode()
  code = short
  const peerId = `${PEER_PREFIX}${short}`
  status =
    attempt === 0
      ? 'Ouverture du salon…'
      : 'Code déjà pris — nouvel essai…'
  emit()

  const next = new Peer(peerId)
  peer = next

  next.on('open', (id) => {
    code = displayCodeFromPeerId(id)
    waiting = true
    setStatus(`Code : ${code} — donne-le à ton ami·e.`)
  })

  next.on('connection', (incoming) => {
    if (conn?.open) {
      incoming.close()
      return
    }
    wireConn(incoming, true)
  })

  next.on('error', (err) => {
    const type = String(err.type)
    if (type === 'unavailable-id' && attempt < 6) {
      startCoPlayHost(attempt + 1)
      return
    }
    waiting = false
    const msg = peerErrorMessage(type)
    setStatus(msg)
    useRoomStore.getState().flashToast(msg, 'error')
  })
}

export function startCoPlayGuest(rawCode: string) {
  const peerId = toPeerId(rawCode)
  if (!peerId) {
    useRoomStore.getState().flashToast('Entre le code', 'error')
    return
  }

  destroyPeerOnly()
  joinCode = displayCodeFromPeerId(peerId)
  mode = 'guest'
  code = ''
  connected = false
  waiting = true
  status = 'Connexion…'
  emit()

  const next = new Peer()
  peer = next

  next.on('open', () => {
    const link = next.connect(peerId, { reliable: true })
    wireConn(link, false)
  })

  next.on('error', (err) => {
    waiting = false
    const msg = peerErrorMessage(String(err.type))
    setStatus(msg)
    useRoomStore.getState().flashToast(msg, 'error')
  })
}

export function leaveCoPlaySalon() {
  destroyCoPlaySession()
  useRoomStore.getState().flashToast('Salon fermé', 'info')
}
