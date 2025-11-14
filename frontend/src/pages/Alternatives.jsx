import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Star, ChevronRight, MapPin, HelpCircle } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import SectionCard from '@/components/SectionCard'
import TrustScoreCircle from '@/components/TrustScoreCircle'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  getProductById,
  getAlternatives,
  products,
  getCategories,
  getTrustLabel,
} from '@/components/data/productData'

const STORES = [
  { name: 'BigBasket', color: 'bg-green-100 text-green-800' },
  { name: "Nature's Basket", color: 'bg-emerald-100 text-emerald-800' },
  { name: 'Blinkit', color: 'bg-yellow-100 text-yellow-800' },
  { name: 'Amazon', color: 'bg-orange-100 text-orange-800' },
]

export default function Alternatives() {
  const [params] = useSearchParams()
  const id = params.get('id')
  const categoryParam = params.get('category')
  const original = id ? getProductById(id) : null

  const [priceMax, setPriceMax] = useState(1000)
  const [availability, setAvailability] = useState('all')
  const [category, setCategory] = useState(categoryParam || 'all')

  const list = useMemo(() => {
    let items
    if (original) {
      items = getAlternatives(original.id).filter((p) => p.trust_score >= original.trust_score + 15)
      if (!items.length) {
        items = getAlternatives(original.id)
      }
    } else {
      items = products.filter((p) => p.trust_score >= 70).sort((a, b) => b.trust_score - a.trust_score).slice(0, 6)
    }

    return items.filter((p) => {
      if (p.price > priceMax && priceMax < 1000) return false
      if (category !== 'all' && p.category !== category) return false
      if (availability === 'nearby' && Number(p.id) % 2 === 0) return false
      return true
    })
  }, [original, priceMax, category, availability])

  const topAlt = list[0]

  return (
    <div className="space-y-4">
      <PageHeader
        icon={Star}
        title="ALTERNATIVES"
        badges={['Better Picks']}
        description="Higher-trust alternatives ranked by sustainability score."
        gradient="from-sky-400 to-sky-500"
      />

      {original && (
        <SectionCard title="Comparing Against" accentColor="border-sky-400">
          <div className="flex items-center gap-3">
            <img src={original.image} alt="" className="h-14 w-14 rounded-lg object-cover" />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{original.name}</p>
              <p className="text-sm text-gray-500">{original.brand}</p>
            </div>
            <Badge className={getTrustLabel(original.trust_score).bg + ' ' + getTrustLabel(original.trust_score).color}>
              {original.trust_score}
            </Badge>
          </div>
        </SectionCard>
      )}

      <SectionCard icon={Star} title="Better Alternatives" description="Minimum +15 points when available" accentColor="border-amber-400">
        {list.length === 0 ? (
          <p className="text-sm text-gray-500">No alternatives match your filters.</p>
        ) : (
          <ul className="space-y-2">
            {list.map((p) => {
              const diff = original ? p.trust_score - original.trust_score : null
              return (
                <li key={p.id}>
                  <Link
                    to={`/ProductDetail?id=${p.id}`}
                    className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-50 transition-colors"
                  >
                    <img src={p.image} alt="" className="h-14 w-14 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{p.name}</p>
                      <p className="text-sm text-gray-500">
                        {p.brand} · ₹{p.price}
                      </p>
                      {diff != null && <p className="text-xs font-medium text-green-600">+{diff} points better</p>}
                    </div>
                    <TrustScoreCircle score={p.trust_score} size="small" showLabel={false} />
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </SectionCard>

      <SectionCard title="Filters" accentColor="border-gray-300">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <Label>Price range</Label>
              <span className="text-gray-500">₹0 – ₹{priceMax >= 1000 ? '1000+' : priceMax}</span>
            </div>
            <Slider value={[priceMax]} min={0} max={1000} step={50} onValueChange={(v) => setPriceMax(v[0])} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="mb-2 block">Availability</Label>
              <Select value={availability} onValueChange={setAvailability}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="stock">In Stock</SelectItem>
                  <SelectItem value="nearby">Nearby Stores</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-2 block">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {getCategories().map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard icon={MapPin} title="Where to Buy" accentColor="border-red-400">
        <div className="flex flex-wrap gap-2">
          {STORES.map((s) => (
            <span key={s.name} className={`rounded-full px-3 py-1.5 text-xs font-medium ${s.color}`}>
              {s.name}
            </span>
          ))}
        </div>
      </SectionCard>

      {topAlt && original && (
        <SectionCard icon={HelpCircle} title="Why This Alternative?" accentColor="border-purple-400">
          <p className="text-sm text-gray-700">
            {topAlt.name} scores {topAlt.trust_score - original.trust_score} points higher because of: better certifications,
            superior packaging, lower greenwashing risk.
          </p>
        </SectionCard>
      )}
    </div>
  )
}
