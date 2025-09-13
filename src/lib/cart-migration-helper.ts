/**
 * Cart Migration Helper
 * 
 * Provides utilities to help migrate from the old localStorage-only cart
 * to the new backend-integrated cart system.
 */

import { CartMigrationService } from './cart-migration'
import type { FrontendCart } from '@/types/cart'

export class CartMigrationHelper {
  /**
   * Check if migration is needed and perform it
   */
  static async performMigrationIfNeeded(): Promise<{
    migrated: boolean
    itemsMigrated: number
    error?: string
  }> {
    try {
      const localStorageCart = CartMigrationService.extractLocalStorageCart()
      
      if (!CartMigrationService.needsMigration(localStorageCart)) {
        return {
          migrated: false,
          itemsMigrated: 0
        }
      }

      console.log('🔄 Starting cart migration from localStorage to backend...')
      
      // Create backend cart
      const createResponse = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!createResponse.ok) {
        throw new Error('Failed to create backend cart')
      }

      const { cart: backendCart } = await createResponse.json()

      // Merge localStorage cart with backend
      const mergeResponse = await fetch('/api/cart/merge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          localStorageCart: localStorageCart?.items || []
        })
      })

      if (!mergeResponse.ok) {
        throw new Error('Failed to merge carts')
      }

      const { cart: mergedCart } = await mergeResponse.json()

      // Clear localStorage after successful migration
      CartMigrationService.clearLocalStorageCart()

      console.log('✅ Cart migration completed successfully')
      
      return {
        migrated: true,
        itemsMigrated: localStorageCart?.items?.length || 0
      }
    } catch (error) {
      console.error('❌ Cart migration failed:', error)
      return {
        migrated: false,
        itemsMigrated: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Get migration status for debugging
   */
  static getMigrationStatus(): {
    hasLocalStorageCart: boolean
    localStorageItemCount: number
    localStorageTotalAmount: number
    needsMigration: boolean
  } {
    const localStorageCart = CartMigrationService.extractLocalStorageCart()
    
    return {
      hasLocalStorageCart: !!localStorageCart,
      localStorageItemCount: localStorageCart?.items.length || 0,
      localStorageTotalAmount: localStorageCart?.totalAmount || 0,
      needsMigration: CartMigrationService.needsMigration(localStorageCart)
    }
  }

  /**
   * Force migration (useful for testing or manual triggers)
   */
  static async forceMigration(): Promise<{
    success: boolean
    itemsMigrated: number
    error?: string
  }> {
    try {
      const localStorageCart = CartMigrationService.extractLocalStorageCart()
      
      if (!localStorageCart) {
        return {
          success: false,
          itemsMigrated: 0,
          error: 'No localStorage cart found'
        }
      }

      // Clear any existing backend cart first
      await fetch('/api/cart', {
        method: 'DELETE'
      })

      // Perform migration
      const result = await this.performMigrationIfNeeded()
      
      return {
        success: result.migrated,
        itemsMigrated: result.itemsMigrated,
        error: result.error
      }
    } catch (error) {
      console.error('❌ Force migration failed:', error)
      return {
        success: false,
        itemsMigrated: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Rollback migration (restore localStorage cart)
   */
  static async rollbackMigration(): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      // Get current backend cart
      const response = await fetch('/api/cart')
      
      if (!response.ok) {
        throw new Error('Failed to get backend cart')
      }

      const { cart: backendCart } = await response.json()

      if (!backendCart) {
        return {
          success: false,
          error: 'No backend cart found to rollback'
        }
      }

      // Convert backend cart to localStorage format
      const localStorageCart: FrontendCart = {
        items: backendCart.items.map((item: { id: string; product: Record<string, unknown>; variantId: string | number; quantity: number; price: number }) => ({
          id: item.id,
          product: item.product!,
          variantId: item.variantId.toString(),
          quantity: item.quantity,
          price: item.price
        })),
        totalQuantity: backendCart.items.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0),
        totalAmount: backendCart.items.reduce((sum: number, item: { price: number; quantity: number }) => sum + (item.price * item.quantity), 0)
      }

      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(localStorageCart))

      // Clear backend cart
      await fetch('/api/cart', {
        method: 'DELETE'
      })

      console.log('🔄 Cart migration rolled back to localStorage')
      
      return {
        success: true
      }
    } catch (error) {
      console.error('❌ Rollback failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Check if backend cart system is available
   */
  static async isBackendAvailable(): Promise<boolean> {
    try {
      const response = await fetch('/api/cart', {
        method: 'HEAD'
      })
      return response.ok
    } catch {
      return false
    }
  }

  /**
   * Get migration recommendations
   */
  static getMigrationRecommendations(): {
    shouldMigrate: boolean
    reason: string
    steps: string[]
  } {
    const status = this.getMigrationStatus()
    
    if (!status.hasLocalStorageCart) {
      return {
        shouldMigrate: false,
        reason: 'No localStorage cart found',
        steps: []
      }
    }

    if (status.localStorageItemCount === 0) {
      return {
        shouldMigrate: false,
        reason: 'localStorage cart is empty',
        steps: []
      }
    }

    return {
      shouldMigrate: true,
      reason: `Found ${status.localStorageItemCount} items in localStorage cart worth $${status.localStorageTotalAmount.toFixed(2)}`,
      steps: [
        'Create backend cart session',
        'Merge localStorage items with backend cart',
        'Clear localStorage cart',
        'Switch to backend cart operations'
      ]
    }
  }
}
