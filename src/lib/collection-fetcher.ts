/**
 * Server-Side Collection Data Fetcher
 * 
 * Provides server-side data fetching functions for collection-related pages
 */

import { ProductService } from './product-service'
import { validateCollectionHandle } from './param-validators'
import type { ProductWithRelations } from '@/types/product'

export interface CollectionData {
  title: string
  description: string
  slug: string
  products: ProductWithRelations[]
  totalProducts: number
}

export interface CollectionFetchResult {
  success: boolean
  collection?: CollectionData
  error?: string
}

/**
 * Mock collection data - this will be replaced with real data from the database
 */
const MOCK_COLLECTIONS = {
  'original-paintings': {
    title: 'Original Paintings',
    description: 'Unique watercolor paintings created with traditional techniques and artistic vision.',
    slug: 'original-paintings'
  },
  'limited-prints': {
    title: 'Limited Edition Prints',
    description: 'High-quality archival prints in limited quantities, perfect for art collectors.',
    slug: 'limited-prints'
  },
  'art-supplies': {
    title: 'Art Supplies',
    description: 'Professional watercolor supplies and tools for artists of all levels.',
    slug: 'art-supplies'
  }
} as const

/**
 * Fetch collection data by handle (server-side)
 */
export async function fetchCollectionByHandle(handle: string): Promise<CollectionFetchResult> {
  // Validate handle parameter
  const validation = validateCollectionHandle(handle)
  if (!validation.isValid) {
    return {
      success: false,
      error: validation.error
    }
  }

  // Check if collection exists in mock data
  const collectionInfo = MOCK_COLLECTIONS[validation.value! as keyof typeof MOCK_COLLECTIONS]
  if (!collectionInfo) {
    return {
      success: false,
      error: 'Collection not found'
    }
  }

  const productService = new ProductService()
  
  try {
    // Fetch products for this collection
    const result = await productService.getProducts(
      {
        category: validation.value!,
        publishedOnly: true
      },
      { field: 'updatedAt', direction: 'desc' },
      {
        take: 50 // Get more products for collection pages
      }
    )

    const collectionData: CollectionData = {
      title: collectionInfo.title,
      description: collectionInfo.description,
      slug: collectionInfo.slug,
      products: result.products,
      totalProducts: result.products.length
    }

    return {
      success: true,
      collection: collectionData
    }
  } catch (error) {
    console.error('Error fetching collection:', error)
    return {
      success: false,
      error: 'Failed to fetch collection data'
    }
  } finally {
    // No disconnect needed - using singleton PrismaClient
  }
}

/**
 * Fetch all available collections (server-side)
 */
export async function fetchAllCollections(): Promise<{
  success: boolean
  collections?: Array<{
    title: string
    description: string
    slug: string
    productCount: number
  }>
  error?: string
}> {
  const productService = new ProductService()
  
  try {
    const collections = []
    
    // Fetch each collection with product count using optimized count queries
    for (const [slug, info] of Object.entries(MOCK_COLLECTIONS)) {
      // Use count method instead of fetching actual products
      const productCount = await productService.getProductCount({
        category: slug,
        publishedOnly: true
      })

      collections.push({
        title: info.title,
        description: info.description,
        slug: info.slug,
        productCount
      })
    }

    return {
      success: true,
      collections
    }
  } catch (error) {
    console.error('Error fetching collections:', error)
    return {
      success: false,
      error: 'Failed to fetch collections'
    }
  } finally {
    // No disconnect needed - using singleton PrismaClient
  }
}

/**
 * Check if collection exists
 */
export function collectionExists(handle: string): boolean {
  const validation = validateCollectionHandle(handle)
  if (!validation.isValid) {
    return false
  }
  
  return validation.value! in MOCK_COLLECTIONS
}
