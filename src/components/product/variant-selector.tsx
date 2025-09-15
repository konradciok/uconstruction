'use client'

import { useState } from 'react'
import { TemplateProduct } from '@/lib/template-adapters'
import clsx from 'clsx'
import styles from './variant-selector.module.css'

interface VariantSelectorProps {
  product: TemplateProduct
  onVariantChange?: (variantId: string) => void
}

export function VariantSelector({ product, onVariantChange }: VariantSelectorProps) {
  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants?.[0]?.id || ''
  )

  const variants = product.variants || []
  const hasVariants = variants.length > 1

  if (!hasVariants) {
    return null
  }

  const handleVariantChange = (variantId: string) => {
    setSelectedVariantId(variantId)
    onVariantChange?.(variantId)
  }

  const selectedVariant = variants.find(v => v.id === selectedVariantId) || variants[0]

  return (
    <div className={styles.container}>
      {/* Variant Selection */}
      <div className={styles.variantSection}>
        <h3 className={styles.variantTitle}>
          Select Option
        </h3>
        <div className={styles.variantList}>
          {variants.map((variant) => {
            const isSelected = variant.id === selectedVariantId
            const isAvailable = variant.availableForSale !== false

            return (
              <button
                key={variant.id}
                onClick={() => handleVariantChange(variant.id)}
                disabled={!isAvailable}
                className={clsx(styles.variantButton, {
                  [styles.variantButtonSelected]: isSelected,
                  [styles.variantButtonDisabled]: !isAvailable
                })}
                title={!isAvailable ? 'Out of Stock' : ''}
              >
                {variant.title}
                {!isAvailable && (
                  <span className={styles.outOfStockText}>(Out of Stock)</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected Variant Info */}
      {selectedVariant && (
        <div className={styles.variantInfo}>
          <div className={styles.variantInfoContent}>
            <div className={styles.variantInfoLeft}>
              <h4 className={styles.variantInfoTitle}>
                {selectedVariant.title}
              </h4>
              <p className={styles.variantInfoStatus}>
                {selectedVariant.availableForSale !== false ? 'In Stock' : 'Out of Stock'}
              </p>
            </div>
            <div className={styles.variantInfoRight}>
              <div className={styles.variantPrice}>
                ${selectedVariant.price.amount}
              </div>
              {selectedVariant.compareAtPrice && 
               parseFloat(selectedVariant.compareAtPrice.amount) > 
               parseFloat(selectedVariant.price.amount) && (
                <div className={styles.variantComparePrice}>
                  ${selectedVariant.compareAtPrice.amount}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
