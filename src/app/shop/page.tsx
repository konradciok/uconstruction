/**
 * Shop Page - Template Implementation
 * 
 * This page demonstrates the integration of template components
 * with the Prisma database through template adapters.
 */

'use client'

import { useState, useEffect } from 'react'
import { ThreeItemGrid } from '@/components/grid/three-item'
import { ProductGrid } from '@/components/grid/product-grid'
import { SearchFilters } from '@/components/search/search-filters'
// Removed problematic hooks - using direct fetch instead
import { TemplateSearchFilters } from '@/lib/template-adapters'
import Container from '@/components/Container'
import styles from './page.module.css'

export default function ShopPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [products, setProducts] = useState<any[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [collections, setCollections] = useState<any[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [tags, setTags] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  // Fetch products
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/template/products?page=${currentPage}&limit=20`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        setProducts(data.products || [])
        setHasMore(data.hasMore || false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [currentPage])

  // Fetch collections
  useEffect(() => {
    async function fetchCollections() {
      try {
        const response = await fetch('/api/template/collections')
        if (response.ok) {
          const data = await response.json()
          setCollections(data.collections || [])
        }
      } catch (err) {
        console.error('Error fetching collections:', err)
      }
    }

    fetchCollections()
  }, [])

  // Fetch tags
  useEffect(() => {
    async function fetchTags() {
      try {
        const response = await fetch('/api/template/tags')
        if (response.ok) {
          const data = await response.json()
          setTags(data.tags || [])
        }
      } catch (err) {
        console.error('Error fetching tags:', err)
      }
    }

    fetchTags()
  }, [])

  const handleFiltersChange = (newFilters: TemplateSearchFilters) => {
    // For now, just reset to page 1
    setCurrentPage(1)
  }

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      setCurrentPage(prev => prev + 1)
    }
  }

  const clearFilters = () => {
    setCurrentPage(1)
  }

  const hasActiveFilters = false // Simplified for now

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