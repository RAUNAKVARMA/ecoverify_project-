export default function PageHeader({
  icon: Icon,
  title,
  description,
  badges = [],
  gradient = 'from-[var(--color-forest)] to-[var(--color-forest-deep)]',
  action,
  sticker,
}) {
  return (
    <div className="page-enter mb-4">
      {sticker && <p className="page-sticker mb-2">{sticker}</p>}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          {Icon && (
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-[0_10px_24px_rgba(15,61,44,0.18)]`}
            >
              <Icon className="h-5 w-5" />
            </div>
          )}
          <div className="min-w-0 flex-1 pt-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-[1.95rem]">
                {title}
              </h1>
              {badges.map((b) => (
                <span
                  key={b}
                  className="rounded-full border border-[var(--color-border-warm)] bg-white/70 px-2.5 py-0.5 text-[11px] font-medium text-[var(--color-forest-deep)] backdrop-blur-sm"
                >
                  {b}
                </span>
              ))}
            </div>
            {description && (
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[var(--color-ink)]/60">
                {description}
              </p>
            )}
          </div>
        </div>
        {action && <div className="shrink-0 pt-1">{action}</div>}
      </div>
    </div>
  )
}
