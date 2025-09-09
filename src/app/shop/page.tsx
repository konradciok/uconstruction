/**
 * Shop Page - Template Implementation
 * 
 * This page demonstrates the integration of template components
 * with the Prisma database through template adapters.
 */

'use client'

import { useState } from 'react'
import { ThreeItemGrid } from '@/components/grid/three-item'
import { ProductGrid } from '@/components/grid/product-grid'
import { SearchFilters } from '@/components/search/search-filters'
import { useShopProducts, useTemplateCollections, useTemplateTags, useSearchFilters } from '@/hooks/useTemplateProducts'
import { TemplateSearchFilters } from '@/lib/template-adapters'
import Container from '@/components/Container'
import styles from './page.module.css'

export default function ShopPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const { filters, updateFilters, clearFilters, hasActiveFilters } = useSearchFilters()
  const { collections } = useTemplateCollections()
  const { tags } = useTemplateTags()
  const { products, loading, error, hasMore, loadMore } = useShopProducts(currentPage, 20, filters)

  const handleFiltersChange = (newFilters: TemplateSearchFilters) => {
    updateFilters(newFilters)
    setCurrentPage(1) // Reset to first page when filters change
  }

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      loadMore()
    }
  }

  // Show loading state for initial load
  if (loading && products.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>Loading shop...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error && products.length === 0) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <div className={styles.errorIcon}>
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className={styles.errorTitle}>Error Loading Shop</h1>
          <p className={styles.errorMessage}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className={styles.retryButton}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.shopPage}>
      <Container>
        <div className={styles.content}>
          {/* Header */}
          <header className={`${styles.header} animate-fadeInUp`}>
            <h1 className={styles.title}>Shop</h1>
            <p className={styles.subtitle}>
              Discover our collection of watercolor artwork and prints
            </p>
          </header>

          <div className={styles.sections}>
            {/* Featured Products Section */}
            {products.length > 0 && (
              <section className={`${styles.featuredSection} animate-fadeInUp`}>
                <h2 className={styles.sectionTitle}>Featured Products</h2>
                <ThreeItemGrid products={products.slice(0, 3)} />
              </section>
            )}

            {/* Filters and Products Grid */}
            <div className={styles.shopContent}>
              {/* Filters Sidebar */}
              <aside className={`${styles.filtersSection} animate-fadeInUp`}>
                <SearchFilters
                  categories={collections.map(c => ({
                    id: parseInt(c.id),
                    name: c.name,
                    handle: c.handle,
                    productCount: c.productCount
                  }))}
                  tags={tags.map(t => ({
                    id: parseInt(t.id),
                    name: t.name,
                    productCount: t.productCount
                  }))}
                  onFiltersChange={handleFiltersChange}
                />
              </aside>

              {/* Products Grid */}
              <main className={`${styles.productsSection} animate-fadeInUp`}>
                <div className={styles.productsHeader}>
                  <h2 className={styles.productsTitle}>
                    All Products
                    {hasActiveFilters && (
                      <span className={styles.resultsCount}>
                        ({products.length} results)
                      </span>
                    )}
                  </h2>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className={styles.clearFiltersButton}
                    >
                      Clear Filters
                    </button>
                  )}
                </div>

                <ProductGrid
                  products={products}
                  loading={loading}
                  error={error || undefined}
                  hasMore={hasMore}
                  onLoadMore={handleLoadMore}
                  columns={{ xs: 1, sm: 2, md: 2, lg: 3, xl: 3 }}
                />
              </main>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}