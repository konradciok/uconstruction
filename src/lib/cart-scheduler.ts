/**
 * Cart Scheduler
 * 
 * Handles automated cart cleanup and maintenance tasks.
 * Provides scheduling for cart expiration, cleanup, and analytics.
 */

import { PrismaClient } from '@/generated/prisma'
import { CartCleanupService } from './cart-cleanup'
import { cartCache } from './cart-cache'
import { productLogger } from './logger'

export class CartScheduler {
  private prisma: PrismaClient
  private cleanupService: CartCleanupService
  private intervals: NodeJS.Timeout[] = []
  private isRunning = false

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
    this.cleanupService = new CartCleanupService(prisma)
  }

  /**
   * Start all scheduled tasks
   */
  start(): void {
    if (this.isRunning) {
      productLogger.warn('Cart scheduler is already running')
      return
    }

    this.isRunning = true
    productLogger.info('Starting cart scheduler...')

    // Run cleanup every hour
    this.intervals.push(
      setInterval(() => {
        this.runCleanup()
      }, 60 * 60 * 1000) // 1 hour
    )

    // Run cache cleanup every 5 minutes
    this.intervals.push(
      setInterval(() => {
        this.runCacheCleanup()
      }, 5 * 60 * 1000) // 5 minutes
    )

    // Run analytics collection every 6 hours
    this.intervals.push(
      setInterval(() => {
        this.runAnalytics()
      }, 6 * 60 * 60 * 1000) // 6 hours
    )

    // Run initial cleanup
    this.runCleanup()
    this.runCacheCleanup()

    productLogger.info('Cart scheduler started successfully')
  }

  /**
   * Stop all scheduled tasks
   */
  stop(): void {
    if (!this.isRunning) {
      productLogger.warn('Cart scheduler is not running')
      return
    }

    this.isRunning = false
    productLogger.info('Stopping cart scheduler...')

    this.intervals.forEach(interval => clearInterval(interval))
    this.intervals = []

    productLogger.info('Cart scheduler stopped')
  }

  /**
   * Run cart cleanup
   */
  async runCleanup(): Promise<void> {
    try {
      productLogger.info('Running cart cleanup...')
      
      const results = await this.cleanupService.runCleanup()
      
      productLogger.info('Cart cleanup completed', {
        expiredCarts: results.expiredCarts,
        abandonedCarts: results.abandonedCarts,
        deletedCarts: results.deletedCarts,
        errors: results.errors.length
      })

      if (results.errors.length > 0) {
        productLogger.error('Cart cleanup errors', results.errors)
      }
    } catch (error) {
      productLogger.error('Error running cart cleanup', error)
    }
  }

  /**
   * Run cache cleanup
   */
  async runCacheCleanup(): Promise<void> {
    try {
      const cleaned = cartCache.cleanup()
      
      if (cleaned > 0) {
        productLogger.info(`Cache cleanup: Removed ${cleaned} expired entries`)
      }

      const stats = cartCache.getStats()
      if (stats.size > 0) {
        productLogger.debug('Cache stats', {
          size: stats.size,
          hits: stats.hits,
          misses: stats.misses,
          hitRate: stats.hits / (stats.hits + stats.misses) * 100
        })
      }
    } catch (error) {
      productLogger.error('Error running cache cleanup', error)
    }
  }

  /**
   * Run analytics collection
   */
  async runAnalytics(): Promise<void> {
    try {
      productLogger.info('Running cart analytics...')
      
      const analytics = await this.cleanupService.getCartAnalytics()
      const topProducts = await this.cleanupService.getTopProductsInCarts(10)
      
      productLogger.info('Cart analytics collected', {
        totalCarts: analytics.totalCarts,
        activeCarts: analytics.activeCarts,
        abandonedCarts: analytics.abandonedCarts,
        averageCartValue: analytics.averageCartValue,
        topProducts: topProducts.slice(0, 5).map(p => ({
          product: p.productTitle,
          timesAdded: p.timesAdded
        }))
      })
    } catch (error) {
      productLogger.error('Error running cart analytics', error)
    }
  }

  /**
   * Get scheduler status
   */
  getStatus(): {
    isRunning: boolean
    activeIntervals: number
    cacheStats: ReturnType<typeof cartCache.getStats>
  } {
    return {
      isRunning: this.isRunning,
      activeIntervals: this.intervals.length,
      cacheStats: cartCache.getStats()
    }
  }

  /**
   * Force run all tasks (for testing)
   */
  async runAllTasks(): Promise<void> {
    productLogger.info('Running all cart tasks manually...')
    
    await Promise.all([
      this.runCleanup(),
      this.runCacheCleanup(),
      this.runAnalytics()
    ])
    
    productLogger.info('All cart tasks completed')
  }

  /**
   * Get cache performance metrics
   */
  getCacheMetrics(): {
    hitRate: number
    missRate: number
    evictionRate: number
    size: number
    maxSize: number
  } {
    const stats = cartCache.getStats()
    const total = stats.hits + stats.misses
    
    return {
      hitRate: total > 0 ? (stats.hits / total) * 100 : 0,
      missRate: total > 0 ? (stats.misses / total) * 100 : 0,
      evictionRate: total > 0 ? (stats.evictions / total) * 100 : 0,
      size: stats.size,
      maxSize: stats.maxSize
    }
  }

  /**
   * Reset cache statistics
   */
  resetCacheStats(): void {
    cartCache.resetStats()
    productLogger.info('Cache statistics reset')
  }
}

// Global scheduler instance
let cartScheduler: CartScheduler | null = null

/**
 * Get or create the global cart scheduler
 */
export function getCartScheduler(prisma: PrismaClient): CartScheduler {
  if (!cartScheduler) {
    cartScheduler = new CartScheduler(prisma)
  }
  return cartScheduler
}

/**
 * Start the global cart scheduler
 */
export function startCartScheduler(prisma: PrismaClient): void {
  const scheduler = getCartScheduler(prisma)
  scheduler.start()
}

/**
 * Stop the global cart scheduler
 */
export function stopCartScheduler(): void {
  if (cartScheduler) {
    cartScheduler.stop()
    cartScheduler = null
  }
}
