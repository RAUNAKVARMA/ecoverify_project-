import { Link } from 'react-router-dom'
import { Shirt, Coffee, Home, Sparkles, ShoppingBag, Package } from 'lucide-react'
import SectionCard from '@/components/SectionCard'

const CATEGORIES = [
  { name: 'Fashion', icon: Shirt, count: '45+', color: 'bg-purple-50 text-purple-700 border-purple-100' },
  { name: 'Food', icon: Coffee, count: '120+', color: 'bg-green-50 text-green-700 border-green-100' },
  { name: 'Household', icon: Home, count: '80+', color: 'bg-blue-50 text-blue-700 border-blue-100' },
  { name: 'Personal Care', icon: Sparkles, count: '60+', color: 'bg-pink-50 text-pink-700 border-pink-100' },
  { name: 'Accessories', icon: ShoppingBag, count: '35+', color: 'bg-amber-50 text-amber-700 border-amber-100' },
  { name: 'All', icon: Package, count: '340+', color: 'bg-gray-50 text-gray-700 border-gray-200', label: 'All Products' },
]

export default function CategoryShortcuts() {
  return (
    <SectionCard icon={Package} title="Browse by Category" description="Jump into Alternatives with a filter" accentColor="border-blue-400">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {CATEGORIES.map((c) => {
          const Icon = c.icon
          const param = c.name === 'All' ? '' : `?category=${encodeURIComponent(c.name)}`
          return (
            <Link
              key={c.name}
              to={`/Alternatives${param}`}
              className={`flex items-center gap-3 rounded-xl border p-3 ${c.color} hover:opacity-90 transition-opacity`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <div>
                <p className="text-sm font-semibold">{c.label || c.name}</p>
                <p className="text-xs opacity-80">{c.count} products</p>
              </div>
            </Link>
          )
        })}
      </div>
    </SectionCard>
  )
}
