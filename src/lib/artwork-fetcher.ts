/**
 * Server-Side Artwork Data Fetcher
 * 
 * Provides server-side data fetching functions for artwork-related pages
 */

import { validateArtworkSlug } from './param-validators'
import { ARTWORKS } from './portfolio2-data'
import type { Artwork } from '@/types/portfolio2'

export interface ArtworkFetchResult {
  success: boolean
  artwork?: Artwork
  error?: string
}

/**
 * Find artwork by slug
 */
function findArtworkBySlug(slug: string): Artwork | null {
  return ARTWORKS.find(artwork => 
    artwork.title.toLowerCase().replace(/[^a-z0-9]/g, '-') === slug
  ) || null
}

/**
 * Fetch artwork by slug (server-side)
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

  try {
    const artwork = findArtworkBySlug(validation.value!)
    
    if (!artwork) {
      return {
        success: false,
        error: 'Artwork not found'
      }
    }

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
  }
}

/**
 * Fetch all artworks (server-side)
 */
export async function fetchAllArtworks(): Promise<{
  success: boolean
  artworks?: Artwork[]
  error?: string
}> {
  try {
    return {
      success: true,
      artworks: ARTWORKS
    }
  } catch (error) {
    console.error('Error fetching artworks:', error)
    return {
      success: false,
      error: 'Failed to fetch artworks'
    }
  }
}

/**
 * Generate static params for all artworks
 */
export function generateArtworkStaticParams(): Array<{ slug: string }> {
  return ARTWORKS.map((artwork) => ({
    slug: artwork.title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
  }))
}

/**
 * Check if artwork exists by slug
 */
export function artworkExists(slug: string): boolean {
  const validation = validateArtworkSlug(slug)
  if (!validation.isValid) {
    return false
  }
  
  return findArtworkBySlug(validation.value!) !== null
}
