export default function SectionCard({
  title,
  description,
  icon: Icon,
  children,
  className = '',
  accentColor = 'border-[var(--color-forest)]',
  actions,
}) {
  return (
    <section
      className={`imm-tilt overflow-hidden rounded-[1.5rem] border border-[var(--color-border-warm)] bg-white/70 shadow-[0_8px_30px_rgba(71,58,45,0.06)] backdrop-blur-sm ${className}`}
    >
      {(title || description || Icon || actions) && (
        <div className={`border-l-[3px] ${accentColor} px-4 py-3.5 sm:px-5`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              {Icon && (
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-paper-deep)] text-[var(--color-forest)]">
                  <Icon className="h-4 w-4" />
                </div>
              )}
              <div className="min-w-0">
                {title && (
                  <h2 className="font-display text-lg font-semibold tracking-tight text-[var(--color-ink)]">
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="mt-0.5 text-sm text-[var(--color-ink)]/55">{description}</p>
                )}
              </div>
            </div>
            {actions}
          </div>
        </div>
      )}
      <div className="px-4 pb-4 sm:px-5 sm:pb-5">{children}</div>
    </section>
  )
}
