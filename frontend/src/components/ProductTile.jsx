import { Link } from 'react-router-dom'
import { ArrowUpRight, Leaf } from 'lucide-react'
import ProductImage from '@/components/ProductImage'
import { getTrustLabel } from '@/components/data/productData'

/**
 * Immersive product tile for lists / grids.
 */
export default function ProductTile({ product, to, meta, badge, className = '' }) {
  const trust = getTrustLabel(product.trust_score)
  const href = to || `/ProductDetail?id=${product.id}`

  return (
    <Link to={href} className={`product-tile group ${className}`}>
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

/**
 * Full spotlight hero used on Product Detail.
 */
export function ProductSpotlight({
  product,
  adjustedScore,
  scoreNode,
  actions,
  riskLabel,
}) {
  return (
    <article className="product-spotlight">
      <div className="product-spotlight-stage">
        <ProductImage
          src={product.image}
          alt={product.name}
          category={product.category}
          className="absolute inset-0 h-full w-full"
          imgClassName="product-spotlight-img"
        />
        <div className="product-spotlight-grain" aria-hidden />
        <div className="product-spotlight-fade" aria-hidden />
        <div className="product-spotlight-orb" aria-hidden />
        <p className="product-spotlight-kicker">
          <Leaf className="h-3.5 w-3.5" />
          Live catalog match
        </p>
        <div className="product-spotlight-score">{scoreNode}</div>
      </div>

      <div className="product-spotlight-copy">
        <p className="product-spotlight-brand">{product.brand}</p>
        <h2 className="product-spotlight-title">{product.name}</h2>
        <div className="product-spotlight-chips">
          <span className="chip chip-forest">{product.category}</span>
          <span className="chip">₹{product.price}</span>
          {riskLabel ? <span className="chip chip-risk">{riskLabel}</span> : null}
          <span className="chip chip-soft">Score {Math.round(adjustedScore)}</span>
        </div>
        {actions ? <div className="product-spotlight-actions">{actions}</div> : null}
      </div>
    </article>
  )
}
