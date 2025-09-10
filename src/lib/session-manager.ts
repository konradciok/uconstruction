/**
 * Session Manager
 * 
 * Handles session ID generation, validation, and cart session management.
 * Provides utilities for managing user sessions and cart associations.
 */

import { randomBytes } from 'crypto'
import { productLogger } from './logger'
import type { SessionInfo } from '@/types/cart'

export class SessionManager {
  private static readonly SESSION_ID_LENGTH = 32
  private static readonly SESSION_COOKIE_NAME = 'cart-session-id'
  private static readonly SESSION_EXPIRY_DAYS = 30

  /**
   * Generate a new session ID
   */
  static generateSessionId(): string {
    return randomBytes(this.SESSION_ID_LENGTH).toString('hex')
  }

  /**
   * Get session ID from request headers or cookies
   */
  static getSessionIdFromRequest(request: Request): string | null {
    // Try to get from Authorization header first (for API requests)
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      // For now, we'll use the token as session ID
      // In a real app, you'd decode the JWT and extract session info
      return token
    }

    // Try to get from cookies
    const cookieHeader = request.headers.get('cookie')
    if (cookieHeader) {
      const cookies = this.parseCookies(cookieHeader)
      return cookies[this.SESSION_COOKIE_NAME] || null
    }

    return null
  }

  /**
   * Create session info with expiration
   */
  static createSessionInfo(sessionId: string, userId?: string): SessionInfo {
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + this.SESSION_EXPIRY_DAYS)

    return {
      sessionId,
      userId,
      expiresAt
    }
  }

  /**
   * Validate session ID format
   */
  static isValidSessionId(sessionId: string): boolean {
    return /^[a-f0-9]{64}$/.test(sessionId) // 32 bytes = 64 hex chars
  }

  /**
   * Create session cookie string
   */
  static createSessionCookie(sessionId: string): string {
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + this.SESSION_EXPIRY_DAYS)

    return `${this.SESSION_COOKIE_NAME}=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Expires=${expiresAt.toUTCString()}`
  }

  /**
   * Create session cookie for clearing
   */
  static createClearSessionCookie(): string {
    return `${this.SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
  }

  /**
   * Parse cookies from cookie header
   */
  private static parseCookies(cookieHeader: string): Record<string, string> {
    const cookies: Record<string, string> = {}
    
    cookieHeader.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=')
      if (name && value) {
        cookies[name] = decodeURIComponent(value)
      }
    })

    return cookies
  }

  /**
   * Extract user ID from JWT token (placeholder implementation)
   * In a real app, you'd decode and validate the JWT
   */
  static extractUserIdFromToken(token: string): string | null {
    try {
      // This is a placeholder - in a real app you'd:
      // 1. Verify the JWT signature
      // 2. Check expiration
      // 3. Extract user ID from payload
      
      // For now, we'll assume the token contains the user ID
      // or return null for anonymous users
      return token.length > 20 ? token : null
    } catch (error) {
      productLogger.error('Error extracting user ID from token', error)
      return null
    }
  }

  /**
   * Check if session is expired
   */
  static isSessionExpired(expiresAt: Date): boolean {
    return expiresAt < new Date()
  }

  /**
   * Get session expiration date
   */
  static getSessionExpiration(): Date {
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + this.SESSION_EXPIRY_DAYS)
    return expiresAt
  }

  /**
   * Create response headers with session cookie
   */
  static createSessionHeaders(sessionId: string): Record<string, string> {
    return {
      'Set-Cookie': this.createSessionCookie(sessionId)
    }
  }

  /**
   * Create response headers to clear session cookie
   */
  static createClearSessionHeaders(): Record<string, string> {
    return {
      'Set-Cookie': this.createClearSessionCookie()
    }
  }
}
