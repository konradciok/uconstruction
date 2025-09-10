'use client'

import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect, useState } from 'react'
import { TemplateProduct } from '@/lib/template-adapters'
import { CartMigrationService } from '@/lib/cart-migration'
import type { 
  FrontendCart, 
  FrontendCartItem, 
  BackendCart, 
  AddToCartRequest,
  UpdateCartItemRequest 
} from '@/types/cart'

// Cart Types (keeping same interface for compatibility)
export interface CartItem {
  id: string
  product: TemplateProduct
  variantId: string
  quantity: number
  price: number
}

export interface Cart {
  items: CartItem[]
  totalQuantity: number
  totalAmount: number
}

// Cart Actions
type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: TemplateProduct; variantId: string; quantity?: number } }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: Cart }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }

// Cart Context
interface CartContextType {
  cart: Cart
  isLoading: boolean
  error: string | null
  addItem: (product: TemplateProduct, variantId: string, quantity?: number) => Promise<void>
  removeItem: (id: string) => Promise<void>
  updateQuantity: (id: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  getItemCount: () => number
  getTotalAmount: () => number
  syncCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

// Cart Reducer
function cartReducer(state: Cart & { isLoading: boolean; error: string | null }, action: CartAction): Cart & { isLoading: boolean; error: string | null } {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, variantId, quantity = 1 } = action.payload
      const variant = product.variants?.find(v => v.id === variantId)
      if (!variant) return state

      const existingItemIndex = state.items.findIndex(
        item => item.product.id === product.id && item.variantId === variantId
      )

      let newItems: CartItem[]
      if (existingItemIndex >= 0) {
        // Update existing item
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        // Add new item
        const newItem: CartItem = {
          id: `${product.id}-${variantId}`,
          product,
          variantId,
          quantity,
          price: parseFloat(variant.price.amount)
        }
        newItems = [...state.items, newItem]
      }

      return {
        ...state,
        items: newItems,
        totalQuantity: newItems.reduce((sum, item) => sum + item.quantity, 0),
        totalAmount: newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      }
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload.id)
      return {
        ...state,
        items: newItems,
        totalQuantity: newItems.reduce((sum, item) => sum + item.quantity, 0),
        totalAmount: newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      }
    }

    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload
      if (quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: { id } })
      }

      const newItems = state.items.map(item =>
        item.id === id ? { ...item, quantity } : item
      )

      return {
        ...state,
        items: newItems,
        totalQuantity: newItems.reduce((sum, item) => sum + item.quantity, 0),
        totalAmount: newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      }
    }

    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        totalQuantity: 0,
        totalAmount: 0
      }

    case 'LOAD_CART':
      return {
        ...state,
        ...action.payload
      }

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      }

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      }

    default:
      return state
  }
}

// API Helper Functions
async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || `HTTP ${response.status}`)
  }

  return response.json()
}

