/**
 * Product Detail Page - Template Implementation
 * 
 * This page demonstrates the integration of template product components
 * with the Prisma database through template adapters.
 */

'use client'

import { useProductByHandle } from '@/hooks/useTemplateProducts'
import { ProductGallery } from '@/components/product/gallery'
import { ProductDescription } from '@/components/product/description'
import { VariantSelector } from '@/components/product/variant-selector'
import { PriceAndCta } from '@/components/product/price-and-cta'
import { CartModal } from '@/components/cart/cart-modal'
import Container from '@/components/Container'
import { useState, useEffect } from 'react'
import styles from './page.module.css'

interface ProductPageProps {
  params: Promise<{
    handle: string
  }>
}

export default function ProductPage({ params }: ProductPageProps) {
  const [handle, setHandle] = useState<string>('')
  
  useEffect(() => {
    params.then(({ handle: resolvedHandle }) => {
      setHandle(resolvedHandle)
    })
  }, [params])
  
  const { product, loading, error } = useProductByHandle(handle)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [selectedVariantId, setSelectedVariantId] = useState<string>('')

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>Loading product...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <div className={styles.errorIcon}>
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className={styles.errorTitle}>Product Not Found</h1>
          <p className={styles.errorMessage}>
            {error || 'The product you are looking for does not exist.'}
          </p>
          <a href="/shop" className={styles.backButton}>
            Back to Shop
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.productPage}>
      <Container>
        <div className={styles.content}>
          {/* Breadcrumb */}
          <nav className={`${styles.breadcrumb} animate-fadeInUp`}>
            <ol className={styles.breadcrumbList}>
              <li className={styles.breadcrumbItem}>
                <a href="/" className={styles.breadcrumbLink}>Home</a>
                <span className={styles.breadcrumbSeparator}>/</span>
              </li>
              <li className={styles.breadcrumbItem}>
                <a href="/shop" className={styles.breadcrumbLink}>Shop</a>
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
                <ProductGallery product={product} />
              </div>

              {/* Product Info */}
              <div className={styles.infoSection}>
                <ProductDescription product={product} />
                
                {/* Price and CTA */}
                <PriceAndCta
                  product={product}
                  selectedVariantId={selectedVariantId || product.variants[0]?.id}
                  quantity={1}
                />
                
                {/* Variant Selector */}
                {product.variants.length > 1 && (
                  <div className={styles.variantSection}>
                    <VariantSelector
                      product={product}
                      onVariantChange={setSelectedVariantId}
                    />
                  </div>
                )}

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
          {product.collections.length > 0 && (
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