/**
 * Cart Cache Service
 * 
 * Provides in-memory caching for cart operations to improve performance
 * and reduce database load. Implements LRU cache with TTL support.
 */

import type { BackendCart, BackendCartItem } from '@/types/cart'

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

interface CartCacheStats {
  hits: number
  misses: number
  evictions: number
  size: number
  maxSize: number
}

export class CartCache {
  private cache = new Map<string, CacheEntry<BackendCart>>()
  private stats: CartCacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    size: 0,
    maxSize: 1000 // Maximum number of carts to cache
  }
  private readonly defaultTTL = 5 * 60 * 1000 // 5 minutes

  /**
   * Get cart from cache
   */
  get(sessionId: string): BackendCart | null {
    const entry = this.cache.get(sessionId)
    
    if (!entry) {
      this.stats.misses++
      return null
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(sessionId)
      this.stats.misses++
      this.stats.evictions++
      return null
    }

    this.stats.hits++
    return entry.data
  }

  /**
   * Set cart in cache
   */
  set(sessionId: string, cart: BackendCart, ttl?: number): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.stats.maxSize) {
      this.evictOldest()
    }

    const entry: CacheEntry<BackendCart> = {
      data: cart,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    }

    this.cache.set(sessionId, entry)
    this.stats.size = this.cache.size
  }

  /**
   * Remove cart from cache
   */
  delete(sessionId: string): void {
    const deleted = this.cache.delete(sessionId)
    if (deleted) {
      this.stats.size = this.cache.size
    }
  }

  /**
   * Clear all cached carts
   */
  clear(): void {
    this.cache.clear()
    this.stats.size = 0
  }

  /**
   * Update cart in cache (partial update)
   */
  update(sessionId: string, updates: Partial<BackendCart>): void {
    const existing = this.cache.get(sessionId)
    if (existing) {
      const updatedCart: BackendCart = {
        ...existing.data,
        ...updates,
        updatedAt: new Date()
      }
      this.set(sessionId, updatedCart, existing.ttl)
    }
  }

  /**
   * Add item to cached cart
   */
  addItem(sessionId: string, item: BackendCartItem): void {
    const existing = this.cache.get(sessionId)
    if (existing) {
      const updatedItems = [...existing.data.items, item]
      const updatedCart: BackendCart = {
        ...existing.data,
        items: updatedItems,
        updatedAt: new Date()
      }
      this.set(sessionId, updatedCart, existing.ttl)
    }
  }

  /**
   * Update item in cached cart
   */
  updateItem(sessionId: string, itemId: string, updates: Partial<BackendCartItem>): void {
    const existing = this.cache.get(sessionId)
    if (existing) {
      const updatedItems = existing.data.items.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      )
      const updatedCart: BackendCart = {
        ...existing.data,
        items: updatedItems,
        updatedAt: new Date()
      }
      this.set(sessionId, updatedCart, existing.ttl)
    }
  }

  /**
   * Remove item from cached cart
   */
  removeItem(sessionId: string, itemId: string): void {
    const existing = this.cache.get(sessionId)
    if (existing) {
      const updatedItems = existing.data.items.filter(item => item.id !== itemId)
      const updatedCart: BackendCart = {
        ...existing.data,
        items: updatedItems,
        updatedAt: new Date()
      }
      this.set(sessionId, updatedCart, existing.ttl)
    }
  }

  /**
   * Clear items from cached cart
   */
  clearItems(sessionId: string): void {
    const existing = this.cache.get(sessionId)
    if (existing) {
      const updatedCart: BackendCart = {
        ...existing.data,
        items: [],
        updatedAt: new Date()
      }
      this.set(sessionId, updatedCart, existing.ttl)
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CartCacheStats {
    return { ...this.stats }
  }

  /**
   * Reset cache statistics
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      size: this.cache.size,
      maxSize: this.stats.maxSize
    }
  }

  /**
   * Check if cart exists in cache
   */
  has(sessionId: string): boolean {
    const entry = this.cache.get(sessionId)
    if (!entry) return false

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(sessionId)
      this.stats.evictions++
      return false
    }

    return true
  }

  /**
   * Get all cached session IDs
   */
  getCachedSessions(): string[] {
    return Array.from(this.cache.keys())
  }

  /**
   * Clean up expired entries
   */
  cleanup(): number {
    const now = Date.now()
    let cleaned = 0

    for (const [sessionId, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(sessionId)
        cleaned++
      }
    }

    this.stats.size = this.cache.size
    this.stats.evictions += cleaned
    return cleaned
  }

  /**
   * Evict oldest entry (LRU)
   */
  private evictOldest(): void {
    let oldestKey: string | null = null
    let oldestTime = Date.now()

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
      this.stats.evictions++
    }
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size
  }

  /**
   * Check if cache is full
   */
  isFull(): boolean {
    return this.cache.size >= this.stats.maxSize
  }
}

// Global cache instance
export const cartCache = new CartCache()

// Cleanup expired entries every 5 minutes
setInterval(() => {
  const cleaned = cartCache.cleanup()
  if (cleaned > 0) {
    console.log(`Cart cache: Cleaned up ${cleaned} expired entries`)
  }
}, 5 * 60 * 1000)
