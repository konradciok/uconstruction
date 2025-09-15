/**
 * Server-Side Product Data Fetcher
 * 
 * Provides server-side data fetching functions for product-related pages
 */

import { ProductService } from './product-service'
import { cache } from 'react'
import { validateProductHandle, validateProductId } from './param-validators'
import type { ProductWithRelations } from '@/types/product'
import type { Variant } from '@/generated/prisma'

export interface ProductFetchResult {
  success: boolean
  product?: SerializedProductWithRelations
  error?: string
}

// Type for serialized variant with number prices instead of Decimal
type SerializedVariant = Omit<Variant, 'priceAmount' | 'compareAtPriceAmount'> & {
  priceAmount: number | null
  compareAtPriceAmount: number | null
}

// Type for serialized product with serialized variants
type SerializedProductWithRelations = Omit<ProductWithRelations, 'variants'> & {
  variants: SerializedVariant[]
}

/**
 * Serialize Decimal objects to numbers for client-side compatibility
 */
function serializeProductForClient(product: ProductWithRelations): SerializedProductWithRelations {
  return {
    ...product,
    variants: product.variants.map(variant => ({
      ...variant,
      priceAmount: variant.priceAmount ? Number(variant.priceAmount) : null,
      compareAtPriceAmount: variant.compareAtPriceAmount ? Number(variant.compareAtPriceAmount) : null,
    }))
  }
}

/**
 * Fetch product by handle (server-side)
 */
// Wrap the core fetch in React cache to dedupe concurrent/server calls
const fetchProductByHandleUncached = async (handle: string): Promise<ProductFetchResult> => {
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
      product: serializeProductForClient(product)
    }
  } catch (error) {
    console.error('Error fetching product by handle:', error)
    return {
      success: false,
      error: 'Failed to fetch product'
    }
  } finally {
    // No disconnect needed - using singleton PrismaClient
  }
}

export const fetchProductByHandle = cache(fetchProductByHandleUncached)

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
      product: serializeProductForClient(product)
    }
  } catch (error) {
    console.error('Error fetching product by ID:', error)
    return {
      success: false,
      error: 'Failed to fetch product'
    }
  } finally {
    // No disconnect needed - using singleton PrismaClient
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
  products?: SerializedProductWithRelations[]
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
      products: result.products.map(serializeProductForClient),
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
    // No disconnect needed - using singleton PrismaClient
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
  products?: SerializedProductWithRelations[]
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
      products: result.products.map(serializeProductForClient),
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
    // No disconnect needed - using singleton PrismaClient
  }
}
