/**
 * StickyPurchaseBar Component
 * 
 * Mobile sticky bar with essential purchase controls that appears when
 * the main CTA is scrolled out of view. Provides persistent access to
 * purchase functionality on mobile devices.
 */

'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { TemplateProduct } from '@/lib/template-adapters'
import { QuantityStepper } from './quantity-stepper'
import { AddToCart } from '../cart/add-to-cart'
import clsx from 'clsx'
import styles from './sticky-purchase-bar.module.css'

interface StickyPurchaseBarProps {
  product: TemplateProduct
  selectedVariantId: string
  quantity: number
  onQuantityChange: (quantity: number) => void
  isVisible: boolean
  className?: string
  onAddToCartSuccess?: () => void
}

export function StickyPurchaseBar({
  product,
  selectedVariantId,
  quantity,
  onQuantityChange,
  isVisible,
  className,
  onAddToCartSuccess
}: StickyPurchaseBarProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const previousVisibleRef = useRef(isVisible)

  // Get the selected variant for price and image display
  const selectedVariant = product.variants.find(v => v.id === selectedVariantId) || product.variants[0]
  const mainImage = product.media?.[0]
  const formatPrice = (amount?: string) => {
    if (!amount) return '0.00'
    const num = parseFloat(amount)
    if (isNaN(num)) return '0.00'
    return num.toFixed(2)
  }

  // Handle visibility changes with animation
  useEffect(() => {
    if (previousVisibleRef.current !== isVisible) {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 300)
      previousVisibleRef.current = isVisible
      
      // Track sticky bar show/hide for analytics
      if (typeof window !== 'undefined' && 'gtag' in window) {
        const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag
        if (typeof gtag === 'function') {
          gtag('event', 'sticky_purchase_bar', {
            event_category: 'product_page',
            event_label: isVisible ? 'show' : 'hide',
            value: isVisible ? 1 : 0
          })
        }
      }
      
      return () => clearTimeout(timer)
    }
  }, [isVisible])

  if (!isVisible && !isAnimating) {
    return null
  }

  return (
    <div 
      className={clsx(
        styles.stickyBar,
        {
          [styles.stickyBarVisible]: isVisible,
          [styles.stickyBarHidden]: !isVisible
        },
        className
      )}
      role="complementary"
      aria-label="Quick purchase controls"
    >
      <div className={styles.stickyBarContent}>
        {/* Product Image & Info */}
        <div className={styles.productInfo}>
          {mainImage && (
            <div className={styles.productImage}>
              <Image
                src={mainImage.url}
                alt={mainImage.altText || product.title}
                width={48}
                height={48}
                className={styles.productImageImg}
              />
            </div>
          )}
          
          <div className={styles.productDetails}>
            <h3 className={styles.productTitle}>{product.title}</h3>
            {selectedVariant && (
              <div className={styles.productPrice}>
                ${formatPrice(selectedVariant.price.amount)}
                {selectedVariant.compareAtPrice && 
                 !isNaN(parseFloat(selectedVariant.compareAtPrice.amount)) &&
                 !isNaN(parseFloat(selectedVariant.price.amount)) &&
                 parseFloat(selectedVariant.compareAtPrice.amount) > 
                 parseFloat(selectedVariant.price.amount) && (
                  <span className={styles.comparePrice}>
                    ${formatPrice(selectedVariant.compareAtPrice.amount)}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Purchase Controls */}
        <div className={styles.purchaseControls}>
          <div className={styles.quantityContainer}>
            <QuantityStepper
              value={quantity}
              min={1}
              max={10}
              onChange={onQuantityChange}
              idSuffix="stickybar"
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
    </div>
  )
}

export default StickyPurchaseBar
