import { mockScanHistory } from '@/components/data/productData'

const STORAGE_KEY = 'ecoverify_scan_history'
const SEEDED_KEY = 'ecoverify_scan_history_seeded'

/**
 * @typedef {Object} ScanRecord
 * @property {string} id
 * @property {string} productId
 * @property {string} timestamp ISO
 * @property {boolean} saved
 * @property {'photo'|'barcode'|'search'|'manual'} [source]
 * @property {number} [trustScore]
 */

function apiBase() {
  if (import.meta.env.VITE_API_URL === undefined) return ''
  return String(import.meta.env.VITE_API_URL).replace(/\/$/, '')
}

function readRaw() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function writeAll(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

function ensureSeeded() {
  if (typeof localStorage === 'undefined') return
  if (localStorage.getItem(SEEDED_KEY) === '1') return
  const existing = readRaw()
  if (!existing.length) {
    const seeded = mockScanHistory.map((s) => ({
      id: crypto.randomUUID(),
      productId: String(s.productId),
      timestamp: s.timestamp,
      saved: Boolean(s.saved),
      source: 'manual',
    }))
    writeAll(seeded)
  }
  localStorage.setItem(SEEDED_KEY, '1')
}

function normalizeLocal(items) {
  return items
    .map((s) => ({
      ...s,
      productId: String(s.productId),
      saved: Boolean(s.saved),
    }))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
}

/** @returns {ScanRecord[]} */
export function listScans() {
  ensureSeeded()
  return normalizeLocal(readRaw())
}

/**
 * Prefer API scans when backend is up; fall back to localStorage.
 * @returns {Promise<ScanRecord[]>}
 */
export async function loadScans() {
  ensureSeeded()
  try {
    const res = await fetch(`${apiBase()}/api/scans`)
    if (!res.ok) throw new Error('scans api unavailable')
    const remote = await res.json()
    if (Array.isArray(remote) && remote.length) {
      const mapped = remote.map((s) => ({
        id: s.id,
        productId: String(s.productId),
        timestamp: s.timestamp,
        saved: Boolean(s.saved),
        source: s.source || 'manual',
        trustScore: typeof s.trustScore === 'number' ? s.trustScore : undefined,
      }))
      writeAll(mapped)
      localStorage.setItem(SEEDED_KEY, '1')
      return normalizeLocal(mapped)
    }
  } catch {
    // offline / backend down — use local cache
  }
  return listScans()
}

/**
 * Record a completed scan and return the new entry.
 * Writes locally immediately; syncs to API when available.
 * @param {{ productId: string, source?: ScanRecord['source'], trustScore?: number, saved?: boolean }} input
 */
export function recordScan(input) {
  ensureSeeded()
  const items = readRaw()
  const next = {
    id: crypto.randomUUID(),
    productId: String(input.productId),
    timestamp: new Date().toISOString(),
    saved: Boolean(input.saved),
    source: input.source || 'manual',
    trustScore: typeof input.trustScore === 'number' ? input.trustScore : undefined,
  }
  items.unshift(next)
  writeAll(items.slice(0, 200))

  void syncScanToApi(next).then((remote) => {
    if (!remote?.id) return
    const cur = readRaw()
    writeAll(cur.map((s) => (s.id === next.id ? { ...s, id: remote.id } : s)))
  })

  return next
}

async function syncScanToApi(scan) {
  try {
    const res = await fetch(`${apiBase()}/api/scans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: scan.productId,
        source: scan.source || 'manual',
        trustScore: scan.trustScore,
        saved: scan.saved,
      }),
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export function toggleSaved(scanId) {
  ensureSeeded()
  const items = readRaw()
  const target = items.find((s) => s.id === scanId)
  const nextSaved = target ? !target.saved : false
  const next = items.map((s) => (s.id === scanId ? { ...s, saved: !s.saved } : s))
  writeAll(next)

  if (target) {
    void fetch(`${apiBase()}/api/scans/${scanId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ saved: nextSaved }),
    }).catch(() => {})
  }

  return next.find((s) => s.id === scanId) || null
}

/** Toggle saved on the most recent scan for a product (or create a saved entry). */
export function toggleSavedForProduct(productId) {
  ensureSeeded()
  const pid = String(productId)
  const items = readRaw()
  const latest = items.find((s) => String(s.productId) === pid)
  if (latest) {
    return toggleSaved(latest.id)
  }
  return recordScan({ productId: pid, source: 'manual', saved: true })
}

export function isProductSaved(productId) {
  const pid = String(productId)
  return listScans().some((s) => s.productId === pid && s.saved)
}

export function getScanStats() {
  const scans = listScans()
  const uniqueProducts = new Set(scans.map((s) => s.productId))
  return {
    totalScans: scans.length,
    uniqueProducts: uniqueProducts.size,
    savedCount: scans.filter((s) => s.saved).length,
  }
}

export function clearScanHistory() {
  writeAll([])
  localStorage.setItem(SEEDED_KEY, '1')
}
