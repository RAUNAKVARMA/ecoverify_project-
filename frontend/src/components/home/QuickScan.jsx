import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Barcode, Search, Loader2, Sparkles, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { classifyProductImage, analyzeEcoRating, validateBarcode } from '@/lib/ai'
import { matchProductFromAI, products } from '@/components/data/productData'
import { useAuth } from '@/context/AuthContext'
import { createBarcodeHistory } from '@/lib/barcodeHistory'
import { recordScan } from '@/lib/scanHistory'
import {
  resolveBarcode,
  resolveSearch,
  fetchProductById,
  listKnownBarcodes,
} from '@/lib/productsApi'

const MODES = [
  { id: 'photo', label: 'Photo', icon: Camera, hint: 'Snap the pack' },
  { id: 'barcode', label: 'Barcode', icon: Barcode, hint: 'Type or paste' },
  { id: 'search', label: 'Search', icon: Search, hint: 'Name or brand' },
]

function goToProduct(navigate, product, extra = {}) {
  recordScan({
    productId: product.id,
    source: extra.source || 'manual',
    trustScore: extra.trustScore ?? product.trust_score,
  })
  navigate(`/ProductDetail?id=${product.id}`)
}

function trustTone(score) {
  if (score >= 80) return 'high'
  if (score >= 55) return 'mid'
  return 'low'
}

