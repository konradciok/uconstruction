/**
 * Template Data Adapters
 * 
 * This module provides adapters to convert Prisma data models
 * to formats expected by the template components.
 */

import type { ProductWithRelations } from '@/types/product'
import type { PrismaClient } from '@/generated/prisma'

// Template-compatible product interface
export interface TemplateProduct {
  id: string
  title: string
  handle: string
  description?: string
  vendor?: string
  featuredImage: {
    url: string
    altText: string
  }
  priceRange: {
    minVariantPrice: {
      amount: string
      currencyCode: string
    }
    maxVariantPrice: {
      amount: string
      currencyCode: string
    }
  }
  variants: TemplateVariant[]
  media: TemplateMedia[]
  tags: string[]
  collections: TemplateCollection[]
  availableForSale: boolean
  createdAt: string
  updatedAt: string
}

export interface TemplateVariant {
  id: string
  title: string
  price: {
    amount: string
    currencyCode: string
  }
  compareAtPrice?: {
    amount: string
    currencyCode: string
  }
  availableForSale: boolean
  sku?: string
  weight?: number
  weightUnit?: string
}

export interface TemplateMedia {
  id: string
  url: string
  altText?: string
  mediaType: string
  width?: number
  height?: number
}

export interface TemplateCollection {
  id: string
  title: string
  handle: string
  description?: string
}

export interface TemplateSearchFilters {
  categories: string[]
  tags: string[]
  priceRange: { min: number; max: number }
  searchQuery: string
}

/**
 * Convert Prisma ProductWithRelations to TemplateProduct
 */
export function adaptProductForTemplate(product: ProductWithRelations): TemplateProduct {
  const variants = product.variants || []
  const media = product.media || []
  
  // Calculate price range
  const prices = variants
    .filter(v => v.priceAmount)
    .map(v => parseFloat(v.priceAmount?.toString() || '0'))
  
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0
  
  // Get featured image (first media item)
  const featuredImage = media.length > 0 ? {
    url: media[0].url,
    altText: media[0].altText || product.title
  } : {
    url: '/img/placeholder.jpg',
    altText: product.title
  }
  
  // Extract tags
  const tags = product.productTags?.map(pt => pt.tag.name) || []
  
  // Extract collections
  const collections = product.productCollections?.map(pc => ({
    id: pc.collection.id.toString(),
    title: pc.collection.title,
    handle: pc.collection.handle,
    description: pc.collection.bodyHtml || undefined
  })) || []
  
  // Convert variants
  const templateVariants = variants.map(variant => ({
    id: variant.id.toString(),
    title: variant.title || 'Default',
    price: {
      amount: variant.priceAmount?.toString() || '0',
      currencyCode: variant.priceCurrency || 'USD'
    },
    compareAtPrice: variant.compareAtPriceAmount ? {
      amount: variant.compareAtPriceAmount.toString(),
      currencyCode: variant.compareAtPriceCurrency || 'USD'
    } : undefined,
    availableForSale: true, // Default to true, can be enhanced with inventory checks
    sku: variant.sku || undefined,
    weight: variant.weight || undefined,
    weightUnit: variant.weightUnit || undefined
  }))
  
  // Convert media
  const templateMedia = media.map(mediaItem => ({
    id: mediaItem.id.toString(),
    url: mediaItem.url,
    altText: mediaItem.altText || undefined,
    mediaType: mediaItem.mediaType,
    width: mediaItem.width || undefined,
    height: mediaItem.height || undefined
  }))
  
  return {
    id: product.id.toString(),
    title: product.title,
    handle: product.handle,
    description: product.bodyHtml || undefined,
    vendor: product.vendor || undefined,
    featuredImage,
    priceRange: {
      minVariantPrice: {
        amount: minPrice.toString(),
        currencyCode: 'USD'
      },
      maxVariantPrice: {
        amount: maxPrice.toString(),
        currencyCode: 'USD'
      }
    },
    variants: templateVariants,
    media: templateMedia,
    tags,
    collections,
    availableForSale: variants.some(v => true), // Simplified availability check
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString()
  }
}

/**
 * Convert multiple products for template use
 */
export function adaptProductsForTemplate(products: ProductWithRelations[]): TemplateProduct[] {
  return products.map(adaptProductForTemplate)
}

/**
 * Convert search filters to Prisma-compatible format
 */
export function convertSearchFiltersToPrisma(filters: TemplateSearchFilters) {
  const prismaFilters: any = {
    publishedOnly: true, // Only show published products
    deletedAt: null
  }
  
  // Add search query
  if (filters.searchQuery) {
    prismaFilters.search = filters.searchQuery
  }
  
  // Add category filter
  if (filters.categories.length > 0) {
    prismaFilters.category = filters.categories[0] // For now, use first category
  }
  
  // Add tags filter
  if (filters.tags.length > 0) {
    prismaFilters.tags = filters.tags
  }
  
  // Add price range filter
  if (filters.priceRange.min > 0 || filters.priceRange.max < 1000) {
    prismaFilters.priceRange = filters.priceRange
  }
  
  return prismaFilters
}

/**
 * Get featured products for homepage
 */
