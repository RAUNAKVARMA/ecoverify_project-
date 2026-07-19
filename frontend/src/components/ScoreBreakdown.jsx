import { useState } from 'react'
import useReveal from '@/hooks/useReveal'

const CATEGORIES = [
  {
    key: 'certifications',
    label: 'Certifications',
    mark: '01',
    format: (b) => (Array.isArray(b.certifications) ? b.certifications.join(' · ') : b.certifications),
  },
  {
    key: 'materials',
    label: 'Materials',
    mark: '02',
    format: (b) => b.materials_analysis,
  },
  {
    key: 'supply',
    label: 'Supply chain',
    mark: '03',
    format: (b) => b.supply_chain_transparency,
  },
  {
    key: 'packaging',
    label: 'Packaging',
    mark: '04',
    format: (b) => b.packaging_assessment,
  },
  {
    key: 'carbon',
    label: 'Carbon',
    mark: '05',
    format: (b) => b.carbon_footprint,
  },
]

export default function ScoreBreakdown({ breakdown }) {
  const [flipped, setFlipped] = useState(null)
  const { ref, visible } = useReveal({ threshold: 0.2 })
  if (!breakdown) return null

  return (
    <section ref={ref} className={`dossier-rail ${visible ? 'is-in' : ''}`}>
      <div className="dossier-rail-head">
        <div>
          <p className="dossier-sheet-index">Evidence</p>
          <h2 className="dossier-sheet-title">Score breakdown</h2>
          <p className="dossier-sheet-desc">Tap a card to flip the detail</p>
        </div>
      </div>

      <div className="dossier-rail-track">
        {CATEGORIES.map((cat, i) => {
          const open = flipped === cat.key
          return (
            <button
              key={cat.key}
              type="button"
              className={`dossier-ticket ix-ticket ${open ? 'is-flipped' : ''}`}
              style={{ '--i': i }}
              onClick={() => setFlipped(open ? null : cat.key)}
            >
              <span className="dossier-ticket-face dossier-ticket-front">
                <span className="dossier-ticket-mark">{cat.mark}</span>
                <h3 className="dossier-ticket-label">{cat.label}</h3>
                <p className="dossier-ticket-hint">Tap to open</p>
              </span>
              <span className="dossier-ticket-face dossier-ticket-back">
                <span className="dossier-ticket-mark">{cat.mark}</span>
                <h3 className="dossier-ticket-label">{cat.label}</h3>
                <p className="dossier-ticket-copy">{cat.format(breakdown)}</p>
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
