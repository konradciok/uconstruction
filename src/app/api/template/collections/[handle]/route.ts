/**
 * Template Collection Products API Endpoint
 * 
 * Provides template-compatible products by collection
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'
import { getProductsByCollection } from '@/lib/template-adapters'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  try {
    const { handle } = await params
    const { searchParams } = new URL(request.url)
    
    if (!handle) {
      return NextResponse.json(
        { error: 'Collection handle is required' },
        { status: 400 }
      )
    }
    
    // Parse query parameters
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    const result = await getProductsByCollection(prisma, handle, limit, offset)
    
    return NextResponse.json({
      products: result.products,
      total: result.total,
      limit,
      offset,
      hasMore: offset + limit < result.total
    })
  } catch (error) {
    console.error(`Error fetching products for collection:`, error)
    return NextResponse.json(
      { error: 'Failed to fetch collection products' },
      { status: 500 }
    )
  }
}
