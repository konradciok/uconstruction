/**
 * Server-Side Product Data Fetcher
 * 
 * Provides server-side data fetching functions for product-related pages
 */

import { ProductService } from './product-service'
import { validateProductHandle, validateProductId } from './param-validators'
import type { ProductWithRelations } from '@/types/product'

export interface ProductFetchResult {
  success: boolean
  product?: ProductWithRelations
  error?: string
}

/**
 * Fetch product by handle (server-side)
 */
export async function fetchProductByHandle(handle: string): Promise<ProductFetchResult> {
  // Validate handle parameter
  const validation = validateProductHandle(handle)
  if (!validation.isValid) {
    return {
      success: false,
      error: validation.error
    }
  }

  const productService = new ProductService()
  
  try {
    const product = await productService.getProductByHandle(validation.value!)
    
    if (!product) {
      return {
        success: false,
        error: 'Product not found'
      }
    }

    return {
      success: true,
      product
    }
  } catch (error) {
    console.error('Error fetching product by handle:', error)
    return {
      success: false,
      error: 'Failed to fetch product'
    }
  } finally {
    await productService.disconnect()
  }
}

/**
 * Fetch product by ID (server-side)
 */
export async function fetchProductById(id: string): Promise<ProductFetchResult> {
  // Validate ID parameter
  const validation = validateProductId(id)
  if (!validation.isValid) {
    return {
      success: false,
      error: validation.error
    }
  }

  const productService = new ProductService()
  
  try {
    const product = await productService.getProductById(parseInt(validation.value!))
    
    if (!product) {
      return {
        success: false,
        error: 'Product not found'
      }
    }

    return {
      success: true,
      product
    }
  } catch (error) {
    console.error('Error fetching product by ID:', error)
    return {
      success: false,
      error: 'Failed to fetch product'
    }
  } finally {
    await productService.disconnect()
  }
}

/**
 * Fetch multiple products with filters (server-side)
 */
export async function fetchProducts(filters: {
  limit?: number
  cursor?: string
  category?: string
  tags?: string[]
  publishedOnly?: boolean
} = {}): Promise<{
  success: boolean
  products?: ProductWithRelations[]
  hasMore?: boolean
  nextCursor?: string | null
  error?: string
}> {
  const productService = new ProductService()
  
  try {
    const result = await productService.getProducts(
      {
        category: filters.category,
        tags: filters.tags,
        publishedOnly: filters.publishedOnly ?? true
      },
      { field: 'updatedAt', direction: 'desc' },
      {
        take: filters.limit || 20,
        cursor: filters.cursor
      }
    )

    return {
      success: true,
      products: result.products,
      hasMore: result.hasMore,
      nextCursor: result.nextCursor
    }
  } catch (error) {
    console.error('Error fetching products:', error)
    return {
      success: false,
      error: 'Failed to fetch products'
    }
  } finally {
    await productService.disconnect()
  }
}

/**
 * Search products (server-side)
 */
export async function searchProducts(query: string, filters: {
  limit?: number
  cursor?: string
  category?: string
  tags?: string[]
} = {}): Promise<{
  success: boolean
  products?: ProductWithRelations[]
  totalResults?: number
  searchTime?: number
  error?: string
}> {
  if (!query || query.trim().length < 2) {
    return {
      success: false,
      error: 'Search query must be at least 2 characters long'
    }
  }

  const productService = new ProductService()
  
  try {
    const result = await productService.searchProducts(query.trim(), {
      category: filters.category,
      tags: filters.tags,
      publishedOnly: true
    }, {
      take: filters.limit || 20,
      cursor: filters.cursor
    })

    return {
      success: true,
      products: result.products,
      totalResults: result.totalResults,
      searchTime: result.searchTime
    }
  } catch (error) {
    console.error('Error searching products:', error)
    return {
      success: false,
      error: 'Failed to search products'
    }
  } finally {
    await productService.disconnect()
  }
}
