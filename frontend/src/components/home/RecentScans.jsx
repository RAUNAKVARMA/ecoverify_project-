import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { Clock } from 'lucide-react'
import SectionCard from '@/components/SectionCard'
import ProductImage from '@/components/ProductImage'
import { getProductById, getTrustLabel } from '@/components/data/productData'
import { listScans, loadScans } from '@/lib/scanHistory'

export default function RecentScans() {
  const [scans, setScans] = useState(() =>
    listScans()
      .map((s) => ({
        ...s,
        product: getProductById(s.productId),
        displayScore: s.trustScore ?? getProductById(s.productId)?.trust_score ?? 0,
      }))
      .filter((s) => s.product)
      .slice(0, 5),
  )

  useEffect(() => {
    let alive = true
    loadScans().then((items) => {
      if (!alive) return
      setScans(
        items
          .map((s) => ({
            ...s,
            product: getProductById(s.productId),
            displayScore: s.trustScore ?? getProductById(s.productId)?.trust_score ?? 0,
          }))
          .filter((s) => s.product)
          .slice(0, 5),
      )
    })
    return () => {
      alive = false
    }
  }, [])

  return (
    <SectionCard
      icon={Clock}
      title="Recent Scans"
      description={scans.length ? 'From your scan history' : 'Scan something to fill this list'}
      accentColor="border-teal-400"
    >
      {scans.length ? (
        <ul className="space-y-2">
          {scans.map((s) => {
            const trust = getTrustLabel(s.displayScore)
            return (
              <li key={s.id}>
                <Link
                  to={`/ProductDetail?id=${s.product.id}`}
                  className="immersive-list-item flex items-center gap-3 rounded-lg p-2"
                >
                  <ProductImage
                    src={s.product.image}
                    alt={s.product.name}
                    category={s.product.category}
                    className="h-12 w-12 shrink-0 rounded-lg"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{s.product.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(s.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${trust.bg} ${trust.color}`}>
                    {Math.round(s.displayScore)}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="text-sm text-gray-500">
          No scans yet.{' '}
          <Link to="/" className="font-medium text-emerald-700 underline">
            Start on Home
          </Link>
        </p>
      )}
    </SectionCard>
  )
}
