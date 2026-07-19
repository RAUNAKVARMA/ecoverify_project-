import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import ProductImage from '@/components/ProductImage'
import { getTrustLabel } from '@/components/data/productData'

export default function ProductTile({ product, to, meta, badge, className = '' }) {
  const trust = getTrustLabel(product.trust_score)
  const href = to || `/ProductDetail?id=${product.id}`
  const [tilt, setTilt] = useState({ x: 0, y: 0, on: false })

  const onMove = (e) => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    const r = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    setTilt({ x: (py - 0.5) * -10, y: (px - 0.5) * 12, on: true })
  }

  return (
    <Link
      to={href}
      className={`product-tile group ix-tile ${className}`}
      onPointerMove={onMove}
      onPointerLeave={() => setTilt({ x: 0, y: 0, on: false })}
      style={{
        transform: tilt.on
          ? `perspective(700px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-4px)`
          : undefined,
      }}
    >
      <div className="product-tile-media">
        <ProductImage
          src={product.image}
          alt={product.name}
          category={product.category}
          className="absolute inset-0 h-full w-full"
          imgClassName="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        <div className="product-tile-veil" />
        <span className={`product-tile-score ${trust.bg} ${trust.color}`}>{Math.round(product.trust_score)}</span>
        {badge ? <span className="product-tile-badge">{badge}</span> : null}
      </div>
      <div className="product-tile-body">
        <div className="min-w-0 flex-1">
          <p className="product-tile-name">{product.name}</p>
          <p className="product-tile-meta">
            {meta || (
              <>
                {product.brand}
                <span aria-hidden> · </span>₹{product.price}
              </>
            )}
          </p>
        </div>
        <span className="product-tile-go" aria-hidden>
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  )
}
