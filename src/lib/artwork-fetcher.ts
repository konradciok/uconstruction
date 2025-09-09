/**
 * Server-Side Artwork Data Fetcher
 * 
 * Provides server-side data fetching functions for artwork-related pages
 * Now uses database data instead of static data
 */

import { validateArtworkSlug } from './param-validators'
import { ProductService } from './product-service'
import { ProductToArtworkTransformer } from './product-to-artwork-transformer'
import type { Artwork } from '@/types/portfolio2'

export interface ArtworkFetchResult {
  success: boolean
  artwork?: Artwork
  error?: string
}

/**
 * Fetch artwork by slug (server-side) - now from database
 */
export async function fetchArtworkBySlug(slug: string): Promise<ArtworkFetchResult> {
  // Validate slug parameter
  const validation = validateArtworkSlug(slug)
  if (!validation.isValid) {
    return {
      success: false,
      error: validation.error
    }
  }

  const productService = new ProductService()
  
  try {
    // Try to find product by handle (slug)
    const product = await productService.getProductByHandle(validation.value!)
    
    if (!product) {
      return {
        success: false,
        error: 'Artwork not found'
      }
    }

    // Transform product to artwork
    const artwork = ProductToArtworkTransformer.transformProduct(product)

    return {
      success: true,
      artwork
    }
  } catch (error) {
    console.error('Error fetching artwork:', error)
    return {
      success: false,
      error: 'Failed to fetch artwork'
    }
  } finally {
    // No disconnect needed - using singleton PrismaClient
  }
}

/**
 * Fetch all artworks (server-side) - now from database
 */
export async function fetchAllArtworks(): Promise<{
  success: boolean
  artworks?: Artwork[]
  error?: string
}> {
  const productService = new ProductService()
  
  try {
    // Get all published products
    const result = await productService.getProducts(
      { publishedOnly: true },
      { field: 'updatedAt', direction: 'desc' },
      { take: 100 } // Reasonable limit for gallery
    )

    // Transform products to artworks
    const artworks = ProductToArtworkTransformer.transformProducts(result.products)

    return {
      success: true,
      artworks
    }
  } catch (error) {
    console.error('Error fetching artworks:', error)
    return {
      success: false,
      error: 'Failed to fetch artworks'
    }
  } finally {
    // No disconnect needed - using singleton PrismaClient
  }
}

/**
 * Generate static params for all artworks - now from database
 */
export async function generateArtworkStaticParams(): Promise<Array<{ slug: string }>> {
  const productService = new ProductService()
  
  try {
    const result = await productService.getProducts(
      { publishedOnly: true },
      { field: 'updatedAt', direction: 'desc' },
      { take: 100 }
    )

    return result.products.map((product) => ({
      slug: product.handle,
    }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  } finally {
    // No disconnect needed - using singleton PrismaClient
  }
}

/**
 * Check if artwork exists by slug - now from database
 */
export async function artworkExists(slug: string): Promise<boolean> {
  const validation = validateArtworkSlug(slug)
  if (!validation.isValid) {
    return false
  }
  
  const productService = new ProductService()
  
  try {
    const product = await productService.getProductByHandle(validation.value!)
    return product !== null
  } catch (error) {
    console.error('Error checking artwork existence:', error)
    return false
  } finally {
    // No disconnect needed - using singleton PrismaClient
  }
}
