/**
 * Parameter Validation Utilities
 * 
 * Provides consistent parameter validation for dynamic routes
 */

export interface ValidationResult<T = string> {
  isValid: boolean
  error?: string
  value?: T
}

/**
 * Validate product handle parameter
 * Handles should be URL-safe strings (alphanumeric, hyphens, underscores)
 */
export function validateProductHandle(handle: string | undefined): ValidationResult {
  if (!handle) {
    return {
      isValid: false,
      error: 'Product handle is required'
    }
  }

  const trimmedHandle = handle.trim()
  
  if (trimmedHandle.length === 0) {
    return {
      isValid: false,
      error: 'Product handle cannot be empty'
    }
  }

  if (trimmedHandle.length > 100) {
    return {
      isValid: false,
      error: 'Product handle cannot exceed 100 characters'
    }
  }

  // Allow alphanumeric characters, hyphens, and underscores
  if (!/^[a-z0-9\-_]+$/i.test(trimmedHandle)) {
    return {
      isValid: false,
      error: 'Product handle contains invalid characters. Only letters, numbers, hyphens, and underscores are allowed'
    }
  }

  return {
    isValid: true,
    value: trimmedHandle
  }
}

/**
 * Validate product ID parameter
 * IDs should be positive integers
 */
export function validateProductId(id: string | undefined): ValidationResult {
  if (!id) {
    return {
      isValid: false,
      error: 'Product ID is required'
    }
  }

  const productId = parseInt(id.trim())
  
  if (isNaN(productId)) {
    return {
      isValid: false,
      error: 'Product ID must be a valid number'
    }
  }

  if (productId <= 0) {
    return {
      isValid: false,
      error: 'Product ID must be a positive integer'
    }
  }

  if (productId > Number.MAX_SAFE_INTEGER) {
    return {
      isValid: false,
      error: 'Product ID is too large'
    }
  }

  return {
    isValid: true,
    value: productId.toString()
  }
}

/**
 * Validate collection handle parameter
 * Similar to product handle but with different error messages
 */
export function validateCollectionHandle(handle: string | undefined): ValidationResult {
  if (!handle) {
    return {
      isValid: false,
      error: 'Collection handle is required'
    }
  }

  const trimmedHandle = handle.trim()
  
  if (trimmedHandle.length === 0) {
    return {
      isValid: false,
      error: 'Collection handle cannot be empty'
    }
  }

  if (trimmedHandle.length > 100) {
    return {
      isValid: false,
      error: 'Collection handle cannot exceed 100 characters'
    }
  }

  // Allow alphanumeric characters, hyphens, and underscores
  if (!/^[a-z0-9\-_]+$/i.test(trimmedHandle)) {
    return {
      isValid: false,
      error: 'Collection handle contains invalid characters. Only letters, numbers, hyphens, and underscores are allowed'
    }
  }

  return {
    isValid: true,
    value: trimmedHandle
  }
}

/**
 * Validate artwork slug parameter
 * Slugs should be URL-safe strings
 */
export function validateArtworkSlug(slug: string | undefined): ValidationResult {
  if (!slug) {
    return {
      isValid: false,
      error: 'Artwork slug is required'
    }
  }

  const trimmedSlug = slug.trim()
  
  if (trimmedSlug.length === 0) {
    return {
      isValid: false,
      error: 'Artwork slug cannot be empty'
    }
  }

  if (trimmedSlug.length > 200) {
    return {
      isValid: false,
      error: 'Artwork slug cannot exceed 200 characters'
    }
  }

  // Allow alphanumeric characters, hyphens, and underscores
  if (!/^[a-z0-9\-_]+$/i.test(trimmedSlug)) {
    return {
      isValid: false,
      error: 'Artwork slug contains invalid characters. Only letters, numbers, hyphens, and underscores are allowed'
    }
  }

  return {
    isValid: true,
    value: trimmedSlug
  }
}

/**
 * Validate search query parameter
 */
