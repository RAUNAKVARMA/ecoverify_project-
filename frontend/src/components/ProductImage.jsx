import { useState } from 'react'

const CATEGORY_TONE = {
  Dairy: ['#d8efe3', '#1f6b4a'],
  'Personal Care': ['#e8f3ea', '#2d6a4f'],
  Beverages: ['#f3e8d8', '#9a3412'],
  Fashion: ['#e7eef8', '#1e3a5f'],
  Food: ['#f7ecd8', '#92400e'],
  Accessories: ['#dff3f0', '#0f766e'],
  Household: ['#ece7f5', '#5b21b6'],
  Stationery: ['#f0ebe3', '#44403c'],
}

/**
 * Resilient product image — never shows a broken icon.
 */
export default function ProductImage({
  src,
  alt = '',
  category = '',
  className = '',
  imgClassName = 'h-full w-full object-cover',
}) {
  const [failed, setFailed] = useState(false)
  const tone = CATEGORY_TONE[category] || ['#e8f0eb', '#1f6b4a']
  const initials = String(alt || '?')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] || '')
    .join('')
    .toUpperCase()

  if (!src || failed) {
    return (
      <div
        className={`product-image-fallback flex items-center justify-center ${className}`}
        style={{
          background: `linear-gradient(145deg, ${tone[0]} 0%, ${tone[1]}22 55%, ${tone[0]} 100%)`,
        }}
        aria-label={alt}
      >
        <span className="font-display text-2xl font-semibold tracking-tight" style={{ color: tone[1] }}>
          {initials}
        </span>
      </div>
    )
  }

  return (
    <div className={`overflow-hidden ${className}`}>
      <img
        src={src}
        alt={alt}
        className={imgClassName}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    </div>
  )
}
