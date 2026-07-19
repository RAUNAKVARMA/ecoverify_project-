import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, RefreshCw, Settings, Share2, Star } from 'lucide-react'
import Reveal from '@/components/Reveal'
import ScoreBreakdown from '@/components/ScoreBreakdown'
import InteractiveProductStage from '@/components/InteractiveProductStage'
import Magnetic from '@/components/Magnetic'
import MagneticLink from '@/components/MagneticLink'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getProductById } from '@/components/data/productData'
import { fetchProductById } from '@/lib/productsApi'
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
    [product, adjusted, prefs, explainKey],
  )

  const flash = (msg) => {
    setToast(msg)
    window.setTimeout(() => setToast(''), 2200)
  }

  useEffect(() => {
    if (product) setSaved(isProductSaved(product.id))
  }, [product])

  if (loadingProduct && !product) {
    return <p className="dossier-deck">Loading product from database…</p>
  }

  if (!product) {
    return (
      <div className="space-y-3">
        <h1 className="dossier-title">Not found</h1>
        <p className="dossier-deck">Try scanning again from Home.</p>
        <Link to="/" className="dossier-text-link">
          ← Back to Home
        </Link>
      </div>
    )
  }

  const risk =
    product.greenwashing_risk === 'high'
      ? { label: 'High greenwash risk', tone: 'danger' }
      : product.greenwashing_risk === 'medium'
        ? { label: 'Medium greenwash risk', tone: 'warm' }
        : { label: 'Low greenwash risk', tone: 'safe' }

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
    <div className="dossier-page">
      {toast && (
        <div className="app-toast is-in" role="status">
          {toast}
        </div>
      )}

      <Reveal>
        <article className="trust-dossier">
          <InteractiveProductStage product={product} score={adjusted} risk={risk} />

          <div className="trust-dossier-panel">
            <div className="trust-meta-row">
              <span className="ix-meta-chip">₹{product.price}</span>
              <span className="ix-meta-chip">Barcode {product.barcode}</span>
              <span className="ix-meta-chip">Sensitivity {prefs.sensitivity}</span>
            </div>

            <div className="trust-actions">
              <Magnetic as="button" type="button" className="trust-action primary" onClick={onToggleSave}>
                <Star className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
                {saved ? 'Saved' : 'Save'}
              </Magnetic>
              <MagneticLink to={`/Alternatives?id=${product.id}`} className="trust-action primary">
                Better picks <ArrowRight className="h-4 w-4" />
              </MagneticLink>
              <Magnetic as="button" type="button" className="trust-action" onClick={() => setShowSettings((v) => !v)}>
                <Settings className="h-4 w-4" />
                Dial in
              </Magnetic>
              <Magnetic as="button" type="button" className="trust-action" onClick={share}>
                <Share2 className="h-4 w-4" />
                Share
              </Magnetic>
            </div>
          </div>
        </article>
      </Reveal>

      {showSettings && (
        <Reveal>
          <section className="dossier-sheet">
            <div className="dossier-sheet-head">
              <div>
                <span className="dossier-sheet-index">Controls</span>
                <h2 className="dossier-sheet-title">Scoring dial</h2>
              </div>
            </div>
            <div className="dossier-sheet-body space-y-4">
              <div>
                <Label className="mb-2 block">Sensitivity</Label>
                <Select value={prefs.sensitivity} onValueChange={(v) => updatePrefs({ sensitivity: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="strict">Strict (−10)</SelectItem>
                    <SelectItem value="balanced">Balanced</SelectItem>
                    <SelectItem value="lenient">Lenient (+10)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-2 block">Priority concerns</Label>
                <div className="flex flex-wrap gap-2">
                  {PRIORITIES.map((p) => {
                    const active = (prefs.priorities || []).includes(p)
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => togglePriority(p)}
                        className={`dossier-chip ${active ? 'is-on' : ''}`}
                      >
                        {p}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </section>
        </Reveal>
      )}

      <Reveal delay={80}>
        <section className="explain-board ix-explain" key={explainKey}>
          <div className="explain-board-mark" aria-hidden>
            “
          </div>
          <div className="explain-board-head">
            <span className="dossier-sheet-index">EcoExplain</span>
            <Magnetic as="button" type="button" className="dossier-text-btn" onClick={() => setExplainKey((k) => k + 1)}>
              <RefreshCw className="h-3.5 w-3.5 ix-spin-on-hover" />
              Rewrite
            </Magnetic>
          </div>
          <p className="explain-board-copy ix-typewriter">{explanation}</p>
        </section>
      </Reveal>

      <Reveal delay={120}>
        <ScoreBreakdown breakdown={product.breakdown} />
      </Reveal>

      <Reveal delay={160}>
        <section className="dossier-cta-band ix-cta-wave">
          <div>
            <p className="dossier-sheet-index">Next move</p>
            <h2 className="dossier-sheet-title">Find a cleaner swap</h2>
            <p className="dossier-sheet-desc">Higher-trust options in the same aisle, ranked for you.</p>
          </div>
          <MagneticLink to={`/Alternatives?id=${product.id}`} className="spotlight-cta ix-cta-btn">
            Open alternatives <ArrowRight className="h-4 w-4" />
          </MagneticLink>
        </section>
      </Reveal>

      <Reveal delay={200}>
        <p className="dossier-footnote">
          See something wrong?{' '}
          <button type="button" className="dossier-text-link" onClick={() => flash('Thanks — report received')}>
            Report this score
          </button>
        </p>
      </Reveal>
    </div>
  )
}
