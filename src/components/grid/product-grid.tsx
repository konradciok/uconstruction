import { TemplateProduct } from '@/lib/template-adapters'
import { GridTileImage } from './tile'
import Link from 'next/link'
import clsx from 'clsx'
import styles from './product-grid.module.css'

interface ProductGridProps {
  products: TemplateProduct[]
  loading?: boolean
  error?: string
  hasMore?: boolean
  onLoadMore?: () => void
  onProductSelect?: (product: TemplateProduct) => void
  columns?: {
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  className?: string
}

export function ProductGrid({
  products,
  loading = false,
  error,
  hasMore = false,
  onLoadMore,
  onProductSelect,
  columns = { xs: 1, sm: 2, md: 2, lg: 2, xl: 2 },
  className = ''
}: ProductGridProps) {
  const gridCols = {
    xs: styles[`gridCols${columns.xs || 1}`],
    sm: styles[`smGridCols${columns.sm || 2}`],
    md: styles[`mdGridCols${columns.md || 3}`],
    lg: styles[`lgGridCols${columns.lg || 4}`],
    xl: styles[`xlGridCols${columns.xl || 4}`]
  }

  const gridClasses = clsx(
    styles.grid,
    gridCols.xs,
    gridCols.sm,
    gridCols.md,
    gridCols.lg,
    gridCols.xl,
    className
  )

  if (loading && products.length === 0) {
    return (
      <div className={gridClasses}>
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className={styles.skeleton}>
            <div className={clsx(styles.skeletonImage, styles.aspectSquare)}></div>
            <div className={styles.skeletonText}></div>
            <div className={clsx(styles.skeletonText, styles.skeletonTextShort)}></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>
          <span>⚠️</span>
        </div>
        <h3 className={styles.errorTitle}>
          Error Loading Products
        </h3>
        <p className={styles.errorMessage}>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className={styles.retryButton}
        >
          Try Again
        </button>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.emptyIcon}>
          <span>🔍</span>
        </div>
        <h3 className={styles.emptyTitle}>
          No Products Found
        </h3>
        <p className={styles.emptyMessage}>
          Try adjusting your search or filters to see more results.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className={gridClasses}>
        {products.map((product) => (
          <div key={product.id} className={styles.productItem}>
            <Link
              href={`/product/${product.handle}`}
              className={styles.productLink}
              onClick={() => onProductSelect?.(product)}
            >
              <GridTileImage
                product={product}
                className={styles.aspectSquare}
              />
            </Link>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && !loading && onLoadMore && (
        <div className={styles.loadMoreContainer}>
          <button
            onClick={onLoadMore}
            className={styles.loadMoreButton}
          >
            Load More Products
          </button>
        </div>
      )}

      {/* Loading More State */}
      {loading && products.length > 0 && (
        <div className={styles.loadingMoreContainer}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingMoreText}>Loading more products...</p>
        </div>
      )}
    </div>
  )
}
