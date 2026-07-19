import { getTrustLabel } from '@/components/data/productData'
import { cn } from '@/lib/utils'
import useReveal from '@/hooks/useReveal'
import { useCountUp } from '@/hooks/useMotion'

const SIZES = {
  large: { box: 'w-32 h-32', text: 'text-4xl' },
  medium: { box: 'w-20 h-20', text: 'text-2xl' },
  small: { box: 'w-12 h-12', text: 'text-sm' },
}

function scoreStroke(score) {
  if (score < 40) return '#c45c4a'
  if (score < 70) return '#c4923a'
  return '#1f6b4a'
}

export default function TrustScoreCircle({ score = 0, size = 'medium', showLabel = true, animate = true }) {
  const safe = Math.max(0, Math.min(100, Number(score) || 0))
  const { ref, visible } = useReveal({ threshold: 0.35 })
  const animated = useCountUp(safe, animate ? visible : true, size === 'large' ? 1200 : 700)
  const display = animate ? animated : safe
  const circumference = 2 * Math.PI * 45
  const offset = circumference - (display / 100) * circumference
  const dims = SIZES[size] || SIZES.medium
  const trust = getTrustLabel(safe)

  return (
    <div ref={ref} className="flex flex-col items-center gap-2">
      <div className={cn('relative', dims.box)}>
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(71,58,45,0.12)" strokeWidth="8" />
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
            style={{ transition: 'stroke-dashoffset 0.15s linear' }}
          />
        </svg>
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center font-display font-bold text-[var(--color-ink)]',
            dims.text
          )}
        >
          {Math.round(display)}
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