// Cart Provider
interface CartProviderProps {
  children: React.ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    totalQuantity: 0,
    totalAmount: 0,
    isLoading: false,
    error: null
  })

  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize cart on mount
  useEffect(() => {
    const initializeCart = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true })
        dispatch({ type: 'SET_ERROR', payload: null })

        // Try to get cart from backend
        const backendCart = await apiRequest<{ cart: BackendCart | null }>('/api/cart')
        
        if (backendCart.cart) {
          // Convert backend cart to frontend format
          const frontendCart = convertBackendToFrontendCart(backendCart.cart)
          dispatch({ type: 'LOAD_CART', payload: frontendCart })
        } else {
          // Check if we have localStorage cart to migrate
          const localStorageCart = CartMigrationService.extractLocalStorageCart()
          
          if (CartMigrationService.needsMigration(localStorageCart)) {
            console.log('Migrating localStorage cart to backend...')
            
            // Create backend cart first
            const createResponse = await apiRequest<{ cart: BackendCart }>('/api/cart', {
              method: 'POST'
            })
            
            // Merge localStorage cart
            const mergeResponse = await apiRequest<{ cart: BackendCart }>('/api/cart/merge', {
              method: 'POST',
              body: JSON.stringify({
                localStorageCart: localStorageCart?.items || []
              })
            })
            
            const frontendCart = convertBackendToFrontendCart(mergeResponse.cart)
            dispatch({ type: 'LOAD_CART', payload: frontendCart })
            
            // Clear localStorage after successful migration
            CartMigrationService.clearLocalStorageCart()
          }
        }
      } catch (error) {
        console.error('Error initializing cart:', error)
        
        // Fallback to localStorage if backend fails
        const localStorageCart = CartMigrationService.extractLocalStorageCart()
        if (localStorageCart) {
          dispatch({ type: 'LOAD_CART', payload: localStorageCart })
        }
        
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load cart from server' })
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
        setIsInitialized(true)
      }
    }

    initializeCart()
  }, [])

  // Convert backend cart to frontend format
  const convertBackendToFrontendCart = (backendCart: BackendCart): Cart => {
    const items: CartItem[] = backendCart.items.map(item => ({
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

  const addItem = useCallback(async (product: TemplateProduct, variantId: string, quantity = 1) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })

      const response = await apiRequest<{ cart: BackendCart }>('/api/cart/items', {
        method: 'POST',
        body: JSON.stringify({
          productId: parseInt(product.id),
          variantId: parseInt(variantId),
          quantity
        })
      })

      const frontendCart = convertBackendToFrontendCart(response.cart)
      dispatch({ type: 'LOAD_CART', payload: frontendCart })
    } catch (error) {
      console.error('Error adding item to cart:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add item to cart' })
      
      // Fallback to local state update
      dispatch({ type: 'ADD_ITEM', payload: { product, variantId, quantity } })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  const removeItem = useCallback(async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })

      const response = await apiRequest<{ cart: BackendCart }>(`/api/cart/items/${id}`, {
        method: 'DELETE'
      })

      const frontendCart = convertBackendToFrontendCart(response.cart)
      dispatch({ type: 'LOAD_CART', payload: frontendCart })
    } catch (error) {
      console.error('Error removing item from cart:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to remove item from cart' })
      
      // Fallback to local state update
      dispatch({ type: 'REMOVE_ITEM', payload: { id } })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  const updateQuantity = useCallback(async (id: string, quantity: number) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })

      const response = await apiRequest<{ cart: BackendCart }>(`/api/cart/items/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity })
      })

      const frontendCart = convertBackendToFrontendCart(response.cart)
      dispatch({ type: 'LOAD_CART', payload: frontendCart })
    } catch (error) {
      console.error('Error updating item quantity:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update item quantity' })
      
      // Fallback to local state update
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  const clearCart = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })

      await apiRequest('/api/cart', {
        method: 'DELETE'
      })

      dispatch({ type: 'CLEAR_CART' })
    } catch (error) {
      console.error('Error clearing cart:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to clear cart' })
      
      // Fallback to local state update
      dispatch({ type: 'CLEAR_CART' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  const syncCart = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })

      const response = await apiRequest<{ cart: BackendCart | null }>('/api/cart/sync')
      
      if (response.cart) {
        const frontendCart = convertBackendToFrontendCart(response.cart)
        dispatch({ type: 'LOAD_CART', payload: frontendCart })
      }
    } catch (error) {
      console.error('Error syncing cart:', error)
      dispatch({ type: 'SET_ERROR', payload: 'Failed to sync cart' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  const getItemCount = useCallback(() => state.totalQuantity, [state.totalQuantity])

  const getTotalAmount = useCallback(() => state.totalAmount, [state.totalAmount])

  const value = useMemo(
    () => ({
      cart: {
        items: state.items,
        totalQuantity: state.totalQuantity,
        totalAmount: state.totalAmount
      },
      isLoading: state.isLoading,
      error: state.error,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getItemCount,
      getTotalAmount,
      syncCart
    }),
    [state, addItem, removeItem, updateQuantity, clearCart, getItemCount, getTotalAmount, syncCart]
  )

  // Don't render until initialized to prevent hydration issues
  if (!isInitialized) {
    return (
      <CartContext.Provider value={value}>
        {children}
      </CartContext.Provider>
    )
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// Cart Hook
export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
