import { Link } from 'react-router-dom'
import { TrendingUp } from 'lucide-react'
import SectionCard from '@/components/SectionCard'
import { products, getTrustLabel } from '@/components/data/productData'

export default function TrendingProducts() {
  const trending = [...products]
    .filter((p) => p.trust_score >= 75)
    .sort((a, b) => b.trust_score - a.trust_score)
    .slice(0, 4)

  return (
    <SectionCard icon={TrendingUp} title="Trending" description="Top-rated eco picks" accentColor="border-amber-400">
      <div className="grid grid-cols-2 gap-3">
        {trending.map((p) => {
          const trust = getTrustLabel(p.trust_score)
          return (
            <Link
              key={p.id}
              to={`/ProductDetail?id=${p.id}`}
              className="rounded-xl border border-gray-100 p-2 hover:border-emerald-200 hover:shadow-sm transition-all"
            >
              <img src={p.image} alt={p.name} className="h-24 w-full object-cover rounded-lg mb-2" />
              <p className="text-sm font-medium text-gray-900 line-clamp-2 min-h-[2.5rem]">{p.name}</p>
              <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${trust.bg} ${trust.color}`}>
                {p.trust_score}
              </span>
            </Link>
          )
        })}
      </div>
    </SectionCard>
  )
}
