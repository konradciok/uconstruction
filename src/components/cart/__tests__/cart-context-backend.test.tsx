/**
 * Cart Context Backend Unit Tests
 */

import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BackendCartProvider, useBackendCart } from '../cart-context-backend'
import { CartMigrationService } from '@/lib/cart-migration'

// Mock the migration service
jest.mock('@/lib/cart-migration', () => ({
  CartMigrationService: {
    extractLocalStorageCart: jest.fn(),
    needsMigration: jest.fn(),
    clearLocalStorageCart: jest.fn(),
  },
}))

// Mock fetch
global.fetch = jest.fn()

// Test component that uses the cart context
const TestComponent = () => {
  const { cart, addItem, removeItem, updateQuantity, clearCart, isLoading, error } = useBackendCart()

  return (
    <div>
      <div data-testid="cart-items-count">{cart.items.length}</div>
      <div data-testid="cart-total-quantity">{cart.totalQuantity}</div>
      <div data-testid="cart-total-amount">{cart.totalAmount}</div>
      <div data-testid="is-loading">{isLoading.toString()}</div>
      <div data-testid="error">{error || 'none'}</div>
      
      <button
        data-testid="add-item"
        onClick={() => addItem({
          id: '1',
          title: 'Test Product',
          handle: 'test-product',
          variants: [{ id: '1', price: { amount: '29.99', currencyCode: 'USD' } }],
          featuredImage: { url: '/test.jpg', altText: 'Test' },
          priceRange: {
            minVariantPrice: { amount: '29.99', currencyCode: 'USD' },
            maxVariantPrice: { amount: '29.99', currencyCode: 'USD' }
          },
          media: [],
          tags: [],
          collections: [],
          availableForSale: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }, '1', 2)}
      >
        Add Item
      </button>
      
      <button
        data-testid="remove-item"
        onClick={() => removeItem('item-1')}
      >
        Remove Item
      </button>
      
      <button
        data-testid="update-quantity"
        onClick={() => updateQuantity('item-1', 5)}
      >
        Update Quantity
      </button>
      
      <button
        data-testid="clear-cart"
        onClick={() => clearCart()}
      >
        Clear Cart
      </button>
    </div>
  )
}

