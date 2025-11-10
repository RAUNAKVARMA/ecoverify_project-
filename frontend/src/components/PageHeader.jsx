import { cn } from '@/lib/utils'

export default function PageHeader({
  icon: Icon,
  title,
  badges = [],
  description,
  gradient = 'from-emerald-500 to-emerald-600',
  action,
}) {
  return (
    <div className={cn('bg-gradient-to-r rounded-xl p-4 md:p-6 mb-6', gradient)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          {Icon && <Icon className="h-6 w-6 text-white shrink-0" />}
          <h1 className="text-xl md:text-2xl font-bold text-white">{title}</h1>
          {badges.map((badge) => (
            <span key={badge} className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium text-white">
              {badge}
            </span>
          ))}
        </div>
        {action}
      </div>
      {description && <p className="mt-2 text-sm text-white/90 ml-9">{description}</p>}
    </div>
  )
}
