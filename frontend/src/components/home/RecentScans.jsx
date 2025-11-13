import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { Clock } from 'lucide-react'
import SectionCard from '@/components/SectionCard'
import { mockScanHistory, getProductById, getTrustLabel } from '@/components/data/productData'

export default function RecentScans() {
  const scans = mockScanHistory
    .map((s) => ({ ...s, product: getProductById(s.productId) }))
    .filter((s) => s.product)
    .slice(0, 5)

  return (
    <SectionCard icon={Clock} title="Recent Scans" description="Your last 5 mock scans" accentColor="border-teal-400">
      <ul className="space-y-2">
        {scans.map((s) => {
          const trust = getTrustLabel(s.product.trust_score)
          return (
            <li key={`${s.productId}-${s.timestamp}`}>
              <Link
                to={`/ProductDetail?id=${s.product.id}`}
                className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-50 transition-colors"
              >
                <img src={s.product.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{s.product.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(s.timestamp), { addSuffix: true })}
                  </p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${trust.bg} ${trust.color}`}>
                  {s.product.trust_score}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </SectionCard>
  )
}
