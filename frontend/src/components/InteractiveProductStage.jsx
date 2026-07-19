import ProductImage from '@/components/ProductImage'
import StaggerText from '@/components/StaggerText'
import TrustScoreCircle from '@/components/TrustScoreCircle'
import { usePointerStage } from '@/hooks/usePointerStage'

const SPARKS = [
  { t: '12%', l: '18%', d: '0s' },
  { t: '28%', l: '72%', d: '0.4s' },
  { t: '62%', l: '22%', d: '0.9s' },
  { t: '74%', l: '68%', d: '1.3s' },
  { t: '44%', l: '48%', d: '1.7s' },
]

/**
 * Interactive product hero — pointer parallax, spotlight, floating sparks, stamp pop.
 */
export default function InteractiveProductStage({ product, score, risk }) {
  const { ref, mediaStyle, floatStyle, spotlightStyle } = usePointerStage(1)

  return (
    <div ref={ref} className="ix-stage">
      <div className="ix-stage-media" style={mediaStyle}>
        <ProductImage
          src={product.image}
          alt={product.name}
          category={product.category}
          className="absolute inset-0 h-full w-full"
          imgClassName="ix-stage-img"
        />
      </div>

      <div className="ix-stage-scrim" aria-hidden />
      <div className="ix-stage-spotlight" style={spotlightStyle} aria-hidden />

      {SPARKS.map((s, i) => (
        <span
          key={i}
          className="ix-spark"
          style={{ top: s.t, left: s.l, animationDelay: s.d, ...floatStyle(0.4 + i * 0.12) }}
          aria-hidden
        />
      ))}

      <div className="ix-stage-copy" style={floatStyle(0.55)}>
        <p className="trust-dossier-eyebrow">Field match · {product.category}</p>
        <StaggerText text={product.name} className="trust-dossier-name ix-title" delay={28} />
        <p className="trust-dossier-brand ix-brand-in">{product.brand}</p>
      </div>

      <div className="ix-stage-orb ix-orb-pop" style={floatStyle(0.9)}>
        <div className="ix-orb-ring" aria-hidden />
        <TrustScoreCircle score={score} size="large" />
      </div>

      <span className={`trust-seal trust-seal--${risk.tone} ix-seal-pop`}>{risk.label}</span>

      <div className="ix-scanline" aria-hidden />
    </div>
  )
}
