import { useState, useEffect, useCallback } from 'react';
import {
  ProductWithRelations,
  ProductFilters,
  ProductListResult,
} from '@/types/product';

interface UseProductsOptions {
  initialFilters?: ProductFilters;
  limit?: number;
  enableAutoFetch?: boolean;
}

interface UseProductsResult {
  products: ProductWithRelations[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  filters: ProductFilters;
  nextCursor: string | null;
  setFilters: (filters: ProductFilters) => void;
  loadMore: () => void;
  refresh: () => void;
  clearError: () => void;
}

// Build query string from filters
function buildQueryString(
  filters: ProductFilters,
  limit?: number,
  cursor?: string
): string {
  const params = new URLSearchParams();

  if (filters.search) params.set('q', filters.search);
  if (filters.category) params.set('category', filters.category);
  if (filters.status) params.set('status', filters.status);
  if (filters.vendor) params.set('vendor', filters.vendor);
  if (filters.productType) params.set('productType', filters.productType);
  if (filters.publishedOnly) params.set('publishedOnly', 'true');
  if (filters.tags && filters.tags.length > 0) {
    params.set('tags', filters.tags.join(','));
  }
  if (filters.priceRange) {
    if (filters.priceRange.min > 0) {
      params.set('minPrice', filters.priceRange.min.toString());
    }
    if (filters.priceRange.max < 9999999) {
      params.set('maxPrice', filters.priceRange.max.toString());
    }
  }
  if (limit) params.set('limit', limit.toString());
  if (cursor) params.set('cursor', cursor);

  return params.toString();
}

export function useProducts({
  initialFilters = { publishedOnly: true },
  limit = 20,
  enableAutoFetch = true,
}: UseProductsOptions = {}): UseProductsResult {
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [filters, setFiltersState] = useState<ProductFilters>(initialFilters);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  // Fetch products from API
  const fetchProducts = useCallback(
    async (currentFilters: ProductFilters, cursor?: string, append = false) => {
      setLoading(true);
      setError(null);

      try {
        const queryString = buildQueryString(currentFilters, limit, cursor);
        const endpoint = currentFilters.search
          ? `/api/products/search?${queryString}`
          : `/api/products?${queryString}`;

        const response = await fetch(endpoint);

        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.status}`);
        }

        const result: ProductListResult = await response.json();

        const newProducts = result.products;

        if (append) {
          setProducts((prev) => [...prev, ...newProducts]);
        } else {
          setProducts(newProducts);
        }

        setHasMore(result.hasMore || false);
        setNextCursor(result.nextCursor || null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to fetch products'
        );

        // Don't clear products on error if we're appending (pagination)
        if (!append) {
          setProducts([]);
        }
        setHasMore(false);
        setNextCursor(null);
      } finally {
        setLoading(false);
      }
    },
    [limit]
  );

  // Set filters and trigger refetch
  const setFilters = useCallback(
    (newFilters: ProductFilters) => {
      setFiltersState(newFilters);
      if (enableAutoFetch) {
        fetchProducts(newFilters);
      }
    },
    [fetchProducts, enableAutoFetch]
  );

  // Load more products (pagination)
  const loadMore = useCallback(() => {
    if (!loading && hasMore && nextCursor) {
      fetchProducts(filters, nextCursor, true);
    }
  }, [fetchProducts, filters, loading, hasMore, nextCursor]);

  // Refresh products (reload current filters)
  const refresh = useCallback(() => {
    fetchProducts(filters);
  }, [fetchProducts, filters]);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initial load
  useEffect(() => {
    if (enableAutoFetch) {
      fetchProducts(filters);
    }
  }, []); // Only run once on mount

  return {
    products,
    loading,
    error,
    hasMore,
    filters,
    nextCursor,
    setFilters,
    loadMore,
    refresh,
    clearError,
  };
}
