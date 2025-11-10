import { useState } from 'react'
import { CheckCircle, Recycle, Link2, Globe, Package, ChevronDown, ChevronUp } from 'lucide-react'
import SectionCard from '@/components/SectionCard'

const CATEGORIES = [
  { key: 'certifications', label: 'Certifications', icon: CheckCircle, color: 'text-green-600', format: (b) => b.certifications.join(', ') },
  { key: 'materials', label: 'Materials Analysis', icon: Recycle, color: 'text-emerald-600', format: (b) => b.materials_analysis },
  { key: 'supply', label: 'Supply Chain Transparency', icon: Link2, color: 'text-blue-600', format: (b) => b.supply_chain_transparency },
  { key: 'carbon', label: 'Carbon Footprint Data', icon: Globe, color: 'text-cyan-600', format: (b) => b.carbon_footprint },
  { key: 'packaging', label: 'Packaging Assessment', icon: Package, color: 'text-purple-600', format: (b) => b.packaging_assessment },
]

export default function ScoreBreakdown({ breakdown }) {
  const [expanded, setExpanded] = useState(false)
  if (!breakdown) return null

  const visible = expanded ? CATEGORIES : CATEGORIES.slice(0, 2)
  const more = CATEGORIES.length - 2

  return (
    <SectionCard icon={CheckCircle} title="Score Breakdown" description="Category-level sustainability analysis" accentColor="border-emerald-500">
      <div className={`overflow-hidden transition-all duration-300 ${expanded ? 'max-h-[800px]' : 'max-h-40'}`}>
        <ul className="space-y-3">
          {visible.map((cat) => {
            const Icon = cat.icon
            return (
              <li key={cat.key} className="flex items-start gap-3">
                <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${cat.color}`} />
                <div>
                  <p className="text-sm font-medium text-gray-900">{cat.label}</p>
                  <p className="text-sm text-gray-600">{cat.format(breakdown)}</p>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700"
      >
        {expanded ? (
          <>
            Show less <ChevronUp className="h-4 w-4" />
          </>
        ) : (
          <>
            + {more} more categories <ChevronDown className="h-4 w-4" />
          </>
        )}
      </button>
    </SectionCard>
  )
}
