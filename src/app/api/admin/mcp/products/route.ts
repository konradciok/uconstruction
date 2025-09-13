import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'

    // Build where clause
    const where: {
      deletedAt: null
      status: 'ACTIVE'
      OR?: Array<{ title: { contains: string; mode: 'insensitive' } } | { handle: { contains: string; mode: 'insensitive' } }>
      stripeProductId?: { not: null } | null
    } = {
      deletedAt: null,
      status: 'ACTIVE'
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { handle: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status !== 'all') {
      switch (status) {
        case 'synced':
          where.stripeProductId = { not: null }
          break
        case 'pending':
          where.stripeProductId = null
          break
        case 'error':
          // For now, we'll consider products without stripeProductId as error
          // In a real implementation, you might have a separate error tracking
          where.stripeProductId = null
          break
      }
    }

    // Get products with pagination
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id: true,
          handle: true,
          title: true,
          stripeProductId: true,
          updatedAt: true
        },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.product.count({ where })
    ])

    // Transform products to include status
    const transformedProducts = products.map(product => ({
      id: product.id.toString(),
      handle: product.handle,
      title: product.title,
      stripeProductId: product.stripeProductId,
      lastSynced: product.stripeProductId ? product.updatedAt.toISOString() : null,
      status: product.stripeProductId ? 'synced' : 'pending'
    }))

    return NextResponse.json({
      products: transformedProducts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
