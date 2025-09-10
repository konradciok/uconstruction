/**
 * Cart Migration Utilities
 * 
 * Handles migration of localStorage cart data to backend cart system.
 * Provides utilities for seamless transition from frontend-only to backend cart.
 */

import { CartService } from './cart-service'
import { SessionManager } from './session-manager'
import { productLogger } from './logger'
import type { 
  FrontendCart, 
  FrontendCartItem, 
  BackendCart, 
  CartServiceResponse 
} from '@/types/cart'

export class CartMigrationService {
  private cartService: CartService

  constructor(cartService: CartService) {
    this.cartService = cartService
  }

  /**
   * Migrate localStorage cart to backend
   */
  async migrateLocalStorageToBackend(
    sessionId: string,
    localStorageCart: FrontendCart
  ): Promise<CartServiceResponse<BackendCart>> {
    try {
      productLogger.info('Starting cart migration from localStorage to backend')

      // Get or create backend cart
      let backendCartResult = await this.cartService.getCart(sessionId)
      
      if (!backendCartResult.success) {
        return {
          success: false,
          error: backendCartResult.error
        }
      }

      if (!backendCartResult.data) {
        // Create new backend cart
        const createResult = await this.cartService.createCart(sessionId)
        
        if (!createResult.success) {
          return {
            success: false,
            error: createResult.error
          }
        }
        
        backendCartResult = createResult
      }

      // Merge localStorage cart with backend cart
      const mergeResult = await this.cartService.mergeCarts(
        backendCartResult.data!,
        localStorageCart.items
      )

      if (!mergeResult.success) {
        return {
          success: false,
          error: mergeResult.error
        }
      }

      productLogger.info('Cart migration completed successfully')
      return {
        success: true,
        data: mergeResult.data!,
        message: 'Cart migrated successfully'
      }
    } catch (error) {
      productLogger.error('Error during cart migration', error)
      return {
        success: false,
        error: 'Cart migration failed'
      }
    }
  }

  /**
   * Check if localStorage cart needs migration
   */
  static needsMigration(localStorageCart: FrontendCart | null): boolean {
    return localStorageCart !== null && localStorageCart.items.length > 0
  }

  /**
   * Extract localStorage cart data
   */
  static extractLocalStorageCart(): FrontendCart | null {
    try {
      if (typeof window === 'undefined') {
        return null // Server-side rendering
      }

      const cartData = localStorage.getItem('cart')
      if (!cartData) {
        return null
      }

      const parsedCart = JSON.parse(cartData) as FrontendCart
      
      // Validate cart structure
      if (!parsedCart.items || !Array.isArray(parsedCart.items)) {
        return null
      }

      return parsedCart
    } catch (error) {
      productLogger.error('Error extracting localStorage cart', error)
      return null
    }
  }

  /**
   * Clear localStorage cart after successful migration
   */
  static clearLocalStorageCart(): void {
    try {
      if (typeof window === 'undefined') {
        return // Server-side rendering
      }

      localStorage.removeItem('cart')
      productLogger.info('LocalStorage cart cleared after migration')
    } catch (error) {
      productLogger.error('Error clearing localStorage cart', error)
    }
  }

  /**
   * Validate cart item data before migration
   */
  static validateCartItem(item: FrontendCartItem): boolean {
    return !!(
      item.id &&
      item.product &&
      item.product.id &&
      item.variantId &&
      item.quantity > 0 &&
      item.price >= 0
    )
  }

  /**
   * Filter valid cart items for migration
   */
  static filterValidCartItems(items: FrontendCartItem[]): FrontendCartItem[] {
    return items.filter(item => this.validateCartItem(item))
  }

  /**
   * Get migration status for debugging
   */
  static getMigrationStatus(): {
    hasLocalStorageCart: boolean
    localStorageItemCount: number
    localStorageTotalAmount: number
  } {
    const localStorageCart = this.extractLocalStorageCart()
    
    return {
      hasLocalStorageCart: !!localStorageCart,
      localStorageItemCount: localStorageCart?.items.length || 0,
      localStorageTotalAmount: localStorageCart?.totalAmount || 0
    }
  }

  /**
   * Create migration summary
   */
  static createMigrationSummary(
    beforeMigration: FrontendCart | null,
    afterMigration: BackendCart | null
  ): {
    itemsMigrated: number
    totalAmountMigrated: number
    migrationSuccessful: boolean
  } {
    const itemsMigrated = beforeMigration?.items.length || 0
    const totalAmountMigrated = beforeMigration?.totalAmount || 0
    const migrationSuccessful = !!afterMigration

    return {
      itemsMigrated,
      totalAmountMigrated,
      migrationSuccessful
    }
  }
}
