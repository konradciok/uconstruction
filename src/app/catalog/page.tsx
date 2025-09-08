'use client';

import { useState, useEffect } from 'react';
import Container from '@/components/Container';
import ProductGrid from '@/components/Product/ProductGrid/ProductGrid';
import { useProducts } from '@/hooks/useProducts';
import styles from './catalog.module.css';

export default function CatalogPage() {
  const {
    products,
    loading,
    error,
    hasMore,
    filters,
    setFilters,
    loadMore,
    refresh,
  } = useProducts({
    initialFilters: { publishedOnly: true },
    limit: 12,
  });

  const handleLoadMore = () => {
    loadMore();
  };

  const handleProductSelect = (product: any) => {
    window.location.href = `/product-page/${product.handle}`;
  };

  return (
    <main className={styles.main}>
      <Container>
        <div className={styles.header}>
          <h1 className={styles.title}>Product Catalog</h1>
          <p className={styles.subtitle}>
            Discover our complete collection of watercolor artworks and prints
          </p>
        </div>

        <div className={styles.content}>
          <section className={styles.productsSection}>
            <div className={styles.resultsHeader}>
              <div className={styles.resultsCount}>
                {loading
                  ? 'Loading...'
                  : error
                    ? 'Error loading products'
                    : `${products.length} products found`}
              </div>

              {error && (
                <button onClick={refresh} className={styles.retryButton}>
                  Retry
                </button>
              )}
            </div>

            <div className={styles.catalogGrid}>
              {products.map((product) => (
                <div
                  key={product.id}
                  className={styles.catalogItem}
                  onClick={() => handleProductSelect(product)}
                >
                  <div className={styles.catalogImageContainer}>
                    {product.media && product.media.length > 0 ? (
                      <img
                        src={product.media[0].url}
                        alt={product.media[0].altText || product.title}
                        className={styles.catalogImage}
                        loading="lazy"
                      />
                    ) : (
                      <div className={styles.catalogPlaceholder}>
                        <span>No Image</span>
                      </div>
                    )}
                    <div className={styles.catalogOverlay}>
                      <span className={styles.catalogViewButton}>
                        View Details
                      </span>
                    </div>
                  </div>

                  <div className={styles.catalogInfo}>
                    <h3 className={styles.catalogTitle}>{product.title}</h3>
                    <div className={styles.catalogPrice}>
                      {product.variants &&
                      product.variants.length > 0 &&
                      product.variants[0].priceAmount ? (
                        <span className={styles.price}>
                          $
                          {parseFloat(
                            product.variants[0].priceAmount.toString()
                          ).toFixed(2)}
                        </span>
                      ) : (
                        <span className={styles.price}>Price on request</span>
                      )}
                    </div>
                    {product.vendor && (
                      <div className={styles.catalogArtist}>
                        by {product.vendor}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && !loading && (
              <div className={styles.loadMoreContainer}>
                <button
                  onClick={handleLoadMore}
                  className={styles.loadMoreButton}
                >
                  Load More Products
                </button>
              </div>
            )}

            {/* Loading State */}
            {loading && products.length === 0 && (
              <div className={styles.loadingGrid}>
                {Array.from({ length: 12 }, (_, index) => (
                  <div key={index} className={styles.loadingSkeleton}>
                    <div className={styles.skeletonImage}></div>
                    <div className={styles.skeletonText}></div>
                    <div className={styles.skeletonPrice}></div>
                  </div>
                ))}
              </div>
            )}

            {/* Loading More State */}
            {loading && products.length > 0 && (
              <div className={styles.loadingMore}>
                <div className={styles.loadingSpinner}></div>
                <span>Loading more products...</span>
              </div>
            )}

            {!loading && !error && products.length === 0 && (
              <div className={styles.emptyState}>
                <h3>No products found</h3>
                <p>Try adjusting your filters to see more results</p>
                <button
                  onClick={() => setFilters({})}
                  className={styles.clearFiltersButton}
                >
                  Clear all filters
                </button>
              </div>
            )}
          </section>
        </div>
      </Container>
    </main>
  );
}
