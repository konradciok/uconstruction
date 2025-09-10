/**
 * React hooks for template product data
 * 
 * These hooks provide a clean interface between template components
 * and the API routes for template data.
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  TemplateProduct,
  TemplateSearchFilters
} from '@/lib/template-adapters'
import { productLogger } from '@/lib/logger'

/**
 * Hook for fetching featured products (homepage)
 */
export function useFeaturedProducts(limit: number = 3) {
  const [products, setProducts] = useState<TemplateProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchFeaturedProducts() {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/template/products?featured=true&limit=${limit}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        setProducts(data.products || [])
      } catch (err) {
        productLogger.error('Error fetching featured products', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch featured products')
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedProducts()
  }, [limit])

  return { products, loading, error }
}

/**
 * Hook for fetching shop products with pagination and filtering
 */
export function useShopProducts(
  page: number = 1,
  limit: number = 20,
  filters?: TemplateSearchFilters
) {
  const [products, setProducts] = useState<TemplateProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const isMountedRef = useRef(true)

  // Memoize filters to prevent infinite re-renders
  const memoizedFilters = useMemo(() => filters, [filters])

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      })
      
      if (memoizedFilters?.searchQuery) {
        params.append('search', memoizedFilters.searchQuery)
      }
      if (memoizedFilters?.categories?.length) {
        params.append('category', memoizedFilters.categories[0])
      }
      if (memoizedFilters?.tags?.length) {
        params.append('tags', memoizedFilters.tags.join(','))
      }
      if (memoizedFilters?.priceRange) {
        params.append('minPrice', memoizedFilters.priceRange.min.toString())
        params.append('maxPrice', memoizedFilters.priceRange.max.toString())
      }
      
      // Add request timeout and abort controller for resource management
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
      
      try {
        const response = await fetch(`/api/template/products?${params.toString()}`, {
          signal: controller.signal
        })
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        
        // Only update state if component is still mounted
        if (isMountedRef.current) {
          setProducts(data.products || [])
          setHasMore(data.hasMore || false)
          setTotalCount(data.totalCount || 0)
        }
      } catch (fetchError) {
        clearTimeout(timeoutId)
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          throw new Error('Request timeout - please try again')
        }
        throw fetchError
      }
    } catch (err) {
      productLogger.error('Error fetching shop products', err)
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to fetch shop products')
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [page, limit, memoizedFilters])

  useEffect(() => {
    fetchProducts()
    
    // Cleanup function to prevent state updates on unmounted components
    return () => {
      isMountedRef.current = false
    }
  }, [fetchProducts])

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return

    try {
      setLoading(true)
      
      // Build query parameters for next page
      const params = new URLSearchParams({
        page: (page + 1).toString(),
        limit: limit.toString()
      })
      
      if (memoizedFilters?.searchQuery) {
        params.append('search', memoizedFilters.searchQuery)
      }
      if (memoizedFilters?.categories?.length) {
        params.append('category', memoizedFilters.categories[0])
      }
      if (memoizedFilters?.tags?.length) {
        params.append('tags', memoizedFilters.tags.join(','))
      }
      if (memoizedFilters?.priceRange) {
        params.append('minPrice', memoizedFilters.priceRange.min.toString())
        params.append('maxPrice', memoizedFilters.priceRange.max.toString())
      }
      
      const response = await fetch(`/api/template/products?${params.toString()}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setProducts(prev => [...prev, ...(data.products || [])])
        setHasMore(data.hasMore || false)
      }
    } catch (err) {
      productLogger.error('Error loading more products', err)
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to load more products')
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [page, limit, memoizedFilters, loading, hasMore])

  return {
    products,
    loading,
    error,
    hasMore,
    totalCount,
    loadMore,
    refetch: fetchProducts
  }
}


/**
 * Hook for fetching collections (categories)
 */
export function useTemplateCollections() {
  const [collections, setCollections] = useState<Array<{
    id: string
    name: string
    handle: string
    productCount: number
    description?: string
  }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCollections() {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/template/collections')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        setCollections(data.collections || [])
      } catch (err) {
        productLogger.error('Error fetching collections', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch collections')
      } finally {
        setLoading(false)
      }
    }

    fetchCollections()
  }, [])

  return { collections, loading, error }
}

/**
 * Hook for fetching tags
 */
export function useTemplateTags() {
  const [tags, setTags] = useState<Array<{
    id: string
    name: string
    productCount: number
  }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTags() {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/template/tags')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        setTags(data.tags || [])
      } catch (err) {
        productLogger.error('Error fetching tags', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch tags')
      } finally {
        setLoading(false)
      }
    }

    fetchTags()
  }, [])

  return { tags, loading, error }
}

/**
 * Hook for search functionality
 */
export function useProductSearch() {
  const [searchResults, setSearchResults] = useState<TemplateProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = useCallback(async (query: string, filters?: TemplateSearchFilters) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // Build query parameters
      const params = new URLSearchParams({
        page: '1',
        limit: '50',
        search: query
      })
      
      if (filters?.categories?.length) {
        params.append('category', filters.categories[0])
      }
      if (filters?.tags?.length) {
        params.append('tags', filters.tags.join(','))
      }
      if (filters?.priceRange) {
        params.append('minPrice', filters.priceRange.min.toString())
        params.append('maxPrice', filters.priceRange.max.toString())
      }
      
      const response = await fetch(`/api/template/products?${params.toString()}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setSearchResults(data.products || [])
    } catch (err) {
      productLogger.error('Error searching products', err)
      setError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setLoading(false)
    }
  }, [])

  const clearSearch = useCallback(() => {
    setSearchResults([])
    setError(null)
  }, [])

  return {
    searchResults,
    loading,
    error,
    search,
    clearSearch
  }
}

