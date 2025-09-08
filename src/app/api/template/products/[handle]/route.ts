/**
 * Template Product Detail API Endpoint
 * 
 * Provides template-compatible product detail data
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'
import { getProductByHandle } from '@/lib/template-adapters'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  try {
    const { handle } = await params
    
    if (!handle) {
      return NextResponse.json(
        { error: 'Product handle is required' },
        { status: 400 }
      )
    }
    
    const product = await getProductByHandle(prisma, handle)
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(product)
  } catch (error) {
    console.error(`Error fetching product:`, error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}
