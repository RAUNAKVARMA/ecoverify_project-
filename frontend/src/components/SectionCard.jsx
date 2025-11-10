import { cn } from '@/lib/utils'

export default function SectionCard({
  icon: Icon,
  title,
  description,
  children,
  accentColor = 'border-emerald-500',
  className,
}) {
  return (
    <div className={cn('bg-white rounded-xl shadow-sm border-l-4', accentColor, className)}>
      <div className="p-4 md:p-5">
        {(Icon || title) && (
          <div className="flex items-start gap-3">
            {Icon && <Icon className="h-5 w-5 text-gray-700 shrink-0 mt-0.5" />}
            <div>
              {title && <h2 className="font-semibold text-gray-900">{title}</h2>}
              {description && <p className="text-sm text-gray-500">{description}</p>}
            </div>
          </div>
        )}
        <div className={cn(Icon || title ? 'mt-3 ml-8' : '')}>{children}</div>
      </div>
    </div>
  )
}
