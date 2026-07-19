import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Star, MapPin, HelpCircle } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import SectionCard from '@/components/SectionCard'
import Reveal from '@/components/Reveal'
import TrustScoreCircle from '@/components/TrustScoreCircle'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  getProductById,
  getAlternatives,
  products,
  getCategories,
} from '@/components/data/productData'
import ProductTile from '@/components/ProductTile'
import ProductImage from '@/components/ProductImage'

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
        index="03"
        kicker="Swap"
        title="Alternatives"
        sticker="better aisle"
        description="Higher-trust options ranked by sustainability score."
      />

      {original && (
        <Reveal>
          <SectionCard title="Comparing Against" accentColor="border-sky-400">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
              <div className="flex items-center gap-3 rounded-2xl bg-[var(--color-paper-deep)]/70 p-3">
                <ProductImage
                  src={original.image}
                  alt={original.name}
                  category={original.category}
                  className="h-14 w-14 shrink-0 rounded-xl"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-gray-900">{original.name}</p>
                  <p className="text-sm text-gray-500">{original.brand}</p>
                </div>
                <TrustScoreCircle score={original.trust_score} size="small" showLabel={false} />
              </div>
              <p className="text-center font-hand text-2xl text-[var(--color-forest)]">vs</p>
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-3">
                {topAlt ? (
                  <>
                    <ProductImage
                      src={topAlt.image}
                      alt={topAlt.name}
                      category={topAlt.category}
                      className="h-14 w-14 shrink-0 rounded-xl"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-gray-900">{topAlt.name}</p>
                      <p className="text-xs font-medium text-emerald-700">
                        +{topAlt.trust_score - original.trust_score} pts better
                      </p>
                    </div>
                    <TrustScoreCircle score={topAlt.trust_score} size="small" showLabel={false} />
                  </>
                ) : (
                  <p className="text-sm text-gray-500">No stronger pick yet — loosen filters.</p>
                )}
              </div>
            </div>
          </SectionCard>
        </Reveal>
      )}

      <Reveal delay={60}>
      <SectionCard icon={Star} title="Better Alternatives" description="Minimum +15 points when available" accentColor="border-amber-400">
        {list.length === 0 ? (
          <p className="text-sm text-gray-500">No alternatives match your filters.</p>
        ) : (
          <div className="product-tile-grid product-tile-grid--rows">
            {list.map((p) => {
              const diff = original ? p.trust_score - original.trust_score : null
              return (
                <ProductTile
                  key={p.id}
                  product={p}
                  badge={diff != null && diff > 0 ? `+${diff} pts` : undefined}
                />
              )
            })}
          </div>
        )}
      </SectionCard>
      </Reveal>

      <Reveal delay={100}>
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
      </Reveal>

      <Reveal delay={140}>
      <SectionCard icon={MapPin} title="Where to Buy" accentColor="border-red-400">
        <div className="flex flex-wrap gap-2">
          {STORES.map((s) => (
            <span key={s.name} className={`rounded-full px-3 py-1.5 text-xs font-medium ${s.color}`}>
              {s.name}
            </span>
          ))}
        </div>
      </SectionCard>
      </Reveal>

      {topAlt && original && (
        <Reveal delay={180}>
          <SectionCard icon={HelpCircle} title="Why this alternative?" accentColor="border-teal-500">
            <p className="text-sm text-gray-700">
              {topAlt.name} scores {topAlt.trust_score - original.trust_score} points higher because of: better certifications,
              superior packaging, lower greenwashing risk.
            </p>
          </SectionCard>
        </Reveal>
      )}
    </div>
  )
}