describe('BackendCartProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockClear()
    ;(CartMigrationService.extractLocalStorageCart as jest.Mock).mockReturnValue(null)
    ;(CartMigrationService.needsMigration as jest.Mock).mockReturnValue(false)
  })

  it('should initialize with empty cart', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ cart: null })
    }).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ cart: { id: 'cart-1', sessionId: 'session-1', items: [] } })
    })

    render(
      <BackendCartProvider>
        <TestComponent />
      </BackendCartProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('cart-items-count')).toHaveTextContent('0')
      expect(screen.getByTestId('cart-total-quantity')).toHaveTextContent('0')
      expect(screen.getByTestId('cart-total-amount')).toHaveTextContent('0')
    })
  })

  it('should migrate localStorage cart on initialization', async () => {
    const localStorageCart = {
      items: [{
        id: 'item-1',
        product: {
          id: '1',
          title: 'Test Product',
          handle: 'test-product',
          variants: [{ id: '1', price: { amount: '29.99', currencyCode: 'USD' } }],
          featuredImage: { url: '/test.jpg', altText: 'Test' },
          priceRange: {
            minVariantPrice: { amount: '29.99', currencyCode: 'USD' },
            maxVariantPrice: { amount: '29.99', currencyCode: 'USD' }
          },
          media: [],
          tags: [],
          collections: [],
          availableForSale: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        variantId: '1',
        quantity: 2,
        price: 29.99
      }],
      totalQuantity: 2,
      totalAmount: 59.98
    }

    ;(CartMigrationService.extractLocalStorageCart as jest.Mock).mockReturnValue(localStorageCart)
    ;(CartMigrationService.needsMigration as jest.Mock).mockReturnValue(true)

    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ cart: null })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ cart: { id: 'cart-1', sessionId: 'session-1', items: [] } })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ cart: { id: 'cart-1', sessionId: 'session-1', items: [] } })
      })

    render(
      <BackendCartProvider>
        <TestComponent />
      </BackendCartProvider>
    )

    await waitFor(() => {
      expect(CartMigrationService.clearLocalStorageCart).toHaveBeenCalled()
    })
  })

  it('should add item to cart', async () => {
    const user = userEvent.setup()

    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ cart: null })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ cart: { id: 'cart-1', sessionId: 'session-1', items: [] } })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          cart: {
            id: 'cart-1',
            sessionId: 'session-1',
            items: [{
              id: 'item-1',
              productId: 1,
              variantId: 1,
              quantity: 2,
              price: 29.99,
              product: {
                id: '1',
                title: 'Test Product',
                handle: 'test-product',
                variants: [{ id: '1', price: { amount: '29.99', currencyCode: 'USD' } }],
                featuredImage: { url: '/test.jpg', altText: 'Test' },
                priceRange: {
                  minVariantPrice: { amount: '29.99', currencyCode: 'USD' },
                  maxVariantPrice: { amount: '29.99', currencyCode: 'USD' }
                },
                media: [],
                tags: [],
                collections: [],
                availableForSale: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            }]
          }
        })
      })

    render(
      <BackendCartProvider>
        <TestComponent />
      </BackendCartProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('cart-items-count')).toHaveTextContent('0')
    })

    await act(async () => {
      await user.click(screen.getByTestId('add-item'))
    })

    await waitFor(() => {
      expect(screen.getByTestId('cart-items-count')).toHaveTextContent('1')
      expect(screen.getByTestId('cart-total-quantity')).toHaveTextContent('2')
    })
  })

  it('should handle add item error with fallback', async () => {
    const user = userEvent.setup()

    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ cart: null })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ cart: { id: 'cart-1', sessionId: 'session-1', items: [] } })
      })
      .mockRejectedValueOnce(new Error('Network error'))

    render(
      <BackendCartProvider>
        <TestComponent />
      </BackendCartProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('cart-items-count')).toHaveTextContent('0')
    })

    await act(async () => {
      await user.click(screen.getByTestId('add-item'))
    })

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Failed to add item to cart')
    })
  })

  it('should remove item from cart', async () => {
    const user = userEvent.setup()

    // Mock initial cart with items
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          cart: {
            id: 'cart-1',
            sessionId: 'session-1',
            items: [{
              id: 'item-1',
              productId: 1,
              variantId: 1,
              quantity: 2,
              price: 29.99,
              product: {
                id: '1',
                title: 'Test Product',
                handle: 'test-product',
                variants: [{ id: '1', price: { amount: '29.99', currencyCode: 'USD' } }],
                featuredImage: { url: '/test.jpg', altText: 'Test' },
                priceRange: {
                  minVariantPrice: { amount: '29.99', currencyCode: 'USD' },
                  maxVariantPrice: { amount: '29.99', currencyCode: 'USD' }
                },
                media: [],
                tags: [],
                collections: [],
                availableForSale: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            }]
          }
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          cart: {
            id: 'cart-1',
            sessionId: 'session-1',
            items: []
          }
        })
      })

    render(
      <BackendCartProvider>
        <TestComponent />
      </BackendCartProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('cart-items-count')).toHaveTextContent('1')
    })

    await act(async () => {
      await user.click(screen.getByTestId('remove-item'))
    })

    await waitFor(() => {
      expect(screen.getByTestId('cart-items-count')).toHaveTextContent('0')
    })
  })

  it('should update item quantity', async () => {
    const user = userEvent.setup()

    // Mock initial cart with items
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          cart: {
            id: 'cart-1',
            sessionId: 'session-1',
            items: [{
              id: 'item-1',
              productId: 1,
              variantId: 1,
              quantity: 2,
              price: 29.99,
              product: {
                id: '1',
                title: 'Test Product',
                handle: 'test-product',
                variants: [{ id: '1', price: { amount: '29.99', currencyCode: 'USD' } }],
                featuredImage: { url: '/test.jpg', altText: 'Test' },
                priceRange: {
                  minVariantPrice: { amount: '29.99', currencyCode: 'USD' },
                  maxVariantPrice: { amount: '29.99', currencyCode: 'USD' }
                },
                media: [],
                tags: [],
                collections: [],
                availableForSale: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            }]
          }
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          cart: {
            id: 'cart-1',
            sessionId: 'session-1',
            items: [{
              id: 'item-1',
              productId: 1,
              variantId: 1,
              quantity: 5,
              price: 29.99,
              product: {
                id: '1',
                title: 'Test Product',
                handle: 'test-product',
                variants: [{ id: '1', price: { amount: '29.99', currencyCode: 'USD' } }],
                featuredImage: { url: '/test.jpg', altText: 'Test' },
                priceRange: {
                  minVariantPrice: { amount: '29.99', currencyCode: 'USD' },
                  maxVariantPrice: { amount: '29.99', currencyCode: 'USD' }
                },
                media: [],
                tags: [],
                collections: [],
                availableForSale: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            }]
          }
        })
      })

    render(
      <BackendCartProvider>
        <TestComponent />
      </BackendCartProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('cart-total-quantity')).toHaveTextContent('2')
    })

    await act(async () => {
      await user.click(screen.getByTestId('update-quantity'))
    })

    await waitFor(() => {
      expect(screen.getByTestId('cart-total-quantity')).toHaveTextContent('5')
    })
  })

  it('should clear cart', async () => {
    const user = userEvent.setup()

    // Mock initial cart with items
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          cart: {
            id: 'cart-1',
            sessionId: 'session-1',
            items: [{
              id: 'item-1',
              productId: 1,
              variantId: 1,
              quantity: 2,
              price: 29.99,
              product: {
                id: '1',
                title: 'Test Product',
                handle: 'test-product',
                variants: [{ id: '1', price: { amount: '29.99', currencyCode: 'USD' } }],
                featuredImage: { url: '/test.jpg', altText: 'Test' },
                priceRange: {
                  minVariantPrice: { amount: '29.99', currencyCode: 'USD' },
                  maxVariantPrice: { amount: '29.99', currencyCode: 'USD' }
                },
                media: [],
                tags: [],
                collections: [],
                availableForSale: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            }]
          }
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Cart cleared successfully' })
      })

    render(
      <BackendCartProvider>
        <TestComponent />
      </BackendCartProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('cart-items-count')).toHaveTextContent('1')
    })

    await act(async () => {
      await user.click(screen.getByTestId('clear-cart'))
    })

    await waitFor(() => {
      expect(screen.getByTestId('cart-items-count')).toHaveTextContent('0')
    })
  })
})
