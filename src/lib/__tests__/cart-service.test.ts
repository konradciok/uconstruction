/**
 * Cart Service Unit Tests
 */

import { PrismaClient } from '@/generated/prisma'
import { CartService } from '../cart-service'
import type { AddToCartRequest } from '@/types/cart'

// Mock Prisma Client
jest.mock('@/generated/prisma', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    cart: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      updateMany: jest.fn(),
    },
    cartItem: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
    },
  })),
}))

describe('CartService', () => {
  let cartService: CartService
  let mockPrisma: jest.Mocked<PrismaClient>

  beforeEach(() => {
    mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>
    cartService = new CartService(mockPrisma)
    jest.clearAllMocks()
  })

  describe('createCart', () => {
    it('should create a new cart successfully', async () => {
      const sessionId = 'test-session-123'
      const mockCart = {
        id: 'cart-123',
        sessionId,
        userId: null,
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(),
        items: []
      }

      mockPrisma.cart.create.mockResolvedValue(mockCart as any)

      const result = await cartService.createCart(sessionId)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(mockPrisma.cart.create).toHaveBeenCalledWith({
        data: {
          sessionId,
          userId: undefined,
          expiresAt: expect.any(Date),
          status: 'ACTIVE'
        },
        include: expect.any(Object)
      })
    })

    it('should handle creation errors', async () => {
      const sessionId = 'test-session-123'
      mockPrisma.cart.create.mockRejectedValue(new Error('Database error'))

      const result = await cartService.createCart(sessionId)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to create cart')
    })
  })

  describe('getCart', () => {
    it('should retrieve an existing cart', async () => {
      const sessionId = 'test-session-123'
      const mockCart = {
        id: 'cart-123',
        sessionId,
        status: 'ACTIVE',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        items: []
      }

      mockPrisma.cart.findUnique.mockResolvedValue(mockCart as any)

      const result = await cartService.getCart(sessionId)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(mockPrisma.cart.findUnique).toHaveBeenCalledWith({
        where: { sessionId },
        include: expect.any(Object)
      })
    })

    it('should return null for non-existent cart', async () => {
      const sessionId = 'non-existent-session'
      mockPrisma.cart.findUnique.mockResolvedValue(null)

      const result = await cartService.getCart(sessionId)

      expect(result.success).toBe(true)
      expect(result.data).toBeNull()
    })

    it('should mark expired cart as expired', async () => {
      const sessionId = 'expired-session'
      const expiredCart = {
        id: 'cart-123',
        sessionId,
        status: 'ACTIVE',
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        items: []
      }

      mockPrisma.cart.findUnique.mockResolvedValue(expiredCart as any)
      mockPrisma.cart.update.mockResolvedValue({ ...expiredCart, status: 'EXPIRED' } as any)

      const result = await cartService.getCart(sessionId)

      expect(result.success).toBe(true)
      expect(result.data).toBeNull()
      expect(mockPrisma.cart.update).toHaveBeenCalledWith({
        where: { id: expiredCart.id },
        data: { status: 'EXPIRED' }
      })
    })
  })

  describe('addItem', () => {
    it('should add a new item to cart', async () => {
      const cartId = 'cart-123'
      const request: AddToCartRequest = {
        productId: 1,
        variantId: 1,
        quantity: 2
      }

      const mockProduct = {
        id: 1,
        title: 'Test Product',
        variants: [{
          id: 1,
          priceAmount: 29.99
        }]
      }

      const mockCartItem = {
        id: 'item-123',
        cartId,
        productId: 1,
        variantId: 1,
        quantity: 2,
        price: 29.99,
        addedAt: new Date(),
        updatedAt: new Date()
      }

      mockPrisma.product.findUnique.mockResolvedValue(mockProduct as any)
      mockPrisma.cartItem.findUnique.mockResolvedValue(null)
      mockPrisma.cartItem.create.mockResolvedValue(mockCartItem as any)
      mockPrisma.cart.update.mockResolvedValue({} as any)

      const result = await cartService.addItem(cartId, request)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(mockPrisma.cartItem.create).toHaveBeenCalledWith({
        data: {
          cartId,
          productId: 1,
          variantId: 1,
          quantity: 2,
          price: 29.99
        },
        include: expect.any(Object)
      })
    })

    it('should update existing item quantity', async () => {
      const cartId = 'cart-123'
      const request: AddToCartRequest = {
        productId: 1,
        variantId: 1,
        quantity: 2
      }

      const mockProduct = {
        id: 1,
        title: 'Test Product',
        variants: [{
          id: 1,
          priceAmount: 29.99
        }]
      }

      const existingItem = {
        id: 'item-123',
        cartId,
        productId: 1,
        variantId: 1,
        quantity: 1,
        price: 29.99
      }

      const updatedItem = {
        ...existingItem,
        quantity: 3
      }

      mockPrisma.product.findUnique.mockResolvedValue(mockProduct as any)
      mockPrisma.cartItem.findUnique.mockResolvedValue(existingItem as any)
      mockPrisma.cartItem.update.mockResolvedValue(updatedItem as any)
      mockPrisma.cart.update.mockResolvedValue({} as any)

      const result = await cartService.addItem(cartId, request)

      expect(result.success).toBe(true)
      expect(mockPrisma.cartItem.update).toHaveBeenCalledWith({
        where: { id: existingItem.id },
        data: {
          quantity: 3,
          updatedAt: expect.any(Date)
        },
        include: expect.any(Object)
      })
    })

    it('should handle product not found error', async () => {
      const cartId = 'cart-123'
      const request: AddToCartRequest = {
        productId: 999,
        variantId: 1,
        quantity: 1
      }

      mockPrisma.product.findUnique.mockResolvedValue(null)

      const result = await cartService.addItem(cartId, request)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Product not found')
    })

    it('should handle variant not found error', async () => {
      const cartId = 'cart-123'
      const request: AddToCartRequest = {
        productId: 1,
        variantId: 999,
        quantity: 1
      }

      const mockProduct = {
        id: 1,
        title: 'Test Product',
        variants: [{
          id: 1,
          priceAmount: 29.99
        }]
      }

      mockPrisma.product.findUnique.mockResolvedValue(mockProduct as any)

      const result = await cartService.addItem(cartId, request)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Variant not found')
    })
  })

  describe('updateItemQuantity', () => {
    it('should update item quantity successfully', async () => {
      const cartItemId = 'item-123'
      const quantity = 5

      const mockCartItem = {
        id: cartItemId,
        cartId: 'cart-123',
        productId: 1,
        variantId: 1,
        quantity,
        price: 29.99,
        addedAt: new Date(),
        updatedAt: new Date()
      }

      mockPrisma.cartItem.update.mockResolvedValue(mockCartItem as any)
      mockPrisma.cart.update.mockResolvedValue({} as any)

      const result = await cartService.updateItemQuantity(cartItemId, quantity)

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()
      expect(mockPrisma.cartItem.update).toHaveBeenCalledWith({
        where: { id: cartItemId },
        data: {
          quantity,
          updatedAt: expect.any(Date)
        },
        include: expect.any(Object)
      })
    })

    it('should remove item when quantity is 0', async () => {
      const cartItemId = 'item-123'
      const quantity = 0

      mockPrisma.cartItem.findUnique.mockResolvedValue({
        id: cartItemId,
        cartId: 'cart-123'
      } as any)
      mockPrisma.cartItem.delete.mockResolvedValue({} as any)
      mockPrisma.cart.update.mockResolvedValue({} as any)

      const result = await cartService.updateItemQuantity(cartItemId, quantity)

      expect(result.success).toBe(true)
      expect(mockPrisma.cartItem.delete).toHaveBeenCalledWith({
        where: { id: cartItemId }
      })
    })
  })

  describe('removeItem', () => {
    it('should remove item successfully', async () => {
      const cartItemId = 'item-123'

      mockPrisma.cartItem.findUnique.mockResolvedValue({
        id: cartItemId,
        cartId: 'cart-123'
      } as any)
      mockPrisma.cartItem.delete.mockResolvedValue({} as any)
      mockPrisma.cart.update.mockResolvedValue({} as any)

      const result = await cartService.removeItem(cartItemId)

      expect(result.success).toBe(true)
      expect(mockPrisma.cartItem.delete).toHaveBeenCalledWith({
        where: { id: cartItemId }
      })
    })

    it('should handle item not found error', async () => {
      const cartItemId = 'non-existent-item'

      mockPrisma.cartItem.findUnique.mockResolvedValue(null)

      const result = await cartService.removeItem(cartItemId)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Cart item not found')
    })
  })

  describe('cleanupExpiredCarts', () => {
    it('should mark expired carts as expired', async () => {
      const mockResult = { count: 5 }
      mockPrisma.cart.updateMany.mockResolvedValue(mockResult)

      const result = await cartService.cleanupExpiredCarts()

      expect(result.success).toBe(true)
      expect(result.data).toBe(5)
      expect(mockPrisma.cart.updateMany).toHaveBeenCalledWith({
        where: {
          expiresAt: {
            lt: expect.any(Date)
          },
          status: 'ACTIVE'
        },
        data: {
          status: 'EXPIRED'
        }
      })
    })
  })
})
