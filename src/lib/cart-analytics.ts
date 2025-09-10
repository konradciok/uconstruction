/**
 * Cart Analytics Service
 * 
 * Provides comprehensive analytics and monitoring for cart operations.
 * Tracks cart performance, user behavior, and system health.
 */

import { PrismaClient } from '@/generated/prisma'
import { productLogger } from './logger'
import { cartCache } from './cart-cache'
import type { CartAnalytics } from '@/types/cart'

export interface CartMetrics {
  // Cart counts
  totalCarts: number
  activeCarts: number
  abandonedCarts: number
  expiredCarts: number
  convertedCarts: number
  
  // Cart values
  averageCartValue: number
  medianCartValue: number
  totalCartValue: number
  
  // Cart items
  averageItemsPerCart: number
  totalItemsInCarts: number
  
  // Performance metrics
  cacheHitRate: number
  averageResponseTime: number
  
  // Time-based metrics
  cartsCreatedToday: number
  cartsAbandonedToday: number
  cartsConvertedToday: number
}

export interface CartTrends {
  dailyCarts: Array<{
    date: string
    created: number
    abandoned: number
    converted: number
  }>
  hourlyActivity: Array<{
    hour: number
    cartOperations: number
  }>
  topProducts: Array<{
    productId: number
    productTitle: string
    timesAdded: number
    totalQuantity: number
    conversionRate: number
  }>
  cartValueDistribution: Array<{
    range: string
    count: number
    percentage: number
  }>
}

export interface CartHealthCheck {
  status: 'healthy' | 'warning' | 'critical'
  issues: string[]
  recommendations: string[]
  metrics: {
    errorRate: number
    responseTime: number
    cachePerformance: number
    databaseHealth: number
  }
}

export class CartAnalyticsService {
  private prisma: PrismaClient
  private responseTimes: number[] = []
  private errorCount = 0
  private operationCount = 0

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  /**
   * Get comprehensive cart metrics
   */
  async getCartMetrics(): Promise<CartMetrics> {
    try {
      const [
        cartCounts,
        cartValues,
        itemCounts,
        todayStats,
        cacheStats
      ] = await Promise.all([
        this.getCartCounts(),
        this.getCartValues(),
        this.getItemCounts(),
        this.getTodayStats(),
        this.getCacheStats()
      ])

      return {
        ...cartCounts,
        ...cartValues,
        ...itemCounts,
        ...todayStats,
        cacheHitRate: cacheStats.hitRate,
        averageResponseTime: this.getAverageResponseTime()
      }
    } catch (error) {
      productLogger.error('Error getting cart metrics', error)
      throw error
    }
  }

  /**
   * Get cart trends over time
   */
  async getCartTrends(days: number = 30): Promise<CartTrends> {
    try {
      const [dailyCarts, hourlyActivity, topProducts, valueDistribution] = await Promise.all([
        this.getDailyCarts(days),
        this.getHourlyActivity(),
        this.getTopProducts(10),
        this.getCartValueDistribution()
      ])

      return {
        dailyCarts,
        hourlyActivity,
        topProducts,
        cartValueDistribution: valueDistribution
      }
    } catch (error) {
      productLogger.error('Error getting cart trends', error)
      throw error
    }
  }

  /**
   * Perform cart system health check
   */
  async performHealthCheck(): Promise<CartHealthCheck> {
    try {
      const issues: string[] = []
      const recommendations: string[] = []

      // Check error rate
      const errorRate = this.getErrorRate()
      if (errorRate > 0.1) {
        issues.push(`High error rate: ${(errorRate * 100).toFixed(1)}%`)
        recommendations.push('Investigate error sources and improve error handling')
      }

      // Check response time
      const avgResponseTime = this.getAverageResponseTime()
      if (avgResponseTime > 1000) {
        issues.push(`Slow response time: ${avgResponseTime.toFixed(0)}ms`)
        recommendations.push('Optimize database queries and consider caching improvements')
      }

      // Check cache performance
      const cacheStats = cartCache.getStats()
      const hitRate = cacheStats.hits / (cacheStats.hits + cacheStats.misses) || 0
      if (hitRate < 0.5) {
        issues.push(`Low cache hit rate: ${(hitRate * 100).toFixed(1)}%`)
        recommendations.push('Review cache configuration and TTL settings')
      }

      // Check database health
      const dbHealth = await this.checkDatabaseHealth()
      if (dbHealth < 0.8) {
        issues.push('Database performance issues detected')
        recommendations.push('Check database indexes and query optimization')
      }

      // Determine overall status
      let status: 'healthy' | 'warning' | 'critical' = 'healthy'
      if (issues.length > 2 || errorRate > 0.2) {
        status = 'critical'
      } else if (issues.length > 0 || errorRate > 0.05) {
        status = 'warning'
      }

      return {
        status,
        issues,
        recommendations,
        metrics: {
          errorRate,
          responseTime: avgResponseTime,
          cachePerformance: hitRate,
          databaseHealth: dbHealth
        }
      }
    } catch (error) {
      productLogger.error('Error performing health check', error)
      return {
        status: 'critical',
        issues: ['Health check failed'],
        recommendations: ['Investigate system issues'],
        metrics: {
          errorRate: 1,
          responseTime: 0,
          cachePerformance: 0,
          databaseHealth: 0
        }
      }
    }
  }

