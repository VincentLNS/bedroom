import type { BedroomFileV1 } from './schema'
import { parseAnySave, type HouseFileV2 } from './houseFile'

const SHARE_PARAM = 'r'
/** Prefer hash when token is long — query strings truncate in some browsers / QR scanners. */
const QUERY_SAFE_TOKEN_LEN = 1400

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlToBytes(raw: string): Uint8Array {
  const padded = raw.replace(/-/g, '+').replace(/_/g, '/')
  const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4))
  const binary = atob(padded + pad)
  const out = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i)
  return out
}

function canUseGzipStreams(): boolean {
  return (
    typeof CompressionStream !== 'undefined' &&
    typeof DecompressionStream !== 'undefined' &&
    typeof Blob !== 'undefined' &&
    typeof Blob.prototype.stream === 'function'
  )
}

async function gzipEncode(text: string): Promise<Uint8Array> {
  const stream = new Blob([text])
    .stream()
    .pipeThrough(new CompressionStream('gzip'))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

async function gzipDecode(bytes: Uint8Array): Promise<string> {
  const stream = new Blob([bytes as BlobPart])
    .stream()
    .pipeThrough(new DecompressionStream('gzip'))
  return new Response(stream).text()
}

export type SharePayload = BedroomFileV1 | HouseFileV2

/** Encode a room (v1) or house (v2) into a compact share token (`z…` gzip or `j…` raw). */
export async function encodeShareToken(payload: SharePayload): Promise<string> {
  const json = JSON.stringify(payload)
  if (canUseGzipStreams()) {
    const gz = await gzipEncode(json)
    return `z${bytesToBase64Url(gz)}`
  }
  return `j${bytesToBase64Url(new TextEncoder().encode(json))}`
}

/**
 * Decode a share token into a house file.
 * Legacy single-room tokens are migrated (hall/salon = presets).
 */
export async function decodeShareToken(
  token: string,
): Promise<
  | { ok: true; file: HouseFileV2; kind: 'house' | 'room' }
  | { ok: false; error: string }
> {
  try {
    const encoding = token[0]
    const body = token.slice(1)
    if (!body || (encoding !== 'z' && encoding !== 'j')) {
      return { ok: false, error: 'Lien invalide' }
    }
    const bytes = base64UrlToBytes(body)
    let json: string
    if (encoding === 'z') {
      if (!canUseGzipStreams()) {
        return {
          ok: false,
          error: 'Ce lien nécessite un navigateur plus récent',
        }
      }
      json = await gzipDecode(bytes)
    } else {
      json = new TextDecoder().decode(bytes)
    }
    const data: unknown = JSON.parse(json)
    const kind: 'house' | 'room' =
      data &&
      typeof data === 'object' &&
      (data as { version?: unknown }).version === 2
        ? 'house'
        : 'room'
    const parsed = parseAnySave(data)
    if (!parsed.ok) return parsed
    return { ok: true, file: parsed.file, kind }
  } catch {
    return { ok: false, error: 'Impossible de lire ce lien' }
  }
}

export async function buildShareUrl(payload: SharePayload): Promise<string> {
  const token = await encodeShareToken(payload)
  const url = new URL(window.location.href)
  url.search = ''
  url.hash = ''
  if (token.length > QUERY_SAFE_TOKEN_LEN) {
    url.hash = `${SHARE_PARAM}=${token}`
  } else {
    url.searchParams.set(SHARE_PARAM, token)
  }
  return url.toString()
}

export function readShareTokenFromUrl(href: string): string | null {
  try {
    const url = new URL(href)
    const fromQuery = url.searchParams.get(SHARE_PARAM)
    if (fromQuery) return fromQuery
    const hash = url.hash.replace(/^#/, '')
    if (hash.startsWith(`${SHARE_PARAM}=`)) {
      return decodeURIComponent(hash.slice(SHARE_PARAM.length + 1))
    }
  } catch {
    /* ignore */
  }
  return null
}

export function readShareTokenFromLocation(): string | null {
  try {
    return readShareTokenFromUrl(window.location.href)
  } catch {
    return null
  }
}

export function clearShareParamsFromUrl() {
  try {
    const url = new URL(window.location.href)
    if (!url.searchParams.has(SHARE_PARAM) && !url.hash.includes(`${SHARE_PARAM}=`)) {
      return
    }
    url.searchParams.delete(SHARE_PARAM)
    url.hash = ''
    window.history.replaceState({}, '', url.pathname + url.search)
  } catch {
    /* ignore */
  }
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

export async function shareOrCopyUrl(url: string): Promise<'shared' | 'copied' | 'failed'> {
  try {
    if (navigator.share) {
      await navigator.share({
        title: 'Mini Déco — ma maison',
        text: 'Regarde ma maison Mini Déco !',
        url,
      })
      return 'shared'
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return 'failed'
  }
  const ok = await copyText(url)
  return ok ? 'copied' : 'failed'
}
