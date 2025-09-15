'use client'

import React from 'react'
import { TemplateProduct } from '@/lib/template-adapters'
import { SizeSelector } from './size-selector'
import { QuantityStepper } from './quantity-stepper'
import { ReassuranceBullets } from './reassurance-bullets'
import { AddToCart } from '../cart/add-to-cart'
import clsx from 'clsx'
import styles from './buy-box.module.css'

interface BuyBoxProps {
  product: TemplateProduct
  selectedVariantId: string
  quantity: number
  onVariantChange: (variantId: string) => void
  onQuantityChange: (quantity: number) => void
  className?: string
  onAddToCartSuccess?: () => void
}

export function BuyBox({
  product,
  selectedVariantId,
  quantity,
  onVariantChange,
  onQuantityChange,
  className,
  onAddToCartSuccess
}: BuyBoxProps) {
  // Get the selected variant for price display
  const selectedVariant = product.variants.find(v => v.id === selectedVariantId) || product.variants[0]
  const formatPrice = (amount?: string) => {
    if (!amount) return '0.00'
    const num = parseFloat(amount)
    if (isNaN(num)) return '0.00'
    return num.toFixed(2)
  }

  return (
    <div className={clsx(styles.container, className)}>
      {/* Product Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>{product.title}</h1>
        {product.vendor && (
          <p className={styles.vendor}>by {product.vendor}</p>
        )}
      </div>

      {/* Price Display - Prominent positioning above purchase controls */}
      {selectedVariant && (
        <div className={styles.priceSection}>
          <div className={styles.price}>
            ${formatPrice(selectedVariant.price.amount)}
          </div>
          {selectedVariant.compareAtPrice && 
           !isNaN(parseFloat(selectedVariant.compareAtPrice.amount)) &&
           !isNaN(parseFloat(selectedVariant.price.amount)) &&
           parseFloat(selectedVariant.compareAtPrice.amount) > 
           parseFloat(selectedVariant.price.amount) && (
            <div className={styles.comparePrice}>
              ${formatPrice(selectedVariant.compareAtPrice.amount)}
            </div>
          )}
        </div>
      )}

      {/* Purchase Controls Section */}
      <div className={styles.purchaseControls}>
        {/* Size Selection */}
        {product.variants.length > 1 && (
          <div className={styles.sizeSection}>
            <SizeSelector
              variants={product.variants}
              selectedVariantId={selectedVariantId}
              onVariantChange={onVariantChange}
              showDimensions={true}
            />
          </div>
        )}

        {/* Quantity + Add to Cart Row */}
        <div className={styles.actionRow}>
          <div className={styles.quantityContainer}>
            <QuantityStepper
              value={quantity}
              min={1}
              max={10}
              onChange={onQuantityChange}
              idSuffix="buybox"
            />
          </div>
          
          <div className={styles.ctaContainer}>
            <AddToCart
              product={product}
              variantId={selectedVariantId}
              quantity={quantity}
              className={styles.addToCartButton}
              onSuccess={onAddToCartSuccess}
            />
          </div>
        </div>
      </div>

      {/* Trust Signals - Positioned directly under CTA */}
      <ReassuranceBullets className={styles.reassurance} />
    </div>
  )
}
