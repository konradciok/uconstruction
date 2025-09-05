import React, { useMemo, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ProductWithRelations } from '@/types/product';
import ProductCard from '../ProductCard';
import styles from './ProductGrid.module.css';

interface ProductGridProps {
  products: ProductWithRelations[];
  loading?: boolean;
  error?: string;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onProductSelect?: (product: ProductWithRelations) => void;
  columns?: Partial<Record<"xl"|"lg"|"md"|"sm"|"xs", number>>;
  cardSize?: 'small' | 'medium' | 'large';
  showPrice?: boolean;
  showVendor?: boolean;
  showStatus?: boolean;
  className?: string;
}

interface ProductGridSkeletonProps {
  count: number;
  cardSize?: 'small' | 'medium' | 'large';
}

function ProductGridSkeleton({ count, cardSize = 'medium' }: ProductGridSkeletonProps) {
  return (
    <div className={styles.grid}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={`${styles.skeletonCard} ${styles[cardSize]}`}>
          <div className={styles.skeletonImage} />
          <div className={styles.skeletonContent}>
            <div className={styles.skeletonTitle} />
            <div className={styles.skeletonVendor} />
            <div className={styles.skeletonPrice} />
          </div>
        </div>
      ))}
    </div>
  );
}

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

function EmptyState({ 
  title = "No products found",
  message = "We couldn't find any products matching your criteria.",
  actionLabel,
  onAction
}: EmptyStateProps) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>🎨</div>
      <h3 className={styles.emptyTitle}>{title}</h3>
      <p className={styles.emptyMessage}>{message}</p>
      {actionLabel && onAction && (
        <button 
          className={styles.emptyAction}
          onClick={onAction}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

function ErrorState({ 
  message = "Something went wrong while loading products.",
  onRetry
}: ErrorStateProps) {
  return (
    <div className={styles.errorState}>
      <div className={styles.errorIcon}>⚠️</div>
      <h3 className={styles.errorTitle}>Error loading products</h3>
      <p className={styles.errorMessage}>{message}</p>
      {onRetry && (
        <button 
          className={styles.errorAction}
          onClick={onRetry}
        >
          Try Again
        </button>
      )}
    </div>
  );
}

export default function ProductGrid({
  products = [],
  loading = false,
  error,
  hasMore = false,
  onLoadMore,
  onProductSelect,
  columns,
  cardSize = 'medium',
  showPrice = true,
  showVendor = true,
  showStatus = true,
  className,
}: ProductGridProps) {
  // Determine if we should use virtualization (threshold: 50+ products)
  const shouldVirtualize = products.length > 50;

  // Handle product selection
  const handleProductSelect = useCallback((product: ProductWithRelations) => {
    if (onProductSelect) {
      onProductSelect(product);
    }
  }, [onProductSelect]);

  // Handle retry for error state
  const handleRetry = useCallback(() => {
    if (onLoadMore) {
      onLoadMore();
    }
  }, [onLoadMore]);

  // Get responsive column configuration
  const getColumnsConfig = () => {
    const defaultColumns = {
      xs: 1,
      sm: 2,
      md: 3,
      lg: 4,
      xl: 5,
    };
    
    return { ...defaultColumns, ...columns };
  };

  const columnsConfig = useMemo(() => getColumnsConfig(), [columns]);

  // Container ref for virtualization
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Virtualization setup (only when needed)
  const virtualizer = useVirtualizer({
    count: shouldVirtualize ? products.length : 0,
    getScrollElement: () => containerRef.current,
    estimateSize: () => {
      // Estimate item height based on card size
      const heights = { small: 280, medium: 350, large: 420 };
      return heights[cardSize];
    },
    enabled: shouldVirtualize,
  });

  // Grid classes
  const gridClasses = [
    styles.grid,
    styles[cardSize],
    className,
  ].filter(Boolean).join(' ');

  // Error state
  if (error && products.length === 0) {
    return (
      <div className={styles.container}>
        <ErrorState message={error} onRetry={handleRetry} />
      </div>
    );
  }

  // Loading state (initial load)
  if (loading && products.length === 0) {
    return (
      <div className={styles.container}>
        <ProductGridSkeleton count={12} cardSize={cardSize} />
      </div>
    );
  }

  // Empty state
  if (products.length === 0 && !loading) {
    return (
      <div className={styles.container}>
        <EmptyState 
          actionLabel={onLoadMore ? "Refresh" : undefined}
          onAction={handleRetry}
        />
      </div>
    );
  }

  // Virtualized grid (for large datasets)
  if (shouldVirtualize) {
    return (
      <div 
        className={styles.container}
        ref={containerRef}
        style={{ height: '600px', overflow: 'auto' }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const product = products[virtualItem.index];
            return (
              <div
                key={virtualItem.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <div className={gridClasses}>
                  <ProductCard
                    product={product}
                    size={cardSize}
                    showPrice={showPrice}
                    showVendor={showVendor}
                    showStatus={showStatus}
                    onSelect={handleProductSelect}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Regular grid (for smaller datasets)
  return (
    <div className={styles.container}>
      <div 
        className={gridClasses}
        style={{
          '--grid-cols-xs': columnsConfig.xs,
          '--grid-cols-sm': columnsConfig.sm,
          '--grid-cols-md': columnsConfig.md,
          '--grid-cols-lg': columnsConfig.lg,
          '--grid-cols-xl': columnsConfig.xl,
        } as React.CSSProperties}
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            size={cardSize}
            showPrice={showPrice}
            showVendor={showVendor}
            showStatus={showStatus}
            onSelect={handleProductSelect}
          />
        ))}
      </div>

      {/* Load More Section */}
      {(hasMore || loading) && (
        <div className={styles.loadMore}>
          {loading ? (
            <div className={styles.loadingSpinner}>
              <div className={styles.spinner} />
              <span>Loading more products...</span>
            </div>
          ) : (
            onLoadMore && (
              <button 
                className={styles.loadMoreButton}
                onClick={onLoadMore}
              >
                Load More Products
              </button>
            )
          )}
        </div>
      )}

      {/* Error state for pagination */}
      {error && products.length > 0 && (
        <div className={styles.paginationError}>
          <p className={styles.errorText}>Failed to load more products</p>
          <button 
            className={styles.retryButton}
            onClick={handleRetry}
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}