/**
 * Product Filter Parser
 * 
 * Shared utility for parsing and validating product filters from URL search parameters.
 * Used by both /api/products and /api/products/search endpoints.
 */

import { NextRequest } from 'next/server'
import { 
  validatePriceRange, 
  validatePagination, 
  validateSort,
  validateSearchQuery,
  handleValidationError 
} from './param-validators'
import type { ProductFilters, ProductSortOptions } from '@/types/product'

export interface ParsedProductParams {
  filters: ProductFilters
  sort: ProductSortOptions
  pagination: {
    cursor?: string
    take: number
  }
  paginationMeta: {
    limit: number
    cursor: string | null
  }
}

export interface ParsedSearchParams extends ParsedProductParams {
  query: string
}

/**
 * Parse and validate product filters from URL search parameters
 */
export function parseProductFilters(searchParams: URLSearchParams): {
  filters: ProductFilters
  error?: Response
} {
  const filters: ProductFilters = {}

  // Parse basic filters
  if (searchParams.get('category')) {
    filters.category = searchParams.get('category') as string
  }

  if (searchParams.get('status')) {
    filters.status = searchParams.get('status') as string
  }

  if (searchParams.get('vendor')) {
    filters.vendor = searchParams.get('vendor') as string
  }

  if (searchParams.get('productType')) {
    filters.productType = searchParams.get('productType') as string
  }

  if (searchParams.get('publishedOnly') === 'true') {
    filters.publishedOnly = true
  }

  // Handle tags (comma-separated)
  const tagsParam = searchParams.get('tags')
  if (tagsParam) {
    filters.tags = tagsParam
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
  }

  // Validate price range
  const priceRangeValidation = validatePriceRange(
    searchParams.get('minPrice') || null,
    searchParams.get('maxPrice') || null
  )
  const priceRangeError = handleValidationError(priceRangeValidation)
  if (priceRangeError) {
    return { filters, error: priceRangeError }
  }
  
  if (priceRangeValidation.value) {
    filters.priceRange = priceRangeValidation.value
  }

  return { filters }
}

/**
 * Parse and validate sort options from URL search parameters
 */
export function parseSortOptions(searchParams: URLSearchParams): {
  sort: ProductSortOptions
  error?: Response
} {
  const sortValidation = validateSort(
    searchParams.get('sortBy') || null,
    searchParams.get('sortOrder') || null
  )
  const sortError = handleValidationError(sortValidation)
  if (sortError) {
    return { sort: { field: 'updatedAt', direction: 'desc' }, error: sortError }
  }
  
  return { sort: sortValidation.value! }
}

/**
 * Parse and validate pagination options from URL search parameters
 */
export function parsePaginationOptions(searchParams: URLSearchParams): {
  pagination: {
    cursor?: string
    take: number
  }
  paginationMeta: {
    limit: number
    cursor: string | null
  }
  error?: Response
} {
  const paginationValidation = validatePagination(
    searchParams.get('limit') || null,
    searchParams.get('cursor') || null
  )
  const paginationError = handleValidationError(paginationValidation)
  if (paginationError) {
    return {
      pagination: { take: 20 },
      paginationMeta: { limit: 20, cursor: null },
      error: paginationError
    }
  }
  
  const paginationValue = paginationValidation.value!
  return {
    pagination: {
      cursor: paginationValue.cursor,
      take: paginationValue.limit,
    },
    paginationMeta: {
      limit: paginationValue.limit,
      cursor: paginationValue.cursor || null,
    }
  }
}

/**
 * Parse all product-related parameters from a NextRequest
 * This is the main function that combines all parsing logic
 */
export function parseProductParams(request: NextRequest): {
  params: ParsedProductParams
  error?: Response
} {
  const { searchParams } = new URL(request.url)

  // Parse filters
  const { filters, error: filtersError } = parseProductFilters(searchParams)
  if (filtersError) {
    return { params: {} as ParsedProductParams, error: filtersError }
  }

  // Parse sort options
  const { sort, error: sortError } = parseSortOptions(searchParams)
  if (sortError) {
    return { params: {} as ParsedProductParams, error: sortError }
  }

  // Parse pagination options
  const { pagination, paginationMeta, error: paginationError } = parsePaginationOptions(searchParams)
  if (paginationError) {
    return { params: {} as ParsedProductParams, error: paginationError }
  }

  return {
    params: {
      filters,
      sort,
      pagination,
      paginationMeta
    }
  }
}

/**
 * Parse search parameters (includes query + all product filters)
 */
export function parseSearchParams(request: NextRequest): {
  params: ParsedSearchParams
  error?: Response
} {
  const { searchParams } = new URL(request.url)

  // Validate search query first
  const queryValidation = validateSearchQuery(searchParams.get('q') || undefined)
  const queryError = handleValidationError(queryValidation)
  if (queryError) {
    return { params: {} as ParsedSearchParams, error: queryError }
  }

  // Parse product parameters
  const { params: productParams, error: productError } = parseProductParams(request)
  if (productError) {
    return { params: {} as ParsedSearchParams, error: productError }
  }

  return {
    params: {
      ...productParams,
      query: queryValidation.value!
    }
  }
}

