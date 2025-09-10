/**
 * Cart Error Monitor
 * 
 * Provides comprehensive error monitoring and alerting for cart operations.
 * Tracks errors, performance issues, and system health.
 */

import { productLogger } from './logger'

export interface ErrorEvent {
  id: string
  timestamp: Date
  level: 'error' | 'warning' | 'info'
  category: 'cart' | 'database' | 'cache' | 'api' | 'validation'
  message: string
  details?: Record<string, unknown>
  stack?: string
  sessionId?: string
  userId?: string
  operation?: string
  responseTime?: number
}

export interface ErrorStats {
  totalErrors: number
  errorsByCategory: Record<string, number>
  errorsByLevel: Record<string, number>
  averageResponseTime: number
  errorRate: number
  recentErrors: ErrorEvent[]
}

export interface AlertRule {
  id: string
  name: string
  condition: (stats: ErrorStats) => boolean
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  enabled: boolean
}

export class CartErrorMonitor {
  private errors: ErrorEvent[] = []
  private maxErrors = 1000 // Keep last 1000 errors
  private alertRules: AlertRule[] = []
  private isMonitoring = false

  constructor() {
    this.setupDefaultAlertRules()
  }

  /**
   * Start error monitoring
   */
  start(): void {
    if (this.isMonitoring) {
      productLogger.warn('Error monitoring is already running')
      return
    }

    this.isMonitoring = true
    productLogger.info('Starting cart error monitoring...')

    // Check for alerts every minute
    setInterval(() => {
      this.checkAlerts()
    }, 60 * 1000)

    productLogger.info('Cart error monitoring started')
  }

  /**
   * Stop error monitoring
   */
  stop(): void {
    this.isMonitoring = false
    productLogger.info('Cart error monitoring stopped')
  }

  /**
   * Record an error event
   */
  recordError(
    level: ErrorEvent['level'],
    category: ErrorEvent['category'],
    message: string,
    details?: Record<string, unknown>,
    context?: {
      sessionId?: string
      userId?: string
      operation?: string
      responseTime?: number
    }
  ): void {
    const errorEvent: ErrorEvent = {
      id: this.generateErrorId(),
      timestamp: new Date(),
      level,
      category,
      message,
      details,
      stack: details?.stack as string,
      sessionId: context?.sessionId,
      userId: context?.userId,
      operation: context?.operation,
      responseTime: context?.responseTime
    }

    this.errors.push(errorEvent)

    // Keep only the most recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors)
    }

    // Log the error
    this.logError(errorEvent)

