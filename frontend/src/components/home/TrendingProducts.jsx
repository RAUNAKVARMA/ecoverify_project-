import { Link } from 'react-router-dom'
import { TrendingUp } from 'lucide-react'
import SectionCard from '@/components/SectionCard'
import ProductTile from '@/components/ProductTile'
import { products } from '@/components/data/productData'

export default function TrendingProducts() {
  const trending = [...products]
    .filter((p) => p.trust_score >= 75)
    .sort((a, b) => b.trust_score - a.trust_score)
    .slice(0, 4)

  return (
    <SectionCard
      icon={TrendingUp}
      title="Trending"
      description="Highest-trust picks right now"
      accentColor="border-amber-400"
    >
      <div className="product-tile-grid">
        {trending.map((p, i) => (
          <ProductTile key={p.id} product={p} badge={i === 0 ? 'Top pick' : undefined} />
        ))}
      </div>
      <p className="mt-3 text-center text-xs text-[#5a6f63]">
        <Link to="/Alternatives" className="font-medium text-emerald-800 underline-offset-2 hover:underline">
          Browse all high-trust alternatives →
        </Link>
      </p>
    </SectionCard>
  )
}