export function validateSearchQuery(query: string | undefined): ValidationResult {
  if (!query) {
    return {
      isValid: false,
      error: 'Search query parameter "q" is required'
    }
  }

  const trimmedQuery = query.trim()
  
  if (trimmedQuery.length < 2) {
    return {
      isValid: false,
      error: 'Search query must be at least 2 characters long'
    }
  }

  if (trimmedQuery.length > 100) {
    return {
      isValid: false,
      error: 'Search query must not exceed 100 characters'
    }
  }

  return {
    isValid: true,
    value: trimmedQuery
  }
}

/**
 * Validate price range parameters
 */
export function validatePriceRange(
  minPrice: string | null,
  maxPrice: string | null
): ValidationResult<{ min: number; max: number } | null> {
  if (!minPrice || !maxPrice) {
    return {
      isValid: true,
      value: null
    }
  }

  const min = parseFloat(minPrice)
  const max = parseFloat(maxPrice)

  if (isNaN(min) || isNaN(max)) {
    return {
      isValid: false,
      error: 'Price range values must be valid numbers'
    }
  }

  if (min < 0 || max < 0) {
    return {
      isValid: false,
      error: 'Price values must be non-negative'
    }
  }

  if (min > max) {
    return {
      isValid: false,
      error: 'Minimum price cannot be greater than maximum price'
    }
  }

  return {
    isValid: true,
    value: { min, max }
  }
}

/**
 * Validate pagination parameters
 */
export function validatePagination(
  limitParam: string | null,
  cursor: string | null
): ValidationResult<{ limit: number; cursor?: string }> {
  const limit = limitParam
    ? Math.min(Math.max(parseInt(limitParam), 1), 100)
    : 20

  if (limitParam && isNaN(parseInt(limitParam))) {
    return {
      isValid: false,
      error: 'Limit parameter must be a valid number'
    }
  }

  return {
    isValid: true,
    value: {
      limit,
      cursor: cursor || undefined
    }
  }
}

/**
 * Validate sort parameters
 */
export function validateSort(
  sortBy: string | null,
  sortOrder: string | null
): ValidationResult<{ field: 'title' | 'createdAt' | 'updatedAt' | 'publishedAt'; direction: 'asc' | 'desc' }> {
  const validFields = ['title', 'createdAt', 'updatedAt', 'publishedAt']
  const validDirections = ['asc', 'desc']

  const field = validFields.includes(sortBy || '') 
    ? (sortBy as 'title' | 'createdAt' | 'updatedAt' | 'publishedAt') 
    : 'updatedAt'

  const direction = validDirections.includes(sortOrder || '') 
    ? (sortOrder as 'asc' | 'desc') 
    : 'desc'

  return {
    isValid: true,
    value: { field, direction }
  }
}

/**
 * Generic string parameter validator
 */
export function validateStringParam(
  param: string | undefined,
  paramName: string,
  options: {
    required?: boolean
    maxLength?: number
    pattern?: RegExp
    patternError?: string
  } = {}
): ValidationResult {
  const { required = true, maxLength, pattern, patternError } = options

  if (!param) {
    if (required) {
      return {
        isValid: false,
        error: `${paramName} is required`
      }
    }
    return {
      isValid: true,
      value: ''
    }
  }

  const trimmedParam = param.trim()
  
  if (required && trimmedParam.length === 0) {
    return {
      isValid: false,
      error: `${paramName} cannot be empty`
    }
  }

  if (maxLength && trimmedParam.length > maxLength) {
    return {
      isValid: false,
      error: `${paramName} cannot exceed ${maxLength} characters`
    }
  }

  if (pattern && !pattern.test(trimmedParam)) {
    return {
      isValid: false,
      error: patternError || `${paramName} contains invalid characters`
    }
  }

  return {
    isValid: true,
    value: trimmedParam
  }
}

/**
 * Handle validation error and return appropriate API response
 */
export function handleValidationError<T>(validation: ValidationResult<T>) {
  if (!validation.isValid && validation.error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: validation.error
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
  return null
}
