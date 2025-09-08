import { TemplateProduct } from '@/lib/template-adapters'
import { AddToCart } from '@/components/cart/add-to-cart'
import styles from './price-and-cta.module.css'

interface PriceAndCtaProps {
  product: TemplateProduct
  selectedVariantId?: string
  quantity?: number
}

export function PriceAndCta({ 
  product, 
  selectedVariantId, 
  quantity = 1 
}: PriceAndCtaProps) {
  const price = product.priceRange.minVariantPrice.amount
  const compareAtPrice = product.variants?.[0]?.compareAtPrice?.amount || null
  const hasDiscount = compareAtPrice && parseFloat(compareAtPrice) > parseFloat(price)

  return (
    <div className={styles.container}>
      {/* Price Display */}
      <div className={styles.priceDisplay}>
        <span className={styles.price}>
          ${price}
        </span>
        {hasDiscount && (
          <span className={styles.comparePrice}>
            ${compareAtPrice}
          </span>
        )}
        {hasDiscount && (
          <span className={styles.saleBadge}>
            Sale
          </span>
        )}
      </div>
      
      {/* Primary CTA */}
      <div className={styles.ctaContainer}>
        <AddToCart
          product={product}
          variantId={selectedVariantId || product.variants[0]?.id}
          quantity={quantity}
          className={styles.primaryCta}
        />
      </div>
    </div>
  )
}
