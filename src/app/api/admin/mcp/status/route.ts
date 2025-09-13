import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Get PostgreSQL stats
    const totalProducts = await prisma.product.count({
      where: {
        deletedAt: null,
        status: 'ACTIVE'
      }
    })

    const syncedProducts = await prisma.product.count({
      where: {
        deletedAt: null,
        status: 'ACTIVE',
        stripeProductId: { not: null }
      }
    })

    const lastPostgresSync = await prisma.product.findFirst({
      where: {
        stripeProductId: { not: null }
      },
      orderBy: { updatedAt: 'desc' },
      select: { updatedAt: true }
    })

    // For Stripe stats, we'll use a simple approach
    // In production, you might want to cache this or use a different approach
    const stripeStats = {
      totalProducts: 0, // This would need to be fetched from Stripe API
      lastSync: null
    }

    // Calculate sync percentage
    const syncPercentage = totalProducts > 0 ? Math.round((syncedProducts / totalProducts) * 100) : 0

    const status = {
      postgres: {
        totalProducts,
        syncedProducts,
        lastSync: lastPostgresSync?.updatedAt?.toISOString() || null
      },
      stripe: stripeStats,
      syncStatus: {
        percentage: syncPercentage,
        lastFullSync: lastPostgresSync?.updatedAt?.toISOString() || null
      }
    }

    return NextResponse.json(status)
  } catch (error) {
    console.error('Error fetching MCP status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch MCP status' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
