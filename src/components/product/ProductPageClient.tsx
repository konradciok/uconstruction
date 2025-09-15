/**
 * Product Page Client Component
 * 
 * Handles all client-side interactivity for the product page
 */

'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ProductGallery } from './gallery'
import { ProductDescription } from './description'
import { VariantSelector } from './variant-selector'
import { AddToCart } from '../cart/add-to-cart'
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

  // Adapt the product for template components
  const templateProduct = adaptProductForTemplate(product)
  
  // Get the selected variant for price display
  const selectedVariant = templateProduct.variants.find(v => v.id === selectedVariantId) || templateProduct.variants[0]

  return (
    <div className={styles.productPage}>
      <Container>
        <div className={styles.content}>
          {/* Breadcrumb */}
          <nav className={`${styles.breadcrumb} animate-fadeInUp`}>
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
          <div className={`${styles.productSection} animate-fadeInUp`}>
            <div className={styles.productGrid}>
              {/* Product Gallery */}
              <div className={styles.gallerySection}>
                <ProductGallery product={templateProduct} />
              </div>

              {/* Product Info */}
              <div className={styles.infoSection}>
                {/* Buy Box - Title, Price, Variants, CTA */}
                <div className={styles.buyBox}>
                  <h1 className={styles.buyBoxTitle}>{product.title}</h1>
                  {product.vendor && (
                    <p className={styles.buyBoxVendor}>by {product.vendor}</p>
                  )}
                  {selectedVariant && (
                    <div className={styles.buyBoxPrice}>
                      ${selectedVariant.price.amount}
                      {selectedVariant.compareAtPrice && 
                       parseFloat(selectedVariant.compareAtPrice.amount) > 
                       parseFloat(selectedVariant.price.amount) && (
                        <span style={{ 
                          textDecoration: 'line-through', 
                          color: 'var(--color-gray-500)', 
                          marginLeft: 'var(--spacing-sm)',
                          fontSize: 'var(--font-size-lg)'
                        }}>
                          ${selectedVariant.compareAtPrice.amount}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Variant Selector */}
                  {product.variants.length > 1 && (
                    <div className={styles.variantSection}>
                      <VariantSelector
                        product={templateProduct}
                        onVariantChange={setSelectedVariantId}
                      />
                    </div>
                  )}
                  
                  {/* Quantity Selector */}
                  <div className={styles.quantitySection}>
                    <label htmlFor="quantity" className={styles.quantityLabel}>
                      Quantity
                    </label>
                    <select
                      id="quantity"
                      className={styles.quantitySelect}
                    >
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                        <option key={num} value={num}>
                          {num}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Add to Cart Button */}
                  <AddToCart
                    product={templateProduct}
                    variantId={selectedVariantId}
                    quantity={1}
                  />
                </div>
                
                {/* Details - Description, Features, Tags */}
                <article className={styles.details}>
                  <ProductDescription product={templateProduct} />
                </article>
                
                {/* Additional Info */}
                <div className={styles.additionalInfo}>
                  <div className={styles.infoList}>
                    <div className={styles.infoItem}>
                      <svg className={styles.infoIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Free shipping on orders over $50
                    </div>
                    <div className={styles.infoItem}>
                      <svg className={styles.infoIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      30-day return policy
                    </div>
                    <div className={styles.infoItem}>
                      <svg className={styles.infoIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Certificate of authenticity included
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products Section */}
          {product.productCollections && product.productCollections.length > 0 && (
            <section className={`${styles.relatedSection} animate-fadeInUp`}>
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
    </div>
  )
}