export default function QuickScan({ embedded = false }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [mode, setMode] = useState('photo')
  const [barcode, setBarcode] = useState('')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [stage, setStage] = useState('')
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(null)

  const samples = useMemo(
    () =>
      products.slice(0, 6).map((p) => ({
        id: p.id,
        name: p.name,
        brand: p.brand,
        score: p.trust_score,
        image: p.image.replace('w=200', 'w=400'),
        barcode: p.barcode,
      })),
    [],
  )

  const knownHints = useMemo(
    () =>
      listKnownBarcodes()
        .slice(0, 4)
        .map((p) => ({ id: p.id, barcode: p.barcode, name: p.name })),
    [],
  )

  const runPhotoScan = async (file) => {
    if (!file) return
    setError('')
    setLoading(true)
    try {
      const url = URL.createObjectURL(file)
      setPreview(url)
      const classification = await classifyProductImage(file, setStage)
      const eco = await analyzeEcoRating(classification, setStage)
      setStage('Matching against EcoVerify product database…')
      await new Promise((r) => setTimeout(r, 400))
      let match = null
      const detectedId =
        classification?.detected_product_id || classification?.candidates?.[0]?.product_id
      if (detectedId) {
        match = await fetchProductById(String(detectedId))
      }
      if (!match && classification?.product?.id) {
        match = classification.product
      }
      if (!match) {
        match = matchProductFromAI(classification, eco)
      }
      setStage('Saving to your scan history…')
      goToProduct(navigate, match, {
        source: 'photo',
        trustScore: eco?.trust_score ?? match.trust_score,
      })
    } catch (e) {
      setError(e.message || 'Photo scan failed. Try again.')
    } finally {
      setLoading(false)
      setStage('')
    }
  }

  const runBarcodeScan = async (e) => {
    e.preventDefault()
    setError('')
    if (!barcode.trim()) {
      setError('Enter a barcode to continue.')
      return
    }
    setLoading(true)
    try {
      setStage('Looking up barcode in EcoVerify database…')
      const isShortId = /^\d{1,2}$/.test(barcode.trim())

      if (!isShortId) {
        const validation = await validateBarcode(barcode, setStage)
        if (!validation.valid) {
          setError(`Invalid barcode format (${validation.format}). Confidence: ${validation.confidence}%`)
          return
        }
      }

      const { product, source, clean } = await resolveBarcode(barcode.trim())
      if (!product) {
        const sampleCodes = knownHints.map((p) => p.barcode).join(', ')
        setError(
          `No product found for barcode ${clean}. Try a catalog code (e.g. ${sampleCodes}) or IDs 1–12.`,
        )
        return
      }

      if (user && !isShortId) {
        createBarcodeHistory({
          user_email: user.email,
          barcode: clean,
          barcode_format: 'EAN/UPC',
          product_id: product.id,
          product_name: product.name,
          trust_score: product.trust_score,
          validation_confidence: source === 'api' ? 100 : 80,
        })
      }

      setStage(source === 'api' ? 'Matched in live database…' : 'Matched locally…')
      goToProduct(navigate, product, { source: 'barcode' })
    } catch (err) {
      setError(err.message || 'Barcode scan failed.')
    } finally {
      setLoading(false)
      setStage('')
    }
  }

  const runSearch = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      setStage('Searching product catalog…')
      const results = await resolveSearch(query)
      if (!results.length) {
        setError('No products matched your search. Try “bamboo”, “bottle”, a barcode, or an ID 1–12.')
        return
      }
      goToProduct(navigate, results[0], { source: 'search' })
    } catch (err) {
      setError(err.message || 'Search failed.')
    } finally {
      setLoading(false)
      setStage('')
    }
  }

  const openSample = (sample) => {
    setError('')
    setBarcode(sample.barcode || sample.id)
    setMode('barcode')
    goToProduct(navigate, products.find((p) => p.id === sample.id) || sample, { source: 'sample' })
  }

  const body = (
    <div className="qs">
      <div className="qs-tabs" role="tablist" aria-label="Scan method">
        {MODES.map((m) => {
          const Icon = m.icon
          const on = mode === m.id
          return (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={on}
              className={`qs-tab ${on ? 'is-on' : ''}`}
              onClick={() => {
                setMode(m.id)
                setError('')
              }}
              disabled={loading}
            >
              <Icon className="qs-tab-icon" aria-hidden />
              <span className="qs-tab-text">
                <strong>{m.label}</strong>
                <small>{m.hint}</small>
              </span>
            </button>
          )
        })}
      </div>

      {loading && (
        <div className="qs-status" role="status">
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
          <div>
            <p>Working…</p>
            <span>{stage || 'Almost there'}</span>
          </div>
        </div>
      )}

      {mode === 'photo' && (
        <div className="qs-panel">
          <label className={`qs-drop ${preview ? 'has-preview' : ''}`}>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="qs-drop-input"
              disabled={loading}
              onChange={(e) => runPhotoScan(e.target.files?.[0])}
            />
            {preview ? (
              <img src={preview} alt="" className="qs-drop-preview" />
            ) : (
              <span className="qs-drop-inner">
                <span className="qs-drop-icon" aria-hidden>
                  <Camera className="h-7 w-7" />
                </span>
                <strong>Drop or tap to upload</strong>
                <em>JPG or PNG · saved to History</em>
              </span>
            )}
          </label>
          <p className="qs-tip">
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            Best results: clear pack front, good light, whole label in frame.
          </p>
        </div>
      )}

      {mode === 'barcode' && (
        <form className="qs-panel" onSubmit={runBarcodeScan}>
          <label className="qs-label" htmlFor="qs-barcode">
            Barcode or catalog ID
          </label>
          <div className="qs-row">
            <div className="qs-field">
              <Barcode className="qs-field-icon" />
              <Input
                id="qs-barcode"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="e.g. 8901234567891 or 2"
                className="qs-input"
                disabled={loading}
                autoComplete="off"
              />
            </div>
            <Button type="submit" className="qs-cta" disabled={loading}>
              Scan
            </Button>
          </div>
          <div className="qs-chips" aria-label="Try a catalog barcode">
            {knownHints.map((h) => (
              <button
                key={h.id}
                type="button"
                className="qs-chip"
                disabled={loading}
                onClick={() => setBarcode(h.barcode)}
              >
                {h.barcode.slice(-6)}
              </button>
            ))}
          </div>
        </form>
      )}

      {mode === 'search' && (
        <form className="qs-panel" onSubmit={runSearch}>
          <label className="qs-label" htmlFor="qs-search">
            Name, brand, or category
          </label>
          <div className="qs-row">
            <div className="qs-field">
              <Search className="qs-field-icon" />
              <Input
                id="qs-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="bamboo, bottle, milk…"
                className="qs-input"
                disabled={loading}
              />
            </div>
            <Button type="submit" variant="secondary" className="qs-cta qs-cta-ghost" disabled={loading}>
              Search
            </Button>
          </div>
          <div className="qs-chips">
            {['bamboo', 'bottle', 'organic', 'tea'].map((q) => (
              <button
                key={q}
                type="button"
                className="qs-chip"
                disabled={loading}
                onClick={() => setQuery(q)}
              >
                {q}
              </button>
            ))}
          </div>
        </form>
      )}

      {error && (
        <p className="qs-error" role="alert">
          {error}
        </p>
      )}

      <div className="qs-rail">
        <div className="qs-rail-head">
          <ShieldCheck className="h-4 w-4" />
          <span>Try a catalog product</span>
        </div>
        <div className="qs-rail-track">
          {samples.map((s) => (
            <button
              key={s.id}
              type="button"
              className="qs-product"
              disabled={loading}
              onClick={() => openSample(s)}
            >
              <img src={s.image} alt="" />
              <span className="qs-product-meta">
                <strong>{s.name}</strong>
                <em>{s.brand}</em>
              </span>
              <span className={`qs-score qs-score--${trustTone(s.score)}`}>{s.score}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  if (embedded) return body

  return (
    <section className="qs-card">
      <header className="qs-card-head">
        <p className="qs-card-kicker">Start here</p>
        <h2>Scan a product</h2>
        <p>Photo, barcode, or search — Trust Score + History in one loop.</p>
      </header>
      {body}
    </section>
  )
}