    // Check for immediate alerts
    this.checkImmediateAlerts(errorEvent)
  }

  /**
   * Record a cart operation error
   */
  recordCartError(
    operation: string,
    error: Error,
    context?: {
      sessionId?: string
      userId?: string
      responseTime?: number
    }
  ): void {
    this.recordError(
      'error',
      'cart',
      `Cart operation failed: ${operation}`,
      {
        error: error.message,
        stack: error.stack,
        operation
      },
      context
    )
  }

  /**
   * Record a database error
   */
  recordDatabaseError(
    operation: string,
    error: Error,
    context?: {
      sessionId?: string
      responseTime?: number
    }
  ): void {
    this.recordError(
      'error',
      'database',
      `Database operation failed: ${operation}`,
      {
        error: error.message,
        stack: error.stack,
        operation
      },
      context
    )
  }

  /**
   * Record a cache error
   */
  recordCacheError(
    operation: string,
    error: Error,
    context?: {
      sessionId?: string
    }
  ): void {
    this.recordError(
      'warning',
      'cache',
      `Cache operation failed: ${operation}`,
      {
        error: error.message,
        stack: error.stack,
        operation
      },
      context
    )
  }

  /**
   * Record an API error
   */
  recordApiError(
    endpoint: string,
    statusCode: number,
    error: Error,
    context?: {
      sessionId?: string
      userId?: string
      responseTime?: number
    }
  ): void {
    this.recordError(
      'error',
      'api',
      `API endpoint failed: ${endpoint}`,
      {
        error: error.message,
        statusCode,
        endpoint
      },
      context
    )
  }

  /**
   * Record a validation error
   */
  recordValidationError(
    field: string,
    value: unknown,
    rule: string,
    context?: {
      sessionId?: string
      userId?: string
    }
  ): void {
    this.recordError(
      'warning',
      'validation',
      `Validation failed: ${field}`,
      {
        field,
        value,
        rule
      },
      context
    )
  }

  /**
   * Record a performance warning
   */
  recordPerformanceWarning(
    operation: string,
    responseTime: number,
    threshold: number,
    context?: {
      sessionId?: string
    }
  ): void {
    this.recordError(
      'warning',
      'cart',
      `Slow operation: ${operation}`,
      {
        operation,
        responseTime,
        threshold,
        performance: true
      },
      context
    )
  }

  /**
   * Get error statistics
   */
  getErrorStats(): ErrorStats {
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    
    const recentErrors = this.errors.filter(error => error.timestamp > oneHourAgo)
    
    const errorsByCategory = this.errors.reduce((acc, error) => {
      acc[error.category] = (acc[error.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const errorsByLevel = this.errors.reduce((acc, error) => {
      acc[error.level] = (acc[error.level] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const responseTimes = this.errors
      .filter(error => error.responseTime !== undefined)
      .map(error => error.responseTime!)

    const averageResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0

    const errorRate = recentErrors.length / Math.max(1, this.getOperationCount())

    return {
      totalErrors: this.errors.length,
      errorsByCategory,
      errorsByLevel,
      averageResponseTime,
      errorRate,
      recentErrors: recentErrors.slice(-10) // Last 10 errors
    }
  }

  /**
   * Get errors by category
   */
  getErrorsByCategory(category: ErrorEvent['category'], limit = 50): ErrorEvent[] {
    return this.errors
      .filter(error => error.category === category)
      .slice(-limit)
  }

  /**
   * Get errors by level
   */
  getErrorsByLevel(level: ErrorEvent['level'], limit = 50): ErrorEvent[] {
    return this.errors
      .filter(error => error.level === level)
      .slice(-limit)
  }

  /**
   * Get recent errors
   */
  getRecentErrors(limit = 50): ErrorEvent[] {
    return this.errors.slice(-limit)
  }

  /**
   * Clear old errors
   */
  clearOldErrors(olderThanHours = 24): void {
    const cutoff = new Date(Date.now() - olderThanHours * 60 * 60 * 1000)
    const initialCount = this.errors.length
    
    this.errors = this.errors.filter(error => error.timestamp > cutoff)
    
    const clearedCount = initialCount - this.errors.length
    if (clearedCount > 0) {
      productLogger.info(`Cleared ${clearedCount} old error events`)
    }
  }

  /**
   * Add custom alert rule
   */
  addAlertRule(rule: AlertRule): void {
    this.alertRules.push(rule)
    productLogger.info(`Added alert rule: ${rule.name}`)
  }

  /**
   * Remove alert rule
   */
  removeAlertRule(ruleId: string): void {
    const initialLength = this.alertRules.length
    this.alertRules = this.alertRules.filter(rule => rule.id !== ruleId)
    
    if (this.alertRules.length < initialLength) {
      productLogger.info(`Removed alert rule: ${ruleId}`)
    }
  }

  /**
   * Get all alert rules
   */
  getAlertRules(): AlertRule[] {
    return [...this.alertRules]
  }

  /**
   * Check for alerts
   */
  private checkAlerts(): void {
    if (!this.isMonitoring) return

    const stats = this.getErrorStats()
    
    for (const rule of this.alertRules) {
      if (!rule.enabled) continue
      
      try {
        if (rule.condition(stats)) {
          this.triggerAlert(rule, stats)
        }
      } catch (error) {
        productLogger.error('Error checking alert rule', { ruleId: rule.id, error })
      }
    }
  }

  /**
   * Check for immediate alerts
   */
  private checkImmediateAlerts(error: ErrorEvent): void {
    // Check for critical errors that need immediate attention
    if (error.level === 'error' && error.category === 'database') {
      this.triggerAlert({
        id: 'immediate-db-error',
        name: 'Immediate Database Error',
        condition: () => true,
        message: 'Critical database error detected',
        severity: 'critical',
        enabled: true
      }, this.getErrorStats())
    }
  }

  /**
   * Trigger an alert
   */
  private triggerAlert(rule: AlertRule, stats: ErrorStats): void {
    const alertMessage = `${rule.name}: ${rule.message}`
    
    productLogger.error(alertMessage, {
      severity: rule.severity,
      ruleId: rule.id,
      stats: {
        totalErrors: stats.totalErrors,
        errorRate: stats.errorRate,
        recentErrors: stats.recentErrors.length
      }
    })

    // In a real implementation, you would send alerts to:
    // - Email notifications
    // - Slack/Discord webhooks
    // - PagerDuty
    // - Monitoring dashboards
  }

  /**
   * Setup default alert rules
   */
  private setupDefaultAlertRules(): void {
    this.alertRules = [
      {
        id: 'high-error-rate',
        name: 'High Error Rate',
        condition: (stats) => stats.errorRate > 0.1,
        message: 'Error rate is high',
        severity: 'high',
        enabled: true
      },
      {
        id: 'database-errors',
        name: 'Database Errors',
        condition: (stats) => stats.errorsByCategory.database > 10,
        message: 'Too many database errors',
        severity: 'critical',
        enabled: true
      },
      {
        id: 'slow-response',
        name: 'Slow Response Time',
        condition: (stats) => stats.averageResponseTime > 2000,
        message: 'Average response time is too high',
        severity: 'medium',
        enabled: true
      },
      {
        id: 'cart-errors',
        name: 'Cart Operation Errors',
        condition: (stats) => stats.errorsByCategory.cart > 20,
        message: 'Too many cart errors',
        severity: 'high',
        enabled: true
      }
    ]
  }

  /**
   * Log error event
   */
  private logError(error: ErrorEvent): void {
    const logData = {
      id: error.id,
      level: error.level,
      category: error.category,
      message: error.message,
      sessionId: error.sessionId,
      userId: error.userId,
      operation: error.operation,
      responseTime: error.responseTime,
      timestamp: error.timestamp
    }

    switch (error.level) {
      case 'error':
        productLogger.error(error.message, logData)
        break
      case 'warning':
        productLogger.warn(error.message, logData)
        break
      case 'info':
        productLogger.info(error.message, logData)
        break
    }
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Get operation count (simplified)
   */
  private getOperationCount(): number {
    // In a real implementation, this would track actual operation counts
    return Math.max(1, this.errors.length * 10)
  }
}

// Global error monitor instance
export const cartErrorMonitor = new CartErrorMonitor()
