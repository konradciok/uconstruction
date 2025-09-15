/**
 * Cart Cleanup Service
 * 
 * Handles cleanup of expired carts and abandoned cart management.
 * Can be run as a scheduled job or triggered manually.
 */

import { PrismaClient } from '@/generated/prisma'
import { productLogger } from './logger'
import { CartService } from './cart-service'
// import type { CartStatus } from '@/types/cart'

export class CartCleanupService {
  private prisma: PrismaClient
  private cartService: CartService

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
    this.cartService = new CartService(prisma)
  }

  /**
   * Run full cart cleanup process
   */
  async runCleanup(): Promise<{
    expiredCarts: number
    abandonedCarts: number
    deletedCarts: number
    errors: string[]
  }> {
    const results = {
      expiredCarts: 0,
      abandonedCarts: 0,
      deletedCarts: 0,
      errors: [] as string[]
    }

    try {
      productLogger.info('Starting cart cleanup process')

      // 1. Mark expired carts as EXPIRED
      const expiredResult = await this.markExpiredCarts()
      results.expiredCarts = expiredResult.count
      if (expiredResult.error) {
        results.errors.push(expiredResult.error)
      }

      // 2. Mark abandoned carts as ABANDONED
      const abandonedResult = await this.markAbandonedCarts()
      results.abandonedCarts = abandonedResult.count
      if (abandonedResult.error) {
        results.errors.push(abandonedResult.error)
      }

      // 3. Delete very old expired carts (older than 90 days)
      const deletedResult = await this.deleteOldExpiredCarts()
      results.deletedCarts = deletedResult.count
      if (deletedResult.error) {
        results.errors.push(deletedResult.error)
      }

      productLogger.info('Cart cleanup completed', results)
      return results
    } catch (error) {
      productLogger.error('Error during cart cleanup', error)
      results.errors.push('Cleanup process failed')
      return results
    }
  }

  /**
   * Mark expired carts as EXPIRED
   */
  private async markExpiredCarts(): Promise<{ count: number; error?: string }> {
    try {
      const result = await this.prisma.cart.updateMany({
        where: {
          expiresAt: {
            lt: new Date()
          },
          status: 'ACTIVE'
        },
        data: {
          status: 'EXPIRED'
        }
      })

      productLogger.info(`Marked ${result.count} carts as expired`)
      return { count: result.count }
    } catch (error) {
      productLogger.error('Error marking expired carts', error)
      return { count: 0, error: 'Failed to mark expired carts' }
    }
  }

  /**
   * Mark abandoned carts as ABANDONED
   * Carts are considered abandoned if they haven't been updated in 7 days
   */
  private async markAbandonedCarts(): Promise<{ count: number; error?: string }> {
    try {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const result = await this.prisma.cart.updateMany({
        where: {
          updatedAt: {
            lt: sevenDaysAgo
          },
          status: 'ACTIVE',
          items: {
            some: {} // Only carts with items
          }
        },
        data: {
          status: 'ABANDONED'
        }
      })

      productLogger.info(`Marked ${result.count} carts as abandoned`)
      return { count: result.count }
    } catch (error) {
      productLogger.error('Error marking abandoned carts', error)
      return { count: 0, error: 'Failed to mark abandoned carts' }
    }
  }

  /**
   * Delete very old expired carts (older than 90 days)
   */
  private async deleteOldExpiredCarts(): Promise<{ count: number; error?: string }> {
    try {
      const ninetyDaysAgo = new Date()
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

      const result = await this.prisma.cart.deleteMany({
        where: {
          status: 'EXPIRED',
          expiresAt: {
            lt: ninetyDaysAgo
          }
        }
      })

      productLogger.info(`Deleted ${result.count} old expired carts`)
      return { count: result.count }
    } catch (error) {
      productLogger.error('Error deleting old expired carts', error)
      return { count: 0, error: 'Failed to delete old expired carts' }
    }
  }

  /**
   * Get cart analytics for monitoring
   */
  async getCartAnalytics(): Promise<{
    totalCarts: number
    activeCarts: number
    abandonedCarts: number
    expiredCarts: number
    convertedCarts: number
    averageCartValue: number
    averageItemsPerCart: number
  }> {
    try {
      const [
        totalCarts,
        activeCarts,
        abandonedCarts,
        expiredCarts,
        convertedCarts,
        cartStats
      ] = await Promise.all([
        this.prisma.cart.count(),
        this.prisma.cart.count({ where: { status: 'ACTIVE' } }),
        this.prisma.cart.count({ where: { status: 'ABANDONED' } }),
        this.prisma.cart.count({ where: { status: 'EXPIRED' } }),
        this.prisma.cart.count({ where: { status: 'CONVERTED' } }),
        this.prisma.cartItem.aggregate({
          where: { 
            cart: { status: 'ACTIVE' }
          },
          _count: {
            id: true
          },
          _sum: {
            price: true
          }
        })
      ])

      const averageCartValue = activeCarts > 0 
        ? Number(cartStats._sum.price || 0) / activeCarts 
        : 0

      const averageItemsPerCart = activeCarts > 0 
        ? (cartStats._count.id || 0) / activeCarts 
        : 0

      return {
        totalCarts,
        activeCarts,
        abandonedCarts,
        expiredCarts,
        convertedCarts,
        averageCartValue: Number(averageCartValue),
        averageItemsPerCart
      }
    } catch (error) {
      productLogger.error('Error getting cart analytics', error)
      return {
        totalCarts: 0,
        activeCarts: 0,
        abandonedCarts: 0,
        expiredCarts: 0,
        convertedCarts: 0,
        averageCartValue: 0,
        averageItemsPerCart: 0
      }
    }
  }

  /**
   * Get top products in carts
   */
  async getTopProductsInCarts(limit: number = 10): Promise<Array<{
    productId: number
    productTitle: string
    timesAdded: number
    totalQuantity: number
  }>> {
    try {
      const topProducts = await this.prisma.cartItem.groupBy({
        by: ['productId'],
        where: {
          cart: {
            status: 'ACTIVE'
          }
        },
        _count: {
          id: true
        },
        _sum: {
          quantity: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        },
        take: limit
      })

      // Get product titles
      const productIds = topProducts.map(p => p.productId)
      const products = await this.prisma.product.findMany({
        where: {
          id: {
            in: productIds
          }
        },
        select: {
          id: true,
          title: true
        }
      })

      const productMap = new Map(products.map(p => [p.id, p.title]))

      return topProducts.map(item => ({
        productId: item.productId,
        productTitle: productMap.get(item.productId) || 'Unknown Product',
        timesAdded: item._count.id,
        totalQuantity: item._sum.quantity || 0
      }))
    } catch (error) {
      productLogger.error('Error getting top products in carts', error)
      return []
    }
  }

  /**
   * Schedule cleanup job (placeholder for cron job integration)
   */
  static scheduleCleanup(prisma: PrismaClient, intervalHours: number = 24): void {
    const cleanupService = new CartCleanupService(prisma)
    
    // Run cleanup immediately
    cleanupService.runCleanup()
    
    // Schedule recurring cleanup
    setInterval(() => {
      cleanupService.runCleanup()
    }, intervalHours * 60 * 60 * 1000)

    productLogger.info(`Cart cleanup scheduled to run every ${intervalHours} hours`)
  }
}
