import { getTrustLabel } from '@/components/data/productData'
import { cn } from '@/lib/utils'

const SIZES = {
  large: { box: 'w-32 h-32', text: 'text-4xl' },
  medium: { box: 'w-20 h-20', text: 'text-2xl' },
  small: { box: 'w-12 h-12', text: 'text-sm' },
}

function scoreStroke(score) {
  if (score < 40) return '#ef4444'
  if (score < 70) return '#f59e0b'
  return '#22c55e'
}

export default function TrustScoreCircle({ score = 0, size = 'medium', showLabel = true }) {
  const safe = Math.max(0, Math.min(100, Number(score) || 0))
  const circumference = 2 * Math.PI * 45
  const offset = circumference - (safe / 100) * circumference
  const dims = SIZES[size] || SIZES.medium
  const trust = getTrustLabel(safe)

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={cn('relative', dims.box)}>
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={scoreStroke(safe)}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className={cn('absolute inset-0 flex items-center justify-center font-bold text-gray-900', dims.text)}>
          {Math.round(safe)}
        </div>
      </div>
      {showLabel && (
        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', trust.bg, trust.color)}>
          {trust.label} Trust
        </span>
      )}
    </div>
  )
}
