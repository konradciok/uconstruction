/**
 * Cart Service
 * 
 * Handles all cart operations including creation, updates, item management,
 * and cart synchronization between frontend and backend.
 */

import { PrismaClient, Cart as PrismaCart, CartItem as PrismaCartItem } from '@/generated/prisma'
import { productLogger } from './logger'
import { adaptProductForTemplate } from './template-adapters'
import { cartCache } from './cart-cache'
import type { ProductWithRelations } from '@/types/product'
import type {
  BackendCart,
  BackendCartItem,
  FrontendCart,
  FrontendCartItem,
  AddToCartRequest,
  CartServiceResponse,
  CartStatus
} from '@/types/cart'

export class CartService {
  private prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  /**
   * Create a new cart for a session
   */
  async createCart(sessionId: string, userId?: string): Promise<CartServiceResponse<BackendCart>> {
    try {
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 30) // 30 days expiration

      const cart = await this.prisma.cart.create({
        data: {
          sessionId,
          userId,
          expiresAt,
          status: 'ACTIVE'
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  variants: true,
                  media: true,
                  productTags: {
                    include: {
                      tag: true
                    }
                  },
                  productCollections: {
                    include: {
                      collection: true
                    }
                  }
                }
              },
              variant: true
            }
          }
        }
      })

      return {
        success: true,
        data: this.serializeCart(cart),
        message: 'Cart created successfully'
      }
    } catch (error) {
      productLogger.error('Error creating cart', error)
      return {
        success: false,
        error: 'Failed to create cart'
      }
    }
  }

  /**
   * Get cart by session ID
   */
  async getCart(sessionId: string): Promise<CartServiceResponse<BackendCart | null>> {
    try {
      // Check cache first
      const cachedCart = cartCache.get(sessionId)
      if (cachedCart) {
        return {
          success: true,
          data: cachedCart,
          message: 'Cart retrieved from cache'
        }
      }

      const cart = await this.prisma.cart.findUnique({
        where: { sessionId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  variants: true,
                  media: true,
                  productTags: {
                    include: {
                      tag: true
                    }
                  },
                  productCollections: {
                    include: {
                      collection: true
                    }
                  }
                }
              },
              variant: true
            }
          }
        }
      })

      if (!cart) {
        return {
          success: true,
          data: null,
          message: 'Cart not found'
        }
      }

      // Check if cart is expired
      if (cart.expiresAt < new Date()) {
        await this.updateCartStatus(cart.id, 'EXPIRED')
        return {
          success: true,
          data: null,
          message: 'Cart has expired'
        }
      }

      const serializedCart = this.serializeCart(cart)
      
      // Cache the cart
      cartCache.set(sessionId, serializedCart)

      return {
        success: true,
        data: serializedCart,
        message: 'Cart retrieved successfully'
      }
    } catch (error) {
      productLogger.error('Error getting cart', error)
      return {
        success: false,
        error: 'Failed to retrieve cart'
      }
    }
  }

  /**
   * Update cart status
   */
  async updateCartStatus(cartId: string, status: CartStatus): Promise<CartServiceResponse<BackendCart>> {
    try {
      const cart = await this.prisma.cart.update({
        where: { id: cartId },
        data: { status },
        include: {
          items: {
            include: {
              product: {
                include: {
                  variants: true,
                  media: true,
                  productTags: {
                    include: {
                      tag: true
                    }
                  },
                  productCollections: {
                    include: {
                      collection: true
                    }
                  }
                }
              },
              variant: true
            }
          }
        }
      })

      return {
        success: true,
        data: this.serializeCart(cart),
        message: 'Cart status updated successfully'
      }
    } catch (error) {
      productLogger.error('Error updating cart status', error)
      return {
        success: false,
        error: 'Failed to update cart status'
      }
    }
  }

  /**
   * Delete cart
   */
  async deleteCart(cartId: string): Promise<CartServiceResponse<void>> {
    try {
      await this.prisma.cart.delete({
        where: { id: cartId }
      })

      return {
        success: true,
        message: 'Cart deleted successfully'
      }
    } catch (error) {
      productLogger.error('Error deleting cart', error)
      return {
        success: false,
        error: 'Failed to delete cart'
      }
    }
  }

  /**
   * Add item to cart
   */
  async addItem(cartId: string, request: AddToCartRequest): Promise<CartServiceResponse<BackendCartItem>> {
    try {
      // Validate product and variant exist
      const product = await this.prisma.product.findUnique({
        where: { id: request.productId },
        include: {
          variants: true
        }
      })

      if (!product) {
        return {
          success: false,
          error: 'Product not found'
        }
      }

      const variant = product.variants.find(v => v.id === request.variantId)
      if (!variant) {
        return {
          success: false,
          error: 'Variant not found'
        }
      }

      // Check if item already exists in cart
      const existingItem = await this.prisma.cartItem.findUnique({
        where: {
          cartId_productId_variantId: {
            cartId,
            productId: request.productId,
            variantId: request.variantId
          }
        }
      })

      let cartItem: BackendCartItem

      if (existingItem) {
        // Update existing item quantity
        const updatedItem = await this.prisma.cartItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: existingItem.quantity + request.quantity,
            updatedAt: new Date()
          },
          include: {
            product: {
              include: {
                variants: true,
                media: true,
                productTags: {
                  include: {
                    tag: true
                  }
                },
                productCollections: {
                  include: {
                    collection: true
                  }
                }
              }
            },
            variant: true
          }
        })

        cartItem = this.serializeCartItem(updatedItem)
      } else {
        // Create new cart item
        const newItem = await this.prisma.cartItem.create({
          data: {
            cartId,
            productId: request.productId,
            variantId: request.variantId,
            quantity: request.quantity,
            price: variant.priceAmount || 0
          },
          include: {
            product: {
              include: {
                variants: true,
                media: true,
                productTags: {
                  include: {
                    tag: true
                  }
                },
                productCollections: {
                  include: {
                    collection: true
                  }
                }
              }
            },
            variant: true
          }
        })

        cartItem = this.serializeCartItem(newItem)
      }

      // Update cart timestamp
      await this.prisma.cart.update({
        where: { id: cartId },
        data: { updatedAt: new Date() }
      })

      // Invalidate cache for this cart
      const cart = await this.prisma.cart.findUnique({
        where: { id: cartId },
        select: { sessionId: true }
      })
      if (cart) {
        cartCache.delete(cart.sessionId)
      }

      return {
        success: true,
        data: cartItem,
        message: 'Item added to cart successfully'
      }
    } catch (error) {
      productLogger.error('Error adding item to cart', error)
      return {
        success: false,
        error: 'Failed to add item to cart'
      }
    }
  }

  /**
   * Update item quantity
   */
  async updateItemQuantity(cartItemId: string, quantity: number): Promise<CartServiceResponse<BackendCartItem | void>> {
    try {
      if (quantity <= 0) {
        return this.removeItem(cartItemId)
      }

      const cartItem = await this.prisma.cartItem.update({
        where: { id: cartItemId },
        data: {
          quantity,
          updatedAt: new Date()
        },
        include: {
          product: {
            include: {
              variants: true,
              media: true,
              productTags: {
                include: {
                  tag: true
                }
              },
              productCollections: {
                include: {
                  collection: true
                }
              }
            }
          },
          variant: true
        }
      })

      // Update cart timestamp
      await this.prisma.cart.update({
        where: { id: cartItem.cartId },
        data: { updatedAt: new Date() }
      })

      return {
        success: true,
        data: this.serializeCartItem(cartItem),
        message: 'Item quantity updated successfully'
      }
    } catch (error) {
      productLogger.error('Error updating item quantity', error)
      return {
        success: false,
        error: 'Failed to update item quantity'
      }
    }
  }

  /**
   * Remove item from cart
   */
  async removeItem(cartItemId: string): Promise<CartServiceResponse<void>> {
    try {
      const cartItem = await this.prisma.cartItem.findUnique({
        where: { id: cartItemId },
        select: { cartId: true }
      })

      if (!cartItem) {
        return {
          success: false,
          error: 'Cart item not found'
        }
      }

      await this.prisma.cartItem.delete({
        where: { id: cartItemId }
      })

      // Update cart timestamp
      await this.prisma.cart.update({
        where: { id: cartItem.cartId },
        data: { updatedAt: new Date() }
      })

      return {
        success: true,
        message: 'Item removed from cart successfully'
      }
    } catch (error) {
      productLogger.error('Error removing item from cart', error)
      return {
        success: false,
        error: 'Failed to remove item from cart'
      }
    }
  }

  /**
   * Merge localStorage cart with backend cart
   */
  async mergeCarts(backendCart: BackendCart, localStorageCart: FrontendCartItem[]): Promise<CartServiceResponse<BackendCart>> {
    try {
      const cartId = backendCart.id

      for (const localItem of localStorageCart) {
        const productId = parseInt(localItem.product.id)
        const variantId = parseInt(localItem.variantId)

        // Check if item already exists in backend cart
        const existingItem = await this.prisma.cartItem.findUnique({
          where: {
            cartId_productId_variantId: {
              cartId,
              productId,
              variantId
            }
          }
        })

        if (existingItem) {
          // Update quantity (add local quantity to backend quantity)
          await this.prisma.cartItem.update({
            where: { id: existingItem.id },
            data: {
              quantity: existingItem.quantity + localItem.quantity,
              updatedAt: new Date()
            }
          })
        } else {
          // Add new item to backend cart
          await this.prisma.cartItem.create({
            data: {
              cartId,
              productId,
              variantId,
              quantity: localItem.quantity,
              price: localItem.price
            }
          })
        }
      }

      // Update cart timestamp
      await this.prisma.cart.update({
        where: { id: cartId },
        data: { updatedAt: new Date() }
      })

      // Return updated cart
      const updatedCart = await this.getCart(backendCart.sessionId)
      return {
        success: true,
        data: updatedCart.data || undefined,
        message: 'Carts merged successfully'
      }
    } catch (error) {
      productLogger.error('Error merging carts', error)
      return {
        success: false,
        error: 'Failed to merge carts'
      }
    }
  }

  /**
   * Sync cart state (refresh cart data)
   */
  async syncCart(sessionId: string): Promise<CartServiceResponse<BackendCart | null>> {
    try {
      return await this.getCart(sessionId)
    } catch (error) {
      productLogger.error('Error syncing cart', error)
      return {
        success: false,
        error: 'Failed to sync cart'
      }
    }
  }

  /**
   * Cleanup expired carts
   */
  async cleanupExpiredCarts(): Promise<CartServiceResponse<number>> {
    try {
      const result = await this.prisma.cart.updateMany({
        where: {
          expiresAt: {
            lt: new Date()
          },
          status: 'ACTIVE'
        },
        data: {
          status: 'EXPIRED'
        }
      })

      return {
        success: true,
        data: result.count,
        message: `Marked ${result.count} carts as expired`
      }
    } catch (error) {
      productLogger.error('Error cleaning up expired carts', error)
      return {
        success: false,
        error: 'Failed to cleanup expired carts'
      }
    }
  }

  /**
   * Convert backend cart to frontend cart format
   */
  convertToFrontendCart(backendCart: BackendCart): FrontendCart {
    const items: FrontendCartItem[] = backendCart.items.map(item => ({
      id: item.id,
      product: item.product!,
      variantId: item.variantId.toString(),
      quantity: item.quantity,
      price: item.price
    }))

    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    return {
      items,
      totalQuantity,
      totalAmount
    }
  }

  /**
   * Serialize cart data (convert Decimal to number)
   */
  private serializeCart(cart: PrismaCart & { items: PrismaCartItem[] }): BackendCart {
    return {
      ...cart,
      items: cart.items.map((item: PrismaCartItem) => this.serializeCartItem(item))
    }
  }

  /**
   * Serialize cart item data (convert Decimal to number and add product data)
   */
  private serializeCartItem(item: PrismaCartItem): BackendCartItem {
    const serializedItem: BackendCartItem = {
      ...item,
      price: typeof item.price === 'number' ? item.price : parseFloat(item.price?.toString() || '0')
    }

    // Add product data if available
    if ('product' in item && item.product) {
      serializedItem.product = adaptProductForTemplate(item.product as ProductWithRelations)
    }

    // Add variant data if available
    if ('variant' in item && item.variant && typeof item.variant === 'object' && 'id' in item.variant) {
      const variant = item.variant as { id: string | number; title?: string; priceAmount?: number | string; priceCurrency?: string }
      serializedItem.variant = {
        id: variant.id.toString(),
        title: variant.title || 'Default',
        price: {
          amount: (typeof variant.priceAmount === 'number' 
            ? variant.priceAmount 
            : parseFloat(variant.priceAmount?.toString() || '0')).toString(),
          currencyCode: variant.priceCurrency || 'USD'
        }
      }
    }

    return serializedItem
  }
}
