export default function PageHeader({
  icon: Icon,
  title,
  description,
  badges = [],
  gradient = 'from-emerald-500 to-teal-500',
  action,
}) {
  return (
    <div className="mb-2">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          {Icon && (
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-md shadow-emerald-900/10`}
            >
              <Icon className="h-5 w-5" />
            </div>
          )}
          <div className="min-w-0 flex-1 pt-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-semibold tracking-tight text-[#12261c] sm:text-[1.75rem]">
              {title}
            </h1>
              {badges.map((b) => (
                <span
                  key={b}
                  className="rounded-full border border-emerald-200/80 bg-white/70 px-2.5 py-0.5 text-[11px] font-medium text-emerald-800 backdrop-blur-sm"
                >
                  {b}
                </span>
              ))}
            </div>
            {description && (
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[#5a6f63]">
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
