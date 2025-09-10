// Export both old and new cart contexts for migration
export { CartProvider, useCart } from './cart-context'
export { CartProvider as BackendCartProvider, useCart as useBackendCart } from './cart-context-backend'
export { AddToCart } from './add-to-cart'
export { CartModal } from './cart-modal'
export type { CartItem, Cart } from './cart-context'

// Migration utilities
export { CartMigrationHelper } from '@/lib/cart-migration-helper'
export { CartMigrationService } from '@/lib/cart-migration'
