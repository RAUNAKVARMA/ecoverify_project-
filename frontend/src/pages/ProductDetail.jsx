import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  FileText,
  Settings,
  RefreshCw,
  Flag,
  Share2,
  ArrowRight,
  Star,
} from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import SectionCard from '@/components/SectionCard'
import Reveal from '@/components/Reveal'
import TrustScoreCircle from '@/components/TrustScoreCircle'
import ScoreBreakdown from '@/components/ScoreBreakdown'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getProductById } from '@/components/data/productData'
import { fetchProductById } from '@/lib/productsApi'
import { ProductSpotlight } from '@/components/ProductTile'
import { generateEcoExplain } from '@/lib/ai'
import { useAuth } from '@/context/AuthContext'
import { isProductSaved, toggleSavedForProduct } from '@/lib/scanHistory'

const PRIORITIES = ['Plastic Reduction', 'Climate', 'Fair Trade', 'Animal Welfare']

function adjustScore(base, sensitivity) {
  if (sensitivity === 'strict') return Math.max(0, base - 10)
  if (sensitivity === 'lenient') return Math.min(100, base + 10)
  return base
}

export default function ProductDetail() {
  const [params] = useSearchParams()
  const { prefs, updatePrefs } = useAuth()
  const productId = params.get('id') || '1'
  const [product, setProduct] = useState(() => getProductById(productId))
  const [loadingProduct, setLoadingProduct] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [explainKey, setExplainKey] = useState(0)
  const [saved, setSaved] = useState(() => {
    const initial = getProductById(productId)
    return initial ? isProductSaved(initial.id) : false
  })
  const [toast, setToast] = useState('')

  useEffect(() => {
    let alive = true
    setLoadingProduct(true)
    fetchProductById(productId).then((p) => {
      if (!alive) return
      setProduct(p)
      setLoadingProduct(false)
    })
    return () => {
      alive = false
    }
  }, [productId])

  const adjusted = adjustScore(product?.trust_score || 0, prefs.sensitivity)
  const explanation = useMemo(
    () => generateEcoExplain(product, adjusted, prefs),
    [product, adjusted, prefs, explainKey]
  )

  const flash = (msg) => {
    setToast(msg)
    window.setTimeout(() => setToast(''), 2200)
  }

  useEffect(() => {
    if (product) setSaved(isProductSaved(product.id))
  }, [product])

  if (loadingProduct && !product) {
    return (
      <div className="space-y-4">
        <PageHeader icon={FileText} title="Product detail" sticker="loading" />
        <p className="text-sm text-gray-600">Loading product from database…</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="space-y-4">
        <PageHeader icon={FileText} title="Product detail" sticker="hmm..." />
        <p className="text-sm text-gray-600">Product not found. Try scanning again from Home.</p>
      </div>
    )
  }

  const sensitivityBadge =
    prefs.sensitivity === 'strict' ? 'Strict' : prefs.sensitivity === 'lenient' ? 'Lenient' : 'Balanced'

  const riskBox =
    product.greenwashing_risk === 'high'
      ? { cls: 'bg-red-50/90 border-red-200 text-red-800', text: 'High greenwashing risk — some claims could not be verified' }
      : product.greenwashing_risk === 'medium'
        ? { cls: 'bg-amber-50/90 border-amber-200 text-amber-900', text: 'Medium greenwashing risk — some certifications are pending verification' }
        : { cls: 'bg-emerald-50/90 border-emerald-200 text-emerald-900', text: 'Low greenwashing risk — claims are well-documented and verified' }

  const share = async () => {
    const text = `Check out ${product.name}'s sustainability score: ${Math.round(adjusted)}/100 on EcoVerify!`
    if (navigator.share) {
      try {
        await navigator.share({ title: 'EcoVerify', text, url: window.location.href })
        return
      } catch {
        /* fall through */
      }
    }
    await navigator.clipboard.writeText(text)
    flash('Share text copied')
  }

  const onToggleSave = () => {
    const next = toggleSavedForProduct(product.id)
    setSaved(Boolean(next?.saved))
    flash(next?.saved ? 'Saved to History' : 'Removed from saved')
  }

  const togglePriority = (p) => {
    const set = new Set(prefs.priorities || [])
    if (set.has(p)) set.delete(p)
    else set.add(p)
    updatePrefs({ priorities: [...set] })
  }

  return (
    <div className="space-y-4">
      {toast && (
        <div
          className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full border border-[var(--color-border-warm)] bg-white/95 px-4 py-2 text-sm font-medium text-[var(--color-ink)] shadow-lg"
          role="status"
        >
          {toast}
        </div>
      )}
      <PageHeader
        icon={FileText}
        title="Product detail"
        sticker="trace it."
        badges={[sensitivityBadge]}
        description="Sustainability analysis with adjustable scoring sensitivity."
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onToggleSave}>
              <Star className={`h-4 w-4 ${saved ? 'fill-amber-500 text-amber-500' : ''}`} />
              {saved ? 'Saved' : 'Save'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowSettings((v) => !v)}>
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </div>
        }
      />

      {showSettings && (
        <Reveal>
          <SectionCard icon={Settings} title="Context-Sensitive Settings" accentColor="border-amber-400">
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Scoring Sensitivity</Label>
                <Select value={prefs.sensitivity} onValueChange={(v) => updatePrefs({ sensitivity: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strict">Strict (−10 to scores)</SelectItem>
                    <SelectItem value="balanced">Balanced (default)</SelectItem>
                    <SelectItem value="lenient">Lenient (+10 to scores)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-2 block">Priority Concerns</Label>
                <div className="flex flex-wrap gap-2">
                  {PRIORITIES.map((p) => {
                    const active = (prefs.priorities || []).includes(p)
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => togglePriority(p)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                          active
                            ? 'border-amber-300 bg-amber-100 text-amber-900'
                            : 'border-gray-200 bg-white text-gray-600'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </SectionCard>
        </Reveal>
      )}

      <Reveal delay={40}>
        <ProductSpotlight
          product={product}
          adjustedScore={adjusted}
          riskLabel={
            product.greenwashing_risk === 'high'
              ? 'High greenwash risk'
              : product.greenwashing_risk === 'medium'
                ? 'Medium greenwash risk'
                : 'Low greenwash risk'
          }
          scoreNode={<TrustScoreCircle score={adjusted} size="large" />}
          actions={
            <>
              <Button asChild className="spotlight-cta">
                <Link to={`/Alternatives?id=${product.id}`}>
                  Better picks <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" onClick={onToggleSave}>
                <Star className={`h-4 w-4 ${saved ? 'fill-amber-500 text-amber-500' : ''}`} />
                {saved ? 'Saved' : 'Save'}
              </Button>
            </>
          }
        />
      </Reveal>

      <Reveal delay={80}>
        <SectionCard icon={FileText} title="Trust Score Overview" description="EcoExplain" accentColor="border-emerald-500">
          <p className="text-sm leading-relaxed text-gray-700">{explanation}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setExplainKey((k) => k + 1)}>
              <RefreshCw className="h-4 w-4" />
              Regenerate
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
              <Settings className="h-4 w-4" />
              Adjust Settings
            </Button>
          </div>
        </SectionCard>
      </Reveal>

      <Reveal delay={120}>
        <ScoreBreakdown breakdown={product.breakdown} />
      </Reveal>

      <Reveal delay={140}>
        <SectionCard title="Claims Analysis" accentColor="border-amber-400">
          <div className={`rounded-lg border p-3 text-sm ${riskBox.cls}`}>{riskBox.text}</div>
        </SectionCard>
      </Reveal>

      <Reveal delay={160}>
        <SectionCard title="Similar Products Comparison" accentColor="border-sky-400">
          <Button asChild>
            <Link to={`/Alternatives?id=${product.id}`}>
              View Better Alternatives <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </SectionCard>
      </Reveal>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Reveal delay={180}>
          <SectionCard icon={Flag} title="Report Issue" accentColor="border-red-400">
            <Button variant="destructive" onClick={() => flash('Thanks — report received')}>
              Report Incorrect Data
            </Button>
          </SectionCard>
        </Reveal>
        <Reveal delay={200}>
          <SectionCard icon={Share2} title="Share Result" accentColor="border-emerald-500">
            <Button variant="secondary" onClick={share}>
              <Share2 className="h-4 w-4" />
              Share Result
            </Button>
          </SectionCard>
        </Reveal>
      </div>
    </div>
  )
}
