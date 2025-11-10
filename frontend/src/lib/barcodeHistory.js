const STORAGE_KEY = 'ecoverify_barcode_history'

/**
 * BarcodeHistory entity
 * @typedef {Object} BarcodeHistory
 * @property {string} id
 * @property {string} user_email
 * @property {string} barcode
 * @property {string} [barcode_format]
 * @property {string} [product_id]
 * @property {string} [product_name]
 * @property {number} [trust_score]
 * @property {number} [validation_confidence]
 * @property {string} created_date
 */

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function writeAll(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function listBarcodeHistory(userEmail, limit = 20) {
  return readAll()
    .filter((r) => r.user_email === userEmail)
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    .slice(0, limit)
}

export function createBarcodeHistory(record) {
  const items = readAll()
  const next = {
    id: crypto.randomUUID(),
    created_date: new Date().toISOString(),
    ...record,
  }
  items.unshift(next)
  writeAll(items)
  return next
}

export function deleteBarcodeHistory(id) {
  writeAll(readAll().filter((r) => r.id !== id))
}
