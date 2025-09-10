/**
 * Cart API Integration Tests
 */

import { NextRequest } from 'next/server'
import { GET, POST, PUT, DELETE } from '../route'

// Mock the cart service and session manager
jest.mock('@/lib/cart-service', () => ({
  CartService: jest.fn().mockImplementation(() => ({
    getCart: jest.fn(),
    createCart: jest.fn(),
    deleteCart: jest.fn(),
  })),
}))

jest.mock('@/lib/session-manager', () => ({
  SessionManager: {
    getSessionIdFromRequest: jest.fn(),
    generateSessionId: jest.fn(),
    createSessionHeaders: jest.fn(),
  },
}))

jest.mock('@/lib/db', () => ({
  prisma: {},
}))

import { CartService } from '@/lib/cart-service'
import { SessionManager } from '@/lib/session-manager'

const mockCartService = CartService as jest.MockedClass<typeof CartService>

describe('/api/cart', () => {
  let mockRequest: NextRequest

  beforeEach(() => {
    jest.clearAllMocks()
    mockRequest = new NextRequest('http://localhost:3000/api/cart')
  })

  describe('GET /api/cart', () => {
    it('should return existing cart', async () => {
      const mockCart = {
        id: 'cart-123',
        sessionId: 'session-123',
        items: [],
        totalQuantity: 0,
        totalAmount: 0
      }

      ;(SessionManager.getSessionIdFromRequest as jest.Mock).mockReturnValue('session-123')
      ;(SessionManager.createSessionHeaders as jest.Mock).mockReturnValue({
        'Set-Cookie': 'cart-session-id=session-123'
      })

      const mockCartServiceInstance = {
        getCart: jest.fn().mockResolvedValue({
          success: true,
          data: mockCart
        })
      }
      mockCartService.mockImplementation(() => mockCartServiceInstance as any)

      const response = await GET(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.cart).toEqual(mockCart)
      expect(mockCartServiceInstance.getCart).toHaveBeenCalledWith('session-123')
    })

    it('should create new cart if none exists', async () => {
      const mockCart = {
        id: 'cart-123',
        sessionId: 'session-123',
        items: [],
        totalQuantity: 0,
        totalAmount: 0
      }

      ;(SessionManager.getSessionIdFromRequest as jest.Mock).mockReturnValue('session-123')
      ;(SessionManager.createSessionHeaders as jest.Mock).mockReturnValue({
        'Set-Cookie': 'cart-session-id=session-123'
      })

      const mockCartServiceInstance = {
        getCart: jest.fn().mockResolvedValue({
          success: true,
          data: null
        }),
        createCart: jest.fn().mockResolvedValue({
          success: true,
          data: mockCart
        })
      }
      mockCartService.mockImplementation(() => mockCartServiceInstance as any)

      const response = await GET(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.cart).toEqual(mockCart)
      expect(mockCartServiceInstance.createCart).toHaveBeenCalledWith('session-123')
    })

    it('should generate new session if none exists', async () => {
      const mockCart = {
        id: 'cart-123',
        sessionId: 'new-session-123',
        items: [],
        totalQuantity: 0,
        totalAmount: 0
      }

      ;(SessionManager.getSessionIdFromRequest as jest.Mock).mockReturnValue(null)
      ;(SessionManager.generateSessionId as jest.Mock).mockReturnValue('new-session-123')
      ;(SessionManager.createSessionHeaders as jest.Mock).mockReturnValue({
        'Set-Cookie': 'cart-session-id=new-session-123'
      })

      const mockCartServiceInstance = {
        createCart: jest.fn().mockResolvedValue({
          success: true,
          data: mockCart
        })
      }
      mockCartService.mockImplementation(() => mockCartServiceInstance as any)

      const response = await GET(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.cart).toEqual(mockCart)
      expect(SessionManager.generateSessionId).toHaveBeenCalled()
    })

    it('should handle service errors', async () => {
      ;(SessionManager.getSessionIdFromRequest as jest.Mock).mockReturnValue('session-123')

      const mockCartServiceInstance = {
        getCart: jest.fn().mockResolvedValue({
          success: false,
          error: 'Database error'
        })
      }
      mockCartService.mockImplementation(() => mockCartServiceInstance as any)

      const response = await GET(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Database error')
    })
  })

  describe('POST /api/cart', () => {
    it('should create new cart', async () => {
      const mockCart = {
        id: 'cart-123',
        sessionId: 'session-123',
        items: [],
        totalQuantity: 0,
        totalAmount: 0
      }

      ;(SessionManager.getSessionIdFromRequest as jest.Mock).mockReturnValue('session-123')
      ;(SessionManager.createSessionHeaders as jest.Mock).mockReturnValue({
        'Set-Cookie': 'cart-session-id=session-123'
      })

      const mockCartServiceInstance = {
        getCart: jest.fn().mockResolvedValue({
          success: true,
          data: null
        }),
        createCart: jest.fn().mockResolvedValue({
          success: true,
          data: mockCart
        })
      }
      mockCartService.mockImplementation(() => mockCartServiceInstance as any)

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.cart).toEqual(mockCart)
      expect(mockCartServiceInstance.createCart).toHaveBeenCalledWith('session-123')
    })

    it('should return existing cart if already exists', async () => {
      const mockCart = {
        id: 'cart-123',
        sessionId: 'session-123',
        items: [],
        totalQuantity: 0,
        totalAmount: 0
      }

      ;(SessionManager.getSessionIdFromRequest as jest.Mock).mockReturnValue('session-123')
      ;(SessionManager.createSessionHeaders as jest.Mock).mockReturnValue({
        'Set-Cookie': 'cart-session-id=session-123'
      })

      const mockCartServiceInstance = {
        getCart: jest.fn().mockResolvedValue({
          success: true,
          data: mockCart
        })
      }
      mockCartService.mockImplementation(() => mockCartServiceInstance as any)

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.cart).toEqual(mockCart)
      expect(mockCartServiceInstance.createCart).not.toHaveBeenCalled()
    })
  })

  describe('PUT /api/cart', () => {
    it('should return current cart', async () => {
      const mockCart = {
        id: 'cart-123',
        sessionId: 'session-123',
        items: [],
        totalQuantity: 0,
        totalAmount: 0
      }

      ;(SessionManager.getSessionIdFromRequest as jest.Mock).mockReturnValue('session-123')

      const mockCartServiceInstance = {
        getCart: jest.fn().mockResolvedValue({
          success: true,
          data: mockCart
        })
      }
      mockCartService.mockImplementation(() => mockCartServiceInstance as any)

      const response = await PUT(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.cart).toEqual(mockCart)
    })

    it('should return 401 if no session', async () => {
      ;(SessionManager.getSessionIdFromRequest as jest.Mock).mockReturnValue(null)

      const response = await PUT(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Session required')
    })
  })

  describe('DELETE /api/cart', () => {
    it('should clear cart successfully', async () => {
      const mockCart = {
        id: 'cart-123',
        sessionId: 'session-123',
        items: [],
        totalQuantity: 0,
        totalAmount: 0
      }

      ;(SessionManager.getSessionIdFromRequest as jest.Mock).mockReturnValue('session-123')

      const mockCartServiceInstance = {
        getCart: jest.fn().mockResolvedValue({
          success: true,
          data: mockCart
        }),
        deleteCart: jest.fn().mockResolvedValue({
          success: true,
          message: 'Cart deleted successfully'
        })
      }
      mockCartService.mockImplementation(() => mockCartServiceInstance as any)

      const response = await DELETE(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Cart cleared successfully')
      expect(mockCartServiceInstance.deleteCart).toHaveBeenCalledWith('cart-123')
    })

    it('should return 404 if cart not found', async () => {
      ;(SessionManager.getSessionIdFromRequest as jest.Mock).mockReturnValue('session-123')

      const mockCartServiceInstance = {
        getCart: jest.fn().mockResolvedValue({
          success: true,
          data: null
        })
      }
      mockCartService.mockImplementation(() => mockCartServiceInstance as any)

      const response = await DELETE(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Cart not found')
    })

    it('should return 401 if no session', async () => {
      ;(SessionManager.getSessionIdFromRequest as jest.Mock).mockReturnValue(null)

      const response = await DELETE(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Session required')
    })
  })
})
