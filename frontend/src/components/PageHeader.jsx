import StaggerText from '@/components/StaggerText'

export default function PageHeader({
  title,
  description,
  badges = [],
  action,
  sticker,
  index = '01',
  kicker,
  icon: _Icon,
  gradient: _gradient,
}) {
  return (
    <header className="dossier-header page-enter">
      <div className="dossier-header-top">
        <div className="dossier-header-meta">
          <span className="dossier-index ix-index-pop" aria-hidden>
            {index}
          </span>
          {kicker ? <span className="dossier-kicker">{kicker}</span> : null}
          {sticker ? <span className="dossier-stamp ix-seal-pop">{sticker}</span> : null}
        </div>
        {action ? <div className="dossier-header-actions">{action}</div> : null}
      </div>

      <StaggerText text={title} className="dossier-title" delay={32} />

      {(description || badges.length > 0) && (
        <div className="dossier-header-foot">
          {description ? <p className="dossier-deck ix-fade-late">{description}</p> : null}
          {badges.length > 0 ? (
            <div className="dossier-badges">
              {badges.map((b, i) => (
                <span key={b} className="dossier-badge ix-chip-in" style={{ '--i': i }}>
                  {b}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      )}

      <div className="dossier-rule ix-rule-draw" aria-hidden />
    </header>
  )
}
