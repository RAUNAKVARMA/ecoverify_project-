import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Barcode, Search, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import SectionCard from '@/components/SectionCard'
import { classifyProductImage, analyzeEcoRating, validateBarcode } from '@/lib/ai'
import { matchProductFromAI } from '@/components/data/productData'
import { useAuth } from '@/context/AuthContext'
import { createBarcodeHistory } from '@/lib/barcodeHistory'
import { recordScan } from '@/lib/scanHistory'
import {
  resolveBarcode,
  resolveSearch,
  fetchProductById,
  listKnownBarcodes,
} from '@/lib/productsApi'

function goToProduct(navigate, product, extra = {}) {
  recordScan({
    productId: product.id,
    source: extra.source || 'manual',
    trustScore: extra.trustScore ?? product.trust_score,
  })
  navigate(`/ProductDetail?id=${product.id}`)
}

export default function QuickScan({ embedded = false }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [barcode, setBarcode] = useState('')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [stage, setStage] = useState('')
  const [error, setError] = useState('')

  const runPhotoScan = async (file) => {
    if (!file) return
    setError('')
    setLoading(true)
    try {
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
        const samples = listKnownBarcodes()
          .slice(0, 3)
          .map((p) => p.barcode)
          .join(', ')
        setError(
          `No product found for barcode ${clean}. Try a catalog code (e.g. ${samples}) or IDs 1–12.`,
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

  const body = (
    <div className="space-y-5">
      {loading && (
        <div className="flex items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-800">
          <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin" />
          <div>
            <p className="font-medium">Scanning…</p>
            <p className="text-emerald-700">{stage || 'Working…'}</p>
          </div>
        </div>
      )}

      <div>
        <p className="mb-2 text-sm font-medium text-[#12261c]">Photo</p>
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-emerald-300/80 bg-emerald-50/40 px-4 py-10 transition-colors hover:bg-emerald-50">
          <Camera className="h-8 w-8 text-emerald-600" />
          <span className="text-sm font-semibold text-emerald-900">Upload a product photo</span>
          <span className="text-xs text-[#5a6f63]">JPG or PNG — saved to History automatically</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={loading}
            onChange={(e) => runPhotoScan(e.target.files?.[0])}
          />
        </label>
      </div>

      <form onSubmit={runBarcodeScan} className="space-y-2">
        <p className="text-sm font-medium text-[#12261c]">Barcode</p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Barcode className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="e.g. 8901234567895 or ID 1–12"
              className="pl-9"
              disabled={loading}
            />
          </div>
          <Button type="submit" disabled={loading}>
            Scan
          </Button>
        </div>
        <p className="text-xs text-[#5a6f63]">
          Looks up all catalog barcodes in the live database (Neon via Render API).
        </p>
      </form>

      <form onSubmit={runSearch} className="space-y-2">
        <p className="text-sm font-medium text-[#12261c]">Search</p>
        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name, brand, or category"
            disabled={loading}
          />
          <Button type="submit" variant="secondary" disabled={loading}>
            <Search className="h-4 w-4" />
            Search
          </Button>
        </div>
      </form>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  )

  if (embedded) return body

  return (
    <SectionCard
      icon={Camera}
      title="Scan a product"
      description="Photo, barcode, or search — Trust Score + History in one loop"
      accentColor="border-emerald-500"
    >
      {body}
    </SectionCard>
  )
}
