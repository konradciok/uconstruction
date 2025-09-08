import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ProductFilters as ProductFiltersType,
  ProductCategory,
  ProductTag,
} from '@/types/product';
import styles from './ProductFilters.module.css';

interface ProductFiltersProps {
  filters: ProductFiltersType;
  onFiltersChange: (filters: ProductFiltersType) => void;
  categories?: ProductCategory[];
  tags?: ProductTag[];
  loading?: boolean;
  className?: string;
  layout?: 'horizontal' | 'vertical' | 'sidebar';
  // Optional prop to disable auto-fetching (for demo/testing)
  disableAutoFetch?: boolean;
}

// API response types
interface CategoryAPIResponse {
  success: boolean;
  data: {
    categories: ProductCategory[];
  };
}

interface TagAPIResponse {
  success: boolean;
  data: {
    tags: ProductTag[];
  };
}

interface VendorData {
  name: string;
  count: number;
}

interface ProductTypeData {
  name: string;
  count: number;
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function ProductFilters({
  filters,
  onFiltersChange,
  categories: propCategories,
  tags: propTags,
  loading = false,
  className,
  layout = 'horizontal',
  disableAutoFetch = false,
}: ProductFiltersProps) {
  // Local state for debounced inputs
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const [minPrice, setMinPrice] = useState(
    filters.priceRange?.min?.toString() || ''
  );
  const [maxPrice, setMaxPrice] = useState(
    filters.priceRange?.max?.toString() || ''
  );

  // Local state for fetched data
  const [categories, setCategories] = useState<ProductCategory[]>(
    propCategories || []
  );
  const [tags, setTags] = useState<ProductTag[]>(propTags || []);
  const [vendors, setVendors] = useState<VendorData[]>([]);
  const [productTypes, setProductTypes] = useState<ProductTypeData[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories and tags from API
  useEffect(() => {
    if (disableAutoFetch) {
      // Use provided props or fallback to mock data
      setCategories(propCategories || []);
      setTags(propTags || []);
      setVendors([
        { name: 'UConstruction Artist', count: 12 },
        { name: 'Guest Artist', count: 3 },
      ]);
      setProductTypes([
        { name: 'Painting', count: 8 },
        { name: 'Drawing', count: 4 },
        { name: 'Mixed Media', count: 3 },
      ]);
      return;
    }

    const fetchFilterData = async () => {
      setDataLoading(true);
      setError(null);

      try {
        // Fetch categories and tags in parallel
        const [categoriesResponse, tagsResponse] = await Promise.all([
          fetch('/api/products/categories'),
          fetch('/api/products/tags'),
        ]);

        if (!categoriesResponse.ok || !tagsResponse.ok) {
          throw new Error('Failed to fetch filter data');
        }

        const [categoriesData, tagsData]: [
          CategoryAPIResponse,
          TagAPIResponse,
        ] = await Promise.all([categoriesResponse.json(), tagsResponse.json()]);

        if (categoriesData.success) {
          setCategories(categoriesData.data.categories);
        }

        if (tagsData.success) {
          setTags(tagsData.data.tags);
        }

        // For vendors and product types, we'd need additional API endpoints
        // For now, using fallback mock data
        setVendors([
          { name: 'UConstruction Artist', count: 12 },
          { name: 'Guest Artist', count: 3 },
        ]);
        setProductTypes([
          { name: 'Painting', count: 8 },
          { name: 'Drawing', count: 4 },
          { name: 'Mixed Media', count: 3 },
        ]);
      } catch (err) {
        console.error('Error fetching filter data:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to fetch filter data'
        );

        // Fallback to mock data on error
        setCategories(propCategories || []);
        setTags(propTags || []);
        setVendors([
          { name: 'UConstruction Artist', count: 12 },
          { name: 'Guest Artist', count: 3 },
        ]);
        setProductTypes([
          { name: 'Painting', count: 8 },
          { name: 'Drawing', count: 4 },
          { name: 'Mixed Media', count: 3 },
        ]);
      } finally {
        setDataLoading(false);
      }
    };

    // Only fetch if we don't have prop data
    if (!propCategories && !propTags) {
      fetchFilterData();
    } else {
      setCategories(propCategories || []);
      setTags(propTags || []);
    }
  }, [disableAutoFetch, propCategories, propTags]);

  // Debounced values
  const debouncedSearch = useDebounce(searchQuery, 300);
  const debouncedMinPrice = useDebounce(minPrice, 300);
  const debouncedMaxPrice = useDebounce(maxPrice, 300);

  // Update filters when debounced values change
  useEffect(() => {
    if (debouncedSearch !== (filters.search || '')) {
      onFiltersChange({
        ...filters,
        search: debouncedSearch || undefined,
      });
    }
  }, [debouncedSearch, filters, onFiltersChange]);

  useEffect(() => {
    const min = debouncedMinPrice ? parseFloat(debouncedMinPrice) : undefined;
    const max = debouncedMaxPrice ? parseFloat(debouncedMaxPrice) : undefined;

    const currentMin = filters.priceRange?.min;
    const currentMax = filters.priceRange?.max;

    if (min !== currentMin || max !== currentMax) {
      let priceRange = undefined;

      if (min !== undefined || max !== undefined) {
        priceRange = {
          min: min || 0,
          max: max || 9999999,
        };

        // Validate price range
        if (priceRange.min > priceRange.max) {
          return; // Don't update if invalid
        }
      }

      onFiltersChange({
        ...filters,
        priceRange,
      });
    }
  }, [debouncedMinPrice, debouncedMaxPrice, filters, onFiltersChange]);

  // Handle immediate filter changes (non-debounced)
  const handleCategoryChange = useCallback(
    (category: string) => {
      onFiltersChange({
        ...filters,
        category: category === 'all' ? undefined : category,
      });
    },
    [filters, onFiltersChange]
  );

  const handleStatusChange = useCallback(
    (status: string) => {
      onFiltersChange({
        ...filters,
        status: status === 'all' ? undefined : status,
        publishedOnly: status === 'published' ? true : undefined,
      });
    },
    [filters, onFiltersChange]
  );

  const handleVendorChange = useCallback(
    (vendor: string) => {
      onFiltersChange({
        ...filters,
        vendor: vendor === 'all' ? undefined : vendor,
      });
    },
    [filters, onFiltersChange]
  );

  const handleProductTypeChange = useCallback(
    (productType: string) => {
      onFiltersChange({
        ...filters,
        productType: productType === 'all' ? undefined : productType,
      });
    },
    [filters, onFiltersChange]
  );

  const handleTagToggle = useCallback(
    (tagName: string) => {
      const currentTags = filters.tags || [];
      const newTags = currentTags.includes(tagName)
        ? currentTags.filter((t) => t !== tagName)
        : [...currentTags, tagName];

      onFiltersChange({
        ...filters,
        tags: newTags.length > 0 ? newTags : undefined,
      });
    },
    [filters, onFiltersChange]
  );

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setMinPrice('');
    setMaxPrice('');

    onFiltersChange({
      publishedOnly: true, // Default to showing only published products
    });
  }, [onFiltersChange]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.category) count++;
    if (filters.status && filters.status !== 'active') count++;
    if (filters.vendor) count++;
    if (filters.productType) count++;
    if (filters.tags && filters.tags.length > 0) count++;
    if (filters.priceRange) count++;
    return count;
  }, [filters]);

  // Combine loading states
  const isLoading = loading || dataLoading;

  const containerClasses = [styles.container, styles[layout], className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses}>
      {/* Filter Header */}
      <div className={styles.header}>
        <h3 className={styles.title}>
          Filters
          {activeFilterCount > 0 && (
            <span className={styles.activeCount}>({activeFilterCount})</span>
          )}
        </h3>
        {activeFilterCount > 0 && (
          <button
            className={styles.clearButton}
            onClick={handleClearFilters}
            type="button"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Filter Controls */}
      <div className={styles.filters}>
        {/* Search */}
        <div className={styles.filterGroup}>
          <label htmlFor="search-input" className={styles.label}>
            Search Products
          </label>
          <div className={styles.searchContainer}>
            <input
              id="search-input"
              type="text"
              className={styles.searchInput}
              placeholder="Search by title, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className={styles.clearSearch}
                onClick={() => setSearchQuery('')}
                type="button"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Category Filter */}
        <div className={styles.filterGroup}>
          <label htmlFor="category-select" className={styles.label}>
            Category
          </label>
          <select
            id="category-select"
            className={styles.select}
            value={filters.category || 'all'}
            onChange={(e) => handleCategoryChange(e.target.value)}
            disabled={isLoading}
          >
            <option value="all">All Categories ({categories.length})</option>
            {categories.map((category) => (
              <option key={category.id} value={category.handle}>
                {category.name} ({category.productCount})
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className={styles.filterGroup}>
          <label htmlFor="status-select" className={styles.label}>
            Status
          </label>
          <select
            id="status-select"
            className={styles.select}
            value={
              filters.publishedOnly ? 'published' : filters.status || 'all'
            }
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            <option value="all">All Products</option>
            <option value="published">Published Only</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Vendor Filter */}
        <div className={styles.filterGroup}>
          <label htmlFor="vendor-select" className={styles.label}>
            Artist / Vendor
          </label>
          <select
            id="vendor-select"
            className={styles.select}
            value={filters.vendor || 'all'}
            onChange={(e) => handleVendorChange(e.target.value)}
          >
            <option value="all">All Artists</option>
            {vendors.map((vendor) => (
              <option key={vendor.name} value={vendor.name}>
                {vendor.name} ({vendor.count})
              </option>
            ))}
          </select>
        </div>

        {/* Product Type Filter */}
        <div className={styles.filterGroup}>
          <label htmlFor="type-select" className={styles.label}>
            Product Type
          </label>
          <select
            id="type-select"
            className={styles.select}
            value={filters.productType || 'all'}
            onChange={(e) => handleProductTypeChange(e.target.value)}
          >
            <option value="all">All Types</option>
            {productTypes.map((type) => (
              <option key={type.name} value={type.name}>
                {type.name} ({type.count})
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div className={styles.filterGroup}>
          <span className={styles.label}>Price Range</span>
          <div className={styles.priceRange}>
            <div className={styles.priceInput}>
              <label htmlFor="min-price" className={styles.srOnly}>
                Minimum price
              </label>
              <input
                id="min-price"
                type="number"
                className={styles.numberInput}
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                min="0"
                step="1"
              />
              <span className={styles.currency}>$</span>
            </div>
            <span className={styles.priceSeparator}>–</span>
            <div className={styles.priceInput}>
              <label htmlFor="max-price" className={styles.srOnly}>
                Maximum price
              </label>
              <input
                id="max-price"
                type="number"
                className={styles.numberInput}
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                min="0"
                step="1"
              />
              <span className={styles.currency}>$</span>
            </div>
          </div>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className={styles.filterGroup}>
            <span className={styles.label}>
              Tags ({filters.tags?.length || 0} selected)
            </span>
            <div className={styles.tagList}>
              {tags.slice(0, 10).map((tag) => (
                <label key={tag.id} className={styles.tagItem}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={filters.tags?.includes(tag.name) || false}
                    onChange={() => handleTagToggle(tag.name)}
                  />
                  <span className={styles.tagName}>
                    {tag.name} ({tag.productCount})
                  </span>
                </label>
              ))}
              {tags.length > 10 && (
                <button className={styles.showMore} type="button">
                  Show {tags.length - 10} more...
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {isLoading && (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <span>Updating filters...</span>
        </div>
      )}

      {error && !isLoading && (
        <div
          className={styles.loading}
          style={{ color: '#dc2626', borderTop: '1px solid #dc2626' }}
        >
          <span>⚠️ {error}</span>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginLeft: '8px',
              textDecoration: 'underline',
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
