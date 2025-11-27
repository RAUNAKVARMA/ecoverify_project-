import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Barcode, Search, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import SectionCard from '@/components/SectionCard'
import { classifyProductImage, analyzeEcoRating, validateBarcode } from '@/lib/ai'
import {
  searchProducts,
  getProductByBarcode,
  getProductById,
  matchProductFromAI,
} from '@/components/data/productData'
import { useAuth } from '@/context/AuthContext'
import { createBarcodeHistory } from '@/lib/barcodeHistory'

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
      const match = matchProductFromAI(classification, eco)
      navigate(`/ProductDetail?id=${match.id}`)
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
      // Fallback: numeric 1–12 treated as product ID
      if (/^\d{1,2}$/.test(barcode.trim())) {
        const n = Number(barcode.trim())
        if (n >= 1 && n <= 12) {
          const p = getProductById(String(n))
          if (p) {
            navigate(`/ProductDetail?id=${p.id}`)
            return
          }
        }
      }

      const validation = await validateBarcode(barcode, setStage)
      if (!validation.valid) {
        setError(`Invalid barcode format (${validation.format}). Confidence: ${validation.confidence}%`)
        return
      }

      const product = getProductByBarcode(validation.clean_barcode)
      if (!product) {
        setError(`No product found for barcode ${validation.clean_barcode}. Try IDs 1–12 or search by name.`)
        return
      }

      if (user) {
        createBarcodeHistory({
          user_email: user.email,
          barcode: validation.clean_barcode,
          barcode_format: validation.format,
          product_id: product.id,
          product_name: product.name,
          trust_score: product.trust_score,
          validation_confidence: validation.confidence,
        })
      }

      navigate(`/ProductDetail?id=${product.id}`)
    } catch (err) {
      setError(err.message || 'Barcode scan failed.')
    } finally {
      setLoading(false)
      setStage('')
    }
  }

  const runSearch = (e) => {
    e.preventDefault()
    setError('')
    const results = searchProducts(query)
    if (!results.length) {
      setError('No products matched your search.')
      return
    }
    navigate(`/ProductDetail?id=${results[0].id}`)
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
            <span className="text-xs text-[#5a6f63]">JPG or PNG</span>
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
                placeholder="Enter barcode (or try ID 1–12)"
                className="pl-9"
                disabled={loading}
              />
            </div>
            <Button type="submit" disabled={loading}>
              Scan
            </Button>
          </div>
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

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
  )

  if (embedded) return body

  return (
    <SectionCard
      icon={Camera}
      title="Scan a product"
      description="Photo, barcode, or search — get a Trust Score in seconds"
      accentColor="border-emerald-500"
    >
      {body}
    </SectionCard>
  )
}