  /**
   * Record cart operation for analytics
   */
  recordOperation(operation: string, responseTime: number, success: boolean): void {
    this.responseTimes.push(responseTime)
    this.operationCount++
    
    if (!success) {
      this.errorCount++
    }

    // Keep only last 1000 operations for rolling average
    if (this.responseTimes.length > 1000) {
      this.responseTimes = this.responseTimes.slice(-1000)
    }

    productLogger.debug('Cart operation recorded', {
      operation,
      responseTime,
      success,
      totalOperations: this.operationCount
    })
  }

  /**
   * Get cart counts by status
   */
  private async getCartCounts(): Promise<Pick<CartMetrics, 'totalCarts' | 'activeCarts' | 'abandonedCarts' | 'expiredCarts' | 'convertedCarts'>> {
    const [total, active, abandoned, expired, converted] = await Promise.all([
      this.prisma.cart.count(),
      this.prisma.cart.count({ where: { status: 'ACTIVE' } }),
      this.prisma.cart.count({ where: { status: 'ABANDONED' } }),
      this.prisma.cart.count({ where: { status: 'EXPIRED' } }),
      this.prisma.cart.count({ where: { status: 'CONVERTED' } })
    ])

    return {
      totalCarts: total,
      activeCarts: active,
      abandonedCarts: abandoned,
      expiredCarts: expired,
      convertedCarts: converted
    }
  }

  /**
   * Get cart value statistics
   */
  private async getCartValues(): Promise<Pick<CartMetrics, 'averageCartValue' | 'medianCartValue' | 'totalCartValue'>> {
    const activeCarts = await this.prisma.cart.findMany({
      where: { status: 'ACTIVE' },
      include: {
        items: {
          select: {
            price: true,
            quantity: true
          }
        }
      }
    })

    const cartValues = activeCarts.map(cart => 
      cart.items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0)
    )

    const totalValue = cartValues.reduce((sum, value) => sum + value, 0)
    const averageValue = cartValues.length > 0 ? totalValue / cartValues.length : 0
    
    // Calculate median
    const sortedValues = cartValues.sort((a, b) => a - b)
    const medianValue = sortedValues.length > 0 
      ? sortedValues[Math.floor(sortedValues.length / 2)]
      : 0