/**
 * Hook for managing search filters state
 */
export function useSearchFilters() {
  const [filters, setFilters] = useState<TemplateSearchFilters>({
    categories: [],
    tags: [],
    priceRange: { min: 0, max: 1000 },
    searchQuery: ''
  })

  const updateFilters = useCallback((newFilters: Partial<TemplateSearchFilters>) => {
    setFilters(prev => {
      // Only update if there are actual changes
      const hasChanges = Object.keys(newFilters).some(key => {
        const typedKey = key as keyof TemplateSearchFilters
        if (typedKey === 'categories' || typedKey === 'tags') {
          const prevArray = prev[typedKey] || []
          const newArray = newFilters[typedKey] || []
          return JSON.stringify(prevArray) !== JSON.stringify(newArray)
        }
        if (typedKey === 'priceRange') {
          const prevRange = prev.priceRange || { min: 0, max: 1000 }
          const newRange = newFilters.priceRange || { min: 0, max: 1000 }
          return prevRange.min !== newRange.min || prevRange.max !== newRange.max
        }
        return prev[typedKey] !== newFilters[typedKey]
      })
      
      if (!hasChanges) return prev
      
      return { ...prev, ...newFilters }
    })
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({
      categories: [],
      tags: [],
      priceRange: { min: 0, max: 1000 },
      searchQuery: ''
    })
  }, [])

  const hasActiveFilters = useMemo(() => 
    filters.categories.length > 0 ||
    filters.tags.length > 0 ||
    filters.priceRange.min > 0 ||
    filters.priceRange.max < 1000 ||
    filters.searchQuery.length > 0,
    [filters.categories, filters.tags, filters.priceRange, filters.searchQuery]
  )

  return {
    filters,
    updateFilters,
    clearFilters,
    hasActiveFilters
  }
}

/**
 * Hook for fetching products by collection
 */
export function useProductsByCollection(collectionHandle: string, limit: number = 20) {
  const [products, setProducts] = useState<TemplateProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  const loadProducts = useCallback(async (offset: number = 0, append: boolean = false) => {
    if (!collectionHandle) return

    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString()
      })
      
      const response = await fetch(`/api/template/collections/${collectionHandle}?${params.toString()}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (append) {
        setProducts(prev => [...prev, ...(data.products || [])])
      } else {
        setProducts(data.products || [])
      }
      
      setTotal(data.total || 0)
      setHasMore(data.hasMore || false)
    } catch (err) {
      productLogger.error('Error loading products by collection', err)
      setError(err instanceof Error ? err.message : 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [collectionHandle, limit])

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      loadProducts(products.length, true)
    }
  }, [hasMore, loading, products.length, loadProducts])

  useEffect(() => {
    loadProducts(0, false)
  }, [loadProducts])

  return {
    products,
    loading,
    error,
    total,
    hasMore,
    loadMore,
    refresh: () => loadProducts(0, false)
  }
}