export async function getFeaturedProducts(prisma: PrismaClient, limit: number = 3): Promise<TemplateProduct[]> {
  try {
    const products = await prisma.product.findMany({
      where: {
        deletedAt: null,
        status: 'ACTIVE',
        publishedAt: { not: null }
      },
      take: limit,
      orderBy: [
        { updatedAt: 'desc' },
        { createdAt: 'desc' }
      ],
      include: {
        variants: true,
        media: {
          orderBy: { position: 'asc' },
          take: 1
        },
        productTags: {
          include: {
            tag: true
          }
        },
        productCollections: {
          include: {
            collection: true
          }
        }
      }
    })
    
    return adaptProductsForTemplate(products as ProductWithRelations[])
  } catch (error) {
    console.error('Error fetching featured products:', error)
    return []
  }
}

/**
 * Get products for shop page with pagination
 */
export async function getShopProducts(
  prisma: PrismaClient,
  page: number = 1,
  limit: number = 20,
  filters?: TemplateSearchFilters
): Promise<{
  products: TemplateProduct[]
  hasMore: boolean
  totalCount: number
}> {
  try {
    const skip = (page - 1) * limit
    const prismaFilters = filters ? convertSearchFiltersToPrisma(filters) : { publishedOnly: true, deletedAt: null }
    
    // Build where clause
    const where: any = {
      deletedAt: null,
      status: 'ACTIVE',
      publishedAt: { not: null }
    }
    
    // Add search query
    if (prismaFilters.search) {
      where.OR = [
        { title: { contains: prismaFilters.search, mode: 'insensitive' } },
        { bodyHtml: { contains: prismaFilters.search, mode: 'insensitive' } },
        { handle: { contains: prismaFilters.search, mode: 'insensitive' } },
        { vendor: { contains: prismaFilters.search, mode: 'insensitive' } }
      ]
    }
    
    // Add category filter
    if (prismaFilters.category) {
      where.productCollections = {
        some: {
          collection: {
            handle: prismaFilters.category
          }
        }
      }
    }
    
    // Add tags filter
    if (prismaFilters.tags && prismaFilters.tags.length > 0) {
      where.productTags = {
        some: {
          tag: {
            name: { in: prismaFilters.tags }
          }
        }
      }
    }
    
    // Add price range filter
    if (prismaFilters.priceRange) {
      where.variants = {
        some: {
          priceAmount: {
            gte: prismaFilters.priceRange.min.toString(),
            lte: prismaFilters.priceRange.max.toString()
          }
        }
      }
    }
    
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit + 1, // Take one extra to check if there are more
        orderBy: { updatedAt: 'desc' },
        include: {
          variants: true,
          media: {
            orderBy: { position: 'asc' }
          },
          productTags: {
            include: {
              tag: true
            }
          },
          productCollections: {
            include: {
              collection: true
            }
          }
        }
      }),
      prisma.product.count({ where })
    ])
    
    const hasMore = products.length > limit
    const resultProducts = hasMore ? products.slice(0, -1) : products
    
    return {
      products: adaptProductsForTemplate(resultProducts as ProductWithRelations[]),
      hasMore,
      totalCount
    }
  } catch (error) {
    console.error('Error fetching shop products:', error)
    return {
      products: [],
      hasMore: false,
      totalCount: 0
    }
  }
}


/**
 * Get collections for filter dropdowns
 */
export async function getTemplateCollections(prisma: PrismaClient) {
  try {
    const collections = await prisma.collection.findMany({
      where: {
        deletedAt: null
      },
      include: {
        _count: {
          select: {
            productCollections: true
          }
        }
      },
      orderBy: { title: 'asc' }
    })
    
    return collections.map(collection => ({
      id: collection.id.toString(),
      name: collection.title,
      handle: collection.handle,
      productCount: collection._count.productCollections,
      description: collection.bodyHtml || undefined
    }))
  } catch (error) {
    console.error('Error fetching collections:', error)
    return []
  }
}

/**
 * Get products by collection handle
 */
export async function getProductsByCollection(prisma: PrismaClient, collectionHandle: string, limit: number = 20, offset: number = 0): Promise<{ products: TemplateProduct[], total: number }> {
  try {
    // First, find the collection
    const collection = await prisma.collection.findUnique({
      where: {
        handle: collectionHandle,
        deletedAt: null
      }
    })

    if (!collection) {
      return { products: [], total: 0 }
    }

    // Get total count
    const total = await prisma.productCollection.count({
      where: {
        collectionId: collection.id,
        product: {
          deletedAt: null,
          status: 'ACTIVE',
          publishedAt: { not: null }
        }
      }
    })

    // Get products in this collection
    const productCollections = await prisma.productCollection.findMany({
      where: {
        collectionId: collection.id,
        product: {
          deletedAt: null,
          status: 'ACTIVE',
          publishedAt: { not: null }
        }
      },
      include: {
        product: {
          include: {
            variants: true,
            media: {
              orderBy: { position: 'asc' },
              take: 1
            },
            productTags: {
              include: {
                tag: true
              }
            },
            productCollections: {
              include: {
                collection: true
              }
            }
          }
        }
      },
      skip: offset,
      take: limit,
      orderBy: {
        product: {
          updatedAt: 'desc'
        }
      }
    })

    const products = productCollections.map(pc => pc.product as ProductWithRelations)
    
    return {
      products: adaptProductsForTemplate(products),
      total
    }
  } catch (error) {
    console.error('Error fetching products by collection:', error)
    return { products: [], total: 0 }
  }
}

/**
 * Get tags for filter dropdowns
 */
export async function getTemplateTags(prisma: PrismaClient) {
  try {
    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: {
            productTags: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })
    
    return tags.map(tag => ({
      id: tag.id.toString(),
      name: tag.name,
      productCount: tag._count.productTags
    }))
  } catch (error) {
    console.error('Error fetching tags:', error)
    return []
  }
}
