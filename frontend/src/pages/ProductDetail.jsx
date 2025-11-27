import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  FileText,
  Settings,
  RefreshCw,
  Flag,
  Share2,
  ArrowRight,
} from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import SectionCard from '@/components/SectionCard'
import TrustScoreCircle from '@/components/TrustScoreCircle'
import ScoreBreakdown from '@/components/ScoreBreakdown'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getProductById } from '@/components/data/productData'
import { generateEcoExplain } from '@/lib/ai'
import { useAuth } from '@/context/AuthContext'

const PRIORITIES = ['Plastic Reduction', 'Climate', 'Fair Trade', 'Animal Welfare']

function adjustScore(base, sensitivity) {
  if (sensitivity === 'strict') return Math.max(0, base - 10)
  if (sensitivity === 'lenient') return Math.min(100, base + 10)
  return base
}

export default function ProductDetail() {
  const [params] = useSearchParams()
  const { prefs, updatePrefs } = useAuth()
  const product = getProductById(params.get('id') || '1')
  const [showSettings, setShowSettings] = useState(false)
  const [explainKey, setExplainKey] = useState(0)

  const adjusted = adjustScore(product?.trust_score || 0, prefs.sensitivity)
  const explanation = useMemo(
    () => generateEcoExplain(product, adjusted, prefs),
    [product, adjusted, prefs, explainKey]
  )

  if (!product) {
    return (
      <div className="space-y-4">
        <PageHeader icon={FileText} title="Product detail" gradient="from-amber-400 to-amber-500" />
        <p className="text-sm text-gray-600">Product not found. Try scanning again from Home.</p>
      </div>
    )
  }

  const sensitivityBadge =
    prefs.sensitivity === 'strict' ? 'Strict' : prefs.sensitivity === 'lenient' ? 'Lenient' : 'Balanced'

  const riskBox =
    product.greenwashing_risk === 'high'
      ? { cls: 'bg-red-50 border-red-200 text-red-800', text: '⚠️ High greenwashing risk detected — Some claims could not be verified' }
      : product.greenwashing_risk === 'medium'
        ? { cls: 'bg-yellow-50 border-yellow-200 text-yellow-800', text: '⚡ Medium greenwashing risk — Some certifications are pending verification' }
        : { cls: 'bg-green-50 border-green-200 text-green-800', text: '✓ Low greenwashing risk — Claims are well-documented and verified' }

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
    alert('Share text copied to clipboard!')
  }

  const togglePriority = (p) => {
    const set = new Set(prefs.priorities || [])
    if (set.has(p)) set.delete(p)
    else set.add(p)
    updatePrefs({ priorities: [...set] })
  }

  return (
    <div className="space-y-4">
      <PageHeader
        icon={FileText}
        title="Product detail"
        badges={[sensitivityBadge]}
        description="Sustainability analysis with adjustable scoring sensitivity."
        gradient="from-amber-400 to-amber-500"
        action={
          <Button variant="outline" size="sm" onClick={() => setShowSettings((v) => !v)}>
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        }
      />

      {showSettings && (
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
                      className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
                        active ? 'bg-amber-100 border-amber-300 text-amber-900' : 'bg-white border-gray-200 text-gray-600'
                      }`}
                    >
                      {p}
                    </button>
                  )
                })}
              </div>
            </div>
            <p className="text-xs text-gray-500">Changes immediately update the Trust Score explanation</p>
          </div>
        </SectionCard>
      )}

      <SectionCard accentColor="border-amber-400">
        <div className="flex flex-col sm:flex-row gap-4 items-start -ml-0">
          <img src={product.image} alt={product.name} className="w-32 h-32 rounded-xl object-cover" />
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
            <p className="text-sm text-gray-600">{product.brand}</p>
            <Badge className="mt-2" variant="secondary">{product.category}</Badge>
            <p className="mt-2 text-sm text-gray-700">₹{product.price}</p>
          </div>
          <TrustScoreCircle score={adjusted} size="large" />
        </div>
      </SectionCard>

      <SectionCard icon={FileText} title="Trust Score Overview" description="EcoExplain" accentColor="border-emerald-500">
        <p className="text-sm text-gray-700 leading-relaxed">{explanation}</p>
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

      <ScoreBreakdown breakdown={product.breakdown} />

      <SectionCard title="Claims Analysis" accentColor="border-indigo-400">
        <div className={`rounded-lg border p-3 text-sm ${riskBox.cls}`}>{riskBox.text}</div>
      </SectionCard>

      <SectionCard title="Similar Products Comparison" accentColor="border-sky-400">
        <Button asChild>
          <Link to={`/Alternatives?id=${product.id}`}>
            View Better Alternatives <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </SectionCard>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SectionCard icon={Flag} title="Report Issue" accentColor="border-red-400">
          <Button variant="destructive" onClick={() => alert('Report submitted. Thank you!')}>
            Report Incorrect Data
          </Button>
        </SectionCard>
        <SectionCard icon={Share2} title="Share Result" accentColor="border-indigo-400">
          <Button variant="secondary" onClick={share}>
            <Share2 className="h-4 w-4" />
            Share Result
          </Button>
        </SectionCard>
      </div>
    </div>
  )
}
