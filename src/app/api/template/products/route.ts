/**
 * Template Products API Endpoint
 * 
 * Provides template-compatible product data through REST API
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import {
  getShopProducts,
  getFeaturedProducts,
  TemplateSearchFilters
} from '@/lib/template-adapters'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const featured = searchParams.get('featured') === 'true'
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const tags = searchParams.get('tags')?.split(',') || []
    const minPrice = parseFloat(searchParams.get('minPrice') || '0')
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '1000')
    
    // Build filters
    const filters: TemplateSearchFilters = {
      categories: category ? [category] : [],
      tags,
      priceRange: { min: minPrice, max: maxPrice },
      searchQuery: search
    }
    
    let result
    
    if (featured) {
      // Get featured products for homepage
      const featuredProducts = await getFeaturedProducts(prisma, limit)
      result = {
        products: featuredProducts,
        hasMore: false,
        totalCount: featuredProducts.length,
        page: 1,
        limit
      }
    } else {
      // Get regular shop products
      const shopResult = await getShopProducts(prisma, page, limit, filters)
      result = {
        products: shopResult.products,
        hasMore: shopResult.hasMore,
        totalCount: shopResult.totalCount,
        page,
        limit
      }
    }
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in template products API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { search, filters, page = 1, limit = 20 } = body
    
    // Build search filters
    const searchFilters: TemplateSearchFilters = {
      categories: filters?.categories || [],
      tags: filters?.tags || [],
      priceRange: filters?.priceRange || { min: 0, max: 1000 },
      searchQuery: search || ''
    }
    
    const result = await getShopProducts(prisma, page, limit, searchFilters)
    
    return NextResponse.json({
      products: result.products,
      hasMore: result.hasMore,
      totalCount: result.totalCount,
      page,
      limit
    })
  } catch (error) {
    console.error('Error in template products search API:', error)
    return NextResponse.json(
      { error: 'Failed to search products' },
      { status: 500 }
    )
  }
}
