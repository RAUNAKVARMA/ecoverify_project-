export default function SectionCard({
  title,
  description,
  children,
  className = '',
  index,
  tone = 'sheet',
  actions,
  icon: _Icon,
  accentColor: _accent,
}) {
  return (
    <section className={`dossier-sheet dossier-sheet--${tone} ${className}`}>
      {(title || description || index || actions) && (
        <div className="dossier-sheet-head">
          <div className="min-w-0 flex-1">
            {index ? <span className="dossier-sheet-index">{index}</span> : null}
            {title ? <h2 className="dossier-sheet-title">{title}</h2> : null}
            {description ? <p className="dossier-sheet-desc">{description}</p> : null}
          </div>
          {actions}
        </div>
      )}
      <div className="dossier-sheet-body">{children}</div>
    </section>
  )
}
