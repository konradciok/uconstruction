/**
 * Product Page Client Component
 * 
 * Handles all client-side interactivity for the product page
 */

'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ProductGallery } from './gallery'
import { ProductContent } from './product-content'
import { BuyBox } from './buy-box'
import { StickyPurchaseBar } from './sticky-purchase-bar'
import { CartModal } from '../cart/cart-modal'
import Container from '../Container'
import { adaptProductForTemplate } from '@/lib/template-adapters'
import type { ProductWithRelations } from '@/types/product'
import type { ProductWithSerializedVariants } from '@/lib/template-adapters'
import styles from './ProductPageClient.module.css'

interface ProductPageClientProps {
  product: ProductWithRelations | ProductWithSerializedVariants
}

export default function ProductPageClient({ product }: ProductPageClientProps) {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    product.variants[0]?.id?.toString() || ''
  )
  const [quantity, setQuantity] = useState<number>(1)
  const [isStickyBarVisible, setIsStickyBarVisible] = useState(false)

  // Refs for scroll detection
  const buyBoxRef = useRef<HTMLDivElement>(null)

  // Adapt the product for template components
  const templateProduct = adaptProductForTemplate(product)

  // Scroll detection for sticky bar visibility
  useEffect(() => {
    const handleScroll = () => {
      if (!buyBoxRef.current) return

      const buyBoxRect = buyBoxRef.current.getBoundingClientRect()
      const isInViewport = buyBoxRect.bottom > 0 && buyBoxRect.top < window.innerHeight

      // Show sticky bar when main CTA is not in viewport (mobile only)
      const shouldShowStickyBar = !isInViewport && window.innerWidth < 1024

      // Set unconditionally; React ignores if value is unchanged. Avoids stale closure.
      setIsStickyBarVisible(shouldShowStickyBar)
    }

    // Throttled scroll handler for performance
    let ticking = false
    const throttledScrollHandler = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    // Initial check
    handleScroll()

    // Add scroll listener
    window.addEventListener('scroll', throttledScrollHandler, { passive: true })
    window.addEventListener('resize', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', throttledScrollHandler)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  return (
    <div className={styles.productPage}>
      <Container>
        <div className={styles.content}>
          {/* Breadcrumb */}
          <nav className={`${styles.breadcrumb} animate-fadeInUp`} suppressHydrationWarning>
            <ol className={styles.breadcrumbList}>
              <li className={styles.breadcrumbItem}>
                <Link href="/" className={styles.breadcrumbLink}>Home</Link>
                <span className={styles.breadcrumbSeparator}>/</span>
              </li>
              <li className={styles.breadcrumbItem}>
                <Link href="/shop" className={styles.breadcrumbLink}>Shop</Link>
                <span className={styles.breadcrumbSeparator}>/</span>
              </li>
              <li className={styles.breadcrumbItem}>
                <span className={styles.breadcrumbCurrent}>{product.title}</span>
              </li>
            </ol>
          </nav>

          {/* Product Details */}
          <div className={`${styles.productSection} animate-fadeInUp`} suppressHydrationWarning>
            <div className={styles.productGrid}>
              {/* Product Gallery */}
              <div className={styles.gallerySection}>
                <ProductGallery product={templateProduct} />
              </div>

              {/* Product Info */}
              <div className={styles.infoSection}>
                {/* Optimized Buy Box with new components */}
                <div ref={buyBoxRef}>
                  <BuyBox
                    product={templateProduct}
                    selectedVariantId={selectedVariantId}
                    quantity={quantity}
                    onVariantChange={setSelectedVariantId}
                    onQuantityChange={setQuantity}
                    className={styles.buyBox}
                    onAddToCartSuccess={() => setIsCartOpen(true)}
                  />
                </div>
                
                {/* Details - Accordion Content Structure */}
                <article className={styles.details}>
                  <ProductContent product={templateProduct} />
                </article>
              </div>
            </div>
          </div>

          {/* Related Products Section */}
          {product.productCollections && product.productCollections.length > 0 && (
            <section className={`${styles.relatedSection} animate-fadeInUp`} suppressHydrationWarning>
              <h2 className={styles.relatedTitle}>Related Products</h2>
              <div className={styles.relatedPlaceholder}>
                <p className={styles.relatedPlaceholderText}>
                  Related products will be displayed here
                </p>
                <p className={styles.relatedPlaceholderSubtext}>
                  This feature can be implemented by fetching products from the same collections
                </p>
              </div>
            </section>
          )}
        </div>
      </Container>

      {/* Cart Modal */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />

      {/* Mobile Sticky Purchase Bar */}
      <StickyPurchaseBar
        product={templateProduct}
        selectedVariantId={selectedVariantId}
        quantity={quantity}
        onQuantityChange={setQuantity}
        isVisible={isStickyBarVisible}
        onAddToCartSuccess={() => setIsCartOpen(true)}
      />
    </div>
  )
}
