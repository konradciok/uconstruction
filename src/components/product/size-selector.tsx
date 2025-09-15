'use client'

import { useState } from 'react'
import clsx from 'clsx'
import styles from './size-selector.module.css'

interface ProductVariant {
  id: string
  title: string
  availableForSale: boolean
  price: {
    amount: string
  }
  compareAtPrice?: {
    amount: string
  }
}

interface SizeSelectorProps {
  variants: ProductVariant[]
  selectedVariantId: string
  onVariantChange: (variantId: string) => void
  showDimensions?: boolean
  sizeGuideUrl?: string
}

// Size dimension mapping - this would ideally come from product data
const SIZE_DIMENSIONS: Record<string, { cm: string; inches: string }> = {
  'A4': { cm: '21 × 29.7', inches: '8.3 × 11.7' },
  'A3': { cm: '29.7 × 42', inches: '11.7 × 16.5' },
  'A2': { cm: '42 × 59.4', inches: '16.5 × 23.4' },
  'A1': { cm: '59.4 × 84.1', inches: '23.4 × 33.1' },
  'Small': { cm: '20 × 25', inches: '7.9 × 9.8' },
  'Medium': { cm: '30 × 40', inches: '11.8 × 15.7' },
  'Large': { cm: '50 × 70', inches: '19.7 × 27.6' },
  'XL': { cm: '70 × 100', inches: '27.6 × 39.4' }
}

export function SizeSelector({ 
  variants, 
  selectedVariantId, 
  onVariantChange, 
  showDimensions = true,
  sizeGuideUrl 
}: SizeSelectorProps) {
  const [showSizeGuide, setShowSizeGuide] = useState(false)

  const hasVariants = variants && variants.length > 1

  if (!hasVariants) {
    return null
  }

  const handleVariantChange = (variantId: string) => {
    onVariantChange(variantId)
  }

  const handleSizeGuideClick = () => {
    if (sizeGuideUrl) {
      window.open(sizeGuideUrl, '_blank')
    } else {
      setShowSizeGuide(true)
    }
  }

  const getDimensions = (variantTitle: string) => {
    const normalizedTitle = variantTitle.trim()
    return SIZE_DIMENSIONS[normalizedTitle] || null
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Size</h3>
        <button 
          type="button"
          onClick={handleSizeGuideClick}
          className={styles.sizeGuideLink}
          aria-label="Open size guide"
        >
          Size Guide
        </button>
      </div>

      <div className={styles.sizeList} role="radiogroup" aria-label="Size selection">
        {variants.map((variant) => {
          const isSelected = variant.id === selectedVariantId
          const isAvailable = variant.availableForSale !== false
          const dimensions = showDimensions ? getDimensions(variant.title) : null

          return (
            <button
              key={variant.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => handleVariantChange(variant.id)}
              disabled={!isAvailable}
              className={clsx(styles.sizeButton, {
                [styles.sizeButtonSelected]: isSelected,
                [styles.sizeButtonDisabled]: !isAvailable
              })}
              title={!isAvailable ? 'Out of Stock' : ''}
            >
              <span className={styles.sizeButtonTitle}>{variant.title}</span>
              {dimensions && (
                <span className={styles.sizeButtonDimensions}>
                  {dimensions.cm} cm / {dimensions.inches}&quot;
                </span>
              )}
              {!isAvailable && (
                <span className={styles.outOfStockBadge}>Out of Stock</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Simple Size Guide Modal */}
      {showSizeGuide && (
        <div className={styles.sizeGuideModal} onClick={() => setShowSizeGuide(false)}>
          <div className={styles.sizeGuideContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.sizeGuideHeader}>
              <h4 className={styles.sizeGuideTitle}>Size Guide</h4>
              <button
                type="button"
                onClick={() => setShowSizeGuide(false)}
                className={styles.sizeGuideClose}
                aria-label="Close size guide"
              >
                ×
              </button>
            </div>
            <div className={styles.sizeGuideBody}>
              <table className={styles.sizeTable}>
                <thead>
                  <tr>
                    <th>Size</th>
                    <th>Centimeters</th>
                    <th>Inches</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(SIZE_DIMENSIONS).map(([size, dims]) => (
                    <tr key={size}>
                      <td>{size}</td>
                      <td>{dims.cm} cm</td>
                      <td>{dims.inches}&quot;</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
