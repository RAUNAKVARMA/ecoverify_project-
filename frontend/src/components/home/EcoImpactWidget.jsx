import SectionCard from '@/components/SectionCard'
import { Leaf, TrendingUp, Award, Users } from 'lucide-react'

const STATS = [
  { icon: Leaf, label: 'Products scanned', value: '47K', tone: 'text-emerald-800 bg-emerald-50' },
  { icon: TrendingUp, label: 'Greenwashing flagged', value: '2.3K', tone: 'text-sky-800 bg-sky-50' },
  { icon: Award, label: 'Eco champions', value: '890', tone: 'text-amber-800 bg-amber-50' },
  { icon: Users, label: 'Active users', value: '12K+', tone: 'text-teal-800 bg-teal-50' },
]

export default function EcoImpactWidget() {
  return (
    <SectionCard
      icon={Leaf}
      title="Community impact"
      description="Shared progress across EcoVerify"
      accentColor="border-emerald-500"
    >
      <div className="grid grid-cols-2 gap-3">
        {STATS.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className={`rounded-xl p-3 text-center ${s.tone}`}>
              <Icon className="mx-auto h-5 w-5 opacity-80" />
              <div className="mt-1.5 font-display text-xl font-semibold">{s.value}</div>
              <div className="text-xs opacity-80">{s.label}</div>
            </div>
          )
        })}
      </div>
    </SectionCard>
  )
}