    return {
      averageCartValue: averageValue,
      medianCartValue: medianValue,
      totalCartValue: totalValue
    }
  }

  /**
   * Get item count statistics
   */
  private async getItemCounts(): Promise<Pick<CartMetrics, 'averageItemsPerCart' | 'totalItemsInCarts'>> {
    const [totalItems, activeCarts] = await Promise.all([
      this.prisma.cartItem.count({
        where: {
          cart: { status: 'ACTIVE' }
        }
      }),
      this.prisma.cart.count({
        where: { status: 'ACTIVE' }
      })
    ])

    return {
      averageItemsPerCart: activeCarts > 0 ? totalItems / activeCarts : 0,
      totalItemsInCarts: totalItems
    }
  }

  /**
   * Get today's statistics
   */
  private async getTodayStats(): Promise<Pick<CartMetrics, 'cartsCreatedToday' | 'cartsAbandonedToday' | 'cartsConvertedToday'>> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const [created, abandoned, converted] = await Promise.all([
      this.prisma.cart.count({
        where: {
          createdAt: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      this.prisma.cart.count({
        where: {
          status: 'ABANDONED',
          updatedAt: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      this.prisma.cart.count({
        where: {
          status: 'CONVERTED',
          updatedAt: {
            gte: today,
            lt: tomorrow
          }
        }
      })
    ])

    return {
      cartsCreatedToday: created,
      cartsAbandonedToday: abandoned,
      cartsConvertedToday: converted
    }
  }

  /**
   * Get cache statistics
   */
  private getCacheStats(): { hitRate: number } {
    const stats = cartCache.getStats()
    const total = stats.hits + stats.misses
    return {
      hitRate: total > 0 ? stats.hits / total : 0
    }
  }

  /**
   * Get daily cart statistics
   */
  private async getDailyCarts(days: number): Promise<CartTrends['dailyCarts']> {
    const results = []
    const today = new Date()
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)

      const [created, abandoned, converted] = await Promise.all([
        this.prisma.cart.count({
          where: {
            createdAt: {
              gte: date,
              lt: nextDate
            }
          }
        }),
        this.prisma.cart.count({
          where: {
            status: 'ABANDONED',
            updatedAt: {
              gte: date,
              lt: nextDate
            }
          }
        }),
        this.prisma.cart.count({
          where: {
            status: 'CONVERTED',
            updatedAt: {
              gte: date,
              lt: nextDate
            }
          }
        })
      ])

      results.push({
        date: date.toISOString().split('T')[0],
        created,
        abandoned,
        converted
      })
    }

    return results
  }

  /**
   * Get hourly activity patterns
   */
  private async getHourlyActivity(): Promise<CartTrends['hourlyActivity']> {
    const results = []
    
    for (let hour = 0; hour < 24; hour++) {
      const count = await this.prisma.cart.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      })

      results.push({
        hour,
        cartOperations: count // Simplified for now
      })
    }

    return results
  }

  /**
   * Get top products in carts
   */
  private async getTopProducts(limit: number): Promise<CartTrends['topProducts']> {
    const topProducts = await this.prisma.cartItem.groupBy({
      by: ['productId'],
      where: {
        cart: { status: 'ACTIVE' }
      },
      _count: { id: true },
      _sum: { quantity: true },
      orderBy: {
        _count: { id: 'desc' }
      },
      take: limit
    })

    const productIds = topProducts.map(p => p.productId)
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, title: true }
    })

    const productMap = new Map(products.map(p => [p.id, p.title]))

    return topProducts.map(item => ({
      productId: item.productId,
      productTitle: productMap.get(item.productId) || 'Unknown Product',
      timesAdded: item._count.id,
      totalQuantity: item._sum.quantity || 0,
      conversionRate: 0 // Would need additional data to calculate
    }))
  }

  /**
   * Get cart value distribution
   */
  private async getCartValueDistribution(): Promise<CartTrends['cartValueDistribution']> {
    const activeCarts = await this.prisma.cart.findMany({
      where: { status: 'ACTIVE' },
      include: {
        items: {
          select: {
            price: true,
            quantity: true
          }
        }
      }
    })

    const cartValues = activeCarts.map(cart => 
      cart.items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0)
    )

    const ranges = [
      { min: 0, max: 25, label: '$0-$25' },
      { min: 25, max: 50, label: '$25-$50' },
      { min: 50, max: 100, label: '$50-$100' },
      { min: 100, max: 200, label: '$100-$200' },
      { min: 200, max: Infinity, label: '$200+' }
    ]

    const distribution = ranges.map(range => {
      const count = cartValues.filter(value => value >= range.min && value < range.max).length
      const percentage = cartValues.length > 0 ? (count / cartValues.length) * 100 : 0
      
      return {
        range: range.label,
        count,
        percentage
      }
    })

    return distribution
  }

  /**
   * Check database health
   */
  private async checkDatabaseHealth(): Promise<number> {
    try {
      const start = Date.now()
      await this.prisma.cart.count()
      const responseTime = Date.now() - start
      
      // Health score based on response time (0-1 scale)
      if (responseTime < 100) return 1
      if (responseTime < 500) return 0.8
      if (responseTime < 1000) return 0.6
      return 0.3
    } catch {
      return 0
    }
  }

  /**
   * Get average response time
   */
  private getAverageResponseTime(): number {
    if (this.responseTimes.length === 0) return 0
    return this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length
  }

  /**
   * Get error rate
   */
  private getErrorRate(): number {
    if (this.operationCount === 0) return 0
    return this.errorCount / this.operationCount
  }
}
