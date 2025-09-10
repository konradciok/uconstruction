import type { Cart as PrismaCart, CartItem as PrismaCartItem, CartStatus } from '@/generated/prisma'
import type { TemplateProduct } from '@/lib/template-adapters'

// Backend cart types (matching Prisma models)
export interface BackendCart extends Omit<PrismaCart, 'items'> {
  items: BackendCartItem[]
}

export interface BackendCartItem extends Omit<PrismaCartItem, 'price'> {
  price: number // Serialized from Decimal
  product?: TemplateProduct // Optional product data for frontend
  variant?: {
    id: string
    title: string
    price: {
      amount: string
      currencyCode: string
    }
  }
}

// Frontend cart types (compatible with existing cart context)
export interface FrontendCartItem {
  id: string
  product: TemplateProduct
  variantId: string
  quantity: number
  price: number
}

export interface FrontendCart {
  items: FrontendCartItem[]
  totalQuantity: number
  totalAmount: number
}

// Cart operation types
export interface AddToCartRequest {
  productId: number
  variantId: number
  quantity: number
}

export interface UpdateCartItemRequest {
  cartItemId: string
  quantity: number
}

export interface CartMergeRequest {
  localStorageCart: FrontendCartItem[]
}

// Session management types
export interface SessionInfo {
  sessionId: string
  userId?: string
  expiresAt: Date
}

// Cart service response types
export interface CartServiceResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface CartValidationError {
  field: string
  message: string
  code: string
}

// Cart analytics types
export interface CartAnalytics {
  totalCarts: number
  activeCarts: number
  abandonedCarts: number
  averageCartValue: number
  averageItemsPerCart: number
  topProducts: Array<{
    productId: number
    productTitle: string
    timesAdded: number
  }>
}

// Export CartStatus enum for use in other files
export { CartStatus }
