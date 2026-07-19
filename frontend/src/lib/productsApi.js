/**
 * Product catalog API — Neon/Render DB is source of truth when online.
 * Falls back to local productData when the API is unreachable.
 */

import {
  getProductByBarcode as localByBarcode,
  getProductById as localById,
  searchProducts as localSearch,
  products as localProducts,
} from '@/components/data/productData'

function apiBase() {
  if (import.meta.env.VITE_API_URL === undefined) return ''
  return String(import.meta.env.VITE_API_URL).replace(/\/$/, '')
}

async function getJson(path) {
  const res = await fetch(`${apiBase()}${path}`)
  if (!res.ok) {
    const err = new Error(`API ${res.status}`)
    err.status = res.status
    throw err
  }
  return res.json()
}

/** @returns {Promise<object|null>} */
export async function fetchProductByBarcode(barcode) {
  const clean = String(barcode || '').replace(/\s/g, '')
  if (!clean) return null
  try {
    return await getJson(`/api/products/barcode/${encodeURIComponent(clean)}`)
  } catch {
    return localByBarcode(clean)
  }
}

/** @returns {Promise<object|null>} */
export async function fetchProductById(id) {
  const pid = String(id || '')
  if (!pid) return null
  try {
    return await getJson(`/api/products/${encodeURIComponent(pid)}`)
  } catch {
    return localById(pid)
  }
}

/** @returns {Promise<object[]>} */
export async function fetchProducts() {
  try {
    const list = await getJson('/api/products')
    if (Array.isArray(list) && list.length) return list
  } catch {
    // offline
  }
  return localProducts
}

/**
 * Resolve a typed barcode / id to a product via API (preferred) or local catalog.
 * @returns {Promise<{ product: object|null, source: 'api'|'local'|'none', clean: string }>}
 */
export async function resolveBarcode(raw) {
  const clean = String(raw || '').replace(/\s/g, '')
  if (!clean) return { product: null, source: 'none', clean }

  // Demo shortcut: product id 1–12
  if (/^\d{1,2}$/.test(clean)) {
    const n = Number(clean)
    if (n >= 1 && n <= 12) {
      const product = await fetchProductById(String(n))
      return { product, source: product ? 'api' : 'none', clean }
    }
  }

  try {
    const product = await getJson(`/api/products/barcode/${encodeURIComponent(clean)}`)
    return { product, source: 'api', clean }
  } catch (err) {
    if (err?.status === 404) {
      const local = localByBarcode(clean)
      return { product: local, source: local ? 'local' : 'none', clean }
    }
    const local = localByBarcode(clean)
    return { product: local, source: local ? 'local' : 'none', clean }
  }
}

/** Search: API catalog if available, else local. */
export async function resolveSearch(query) {
  const q = String(query || '').toLowerCase().trim()
  if (!q) return []
  const catalog = await fetchProducts()
  return catalog.filter(
    (p) =>
      p.name?.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      String(p.barcode || '').includes(q) ||
      String(p.id) === q,
  )
}

export function listKnownBarcodes() {
  return localProducts.map((p) => ({ id: p.id, barcode: p.barcode, name: p.name }))
}
