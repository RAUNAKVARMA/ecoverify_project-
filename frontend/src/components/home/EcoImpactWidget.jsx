import SectionCard from '@/components/SectionCard'
import { Leaf } from 'lucide-react'

const STATS = [
  { emoji: '🌿', label: 'Products Scanned', value: '47K', color: 'text-green-700 bg-green-50' },
  { emoji: '📈', label: 'Greenwashing Flagged', value: '2.3K', color: 'text-blue-700 bg-blue-50' },
  { emoji: '🏆', label: 'Eco Champions', value: '890', color: 'text-amber-700 bg-amber-50' },
  { emoji: '👥', label: 'Active Users', value: '12K+', color: 'text-purple-700 bg-purple-50' },
]

export default function EcoImpactWidget() {
  return (
    <SectionCard icon={Leaf} title="Community Eco Impact" description="Live community stats" accentColor="border-emerald-500">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 -ml-8 pl-0 md:pl-0">
        {STATS.map((s) => (
          <div key={s.label} className={`rounded-xl p-3 text-center ${s.color}`}>
            <div className="text-lg">{s.emoji}</div>
            <div className="text-lg font-bold">{s.value}</div>
            <div className="text-xs opacity-80">{s.label}</div>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}
