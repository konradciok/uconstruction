/**
 * Centralized Logging Utility
 * 
 * Provides consistent logging across the application with proper
 * log levels, formatting, and environment-based filtering.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogEntry {
  level: LogLevel
  message: string
  data?: any
  timestamp: string
  context?: string
}

export interface LoggerConfig {
  level: LogLevel
  enableConsole: boolean
  enableTimestamp: boolean
  enableContext: boolean
  maxDataDepth: number
}

class Logger {
  private config: LoggerConfig
  private context?: string

  constructor(config?: Partial<LoggerConfig>, context?: string) {
    this.config = {
      level: this.getLogLevelFromEnv(),
      enableConsole: true,
      enableTimestamp: true,
      enableContext: true,
      maxDataDepth: 3,
      ...config
    }
    this.context = context
  }

  /**
   * Create a child logger with additional context
   */
  child(context: string): Logger {
    const childContext = this.context ? `${this.context}:${context}` : context
    return new Logger(this.config, childContext)
  }

  /**
   * Debug level logging - detailed information for debugging
   */
  debug(message: string, data?: any): void {
    this.log('debug', message, data)
  }

  /**
   * Info level logging - general information
   */
  info(message: string, data?: any): void {
    this.log('info', message, data)
  }

  /**
   * Warning level logging - potentially harmful situations
   */
  warn(message: string, data?: any): void {
    this.log('warn', message, data)
  }

  /**
   * Error level logging - error events that might still allow the application to continue
   */
  error(message: string, data?: any): void {
    this.log('error', message, data)
  }

  /**
   * Log with specified level
   */
  private log(level: LogLevel, message: string, data?: any): void {
    if (!this.shouldLog(level)) {
      return
    }

    const entry: LogEntry = {
      level,
      message,
      data: this.sanitizeData(data),
      timestamp: new Date().toISOString(),
      context: this.context
    }

    if (this.config.enableConsole) {
      this.logToConsole(entry)
    }
  }

  /**
   * Check if the log level should be output
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error']
    const currentLevelIndex = levels.indexOf(this.config.level)
    const messageLevelIndex = levels.indexOf(level)
    
    return messageLevelIndex >= currentLevelIndex
  }

  /**
   * Log to console with appropriate method and formatting
   */
  private logToConsole(entry: LogEntry): void {
    const prefix = this.formatPrefix(entry)
    const args = [prefix, entry.message]
    
    if (entry.data !== undefined) {
      args.push(entry.data)
    }

    switch (entry.level) {
      case 'debug':
        console.debug(...args)
        break
      case 'info':
        console.info(...args)
        break
      case 'warn':
        console.warn(...args)
        break
      case 'error':
        console.error(...args)
        break
    }
  }

  /**
   * Format log prefix with timestamp and context
   */
  private formatPrefix(entry: LogEntry): string {
    const parts: string[] = []
    
    if (this.config.enableTimestamp) {
      parts.push(`[${entry.timestamp}]`)
    }
    
    parts.push(`[${entry.level.toUpperCase()}]`)
    
    if (this.config.enableContext && entry.context) {
      parts.push(`[${entry.context}]`)
    }
    
    return parts.join(' ')
  }

  /**
   * Sanitize data to prevent circular references and limit depth
   */
  private sanitizeData(data: any, depth = 0): any {
    if (depth >= this.config.maxDataDepth) {
      return '[Max Depth Reached]'
    }

    if (data === null || data === undefined) {
      return data
    }

    if (typeof data === 'function') {
      return '[Function]'
    }

    if (data instanceof Error) {
      return {
        name: data.name,
        message: data.message,
        stack: data.stack
      }
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item, depth + 1))
    }

    if (typeof data === 'object') {
      const sanitized: any = {}
      for (const [key, value] of Object.entries(data)) {
        try {
          sanitized[key] = this.sanitizeData(value, depth + 1)
        } catch {
          sanitized[key] = '[Circular Reference]'
        }
      }
      return sanitized
    }

    return data
  }

  /**
   * Get log level from environment variables
   */
  private getLogLevelFromEnv(): LogLevel {
    const envLevel = process.env.LOG_LEVEL?.toLowerCase()
    const validLevels: LogLevel[] = ['debug', 'info', 'warn', 'error']
    
    if (envLevel && validLevels.includes(envLevel as LogLevel)) {
      return envLevel as LogLevel
    }
    
    // Default based on NODE_ENV
    if (process.env.NODE_ENV === 'development') {
      return 'debug'
    }
    
    return 'info'
  }
}

// Create default logger instance
export const logger = new Logger()

// Create context-specific loggers
export const createLogger = (context: string) => logger.child(context)

// Convenience functions for common use cases
export const log = {
  debug: (message: string, data?: any) => logger.debug(message, data),
  info: (message: string, data?: any) => logger.info(message, data),
  warn: (message: string, data?: any) => logger.warn(message, data),
  error: (message: string, data?: any) => logger.error(message, data)
}

// Context-specific loggers for different parts of the application
export const appLogger = createLogger('app')
export const apiLogger = createLogger('api')
export const uploadLogger = createLogger('upload')
export const portfolioLogger = createLogger('portfolio')
export const workshopLogger = createLogger('workshop')
export const productLogger = createLogger('product')
