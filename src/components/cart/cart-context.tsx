'use client'

import React, { createContext, useContext, useReducer, useMemo, useCallback } from 'react'
import { TemplateProduct } from '@/lib/template-adapters'

// Cart Types
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

// Cart Context
interface CartContextType {
  cart: Cart
  addItem: (product: TemplateProduct, variantId: string, quantity?: number) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getItemCount: () => number
  getTotalAmount: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

// Cart Reducer
function cartReducer(state: Cart, action: CartAction): Cart {
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
        items: newItems,
        totalQuantity: newItems.reduce((sum, item) => sum + item.quantity, 0),
        totalAmount: newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      }
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload.id)
      return {
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
        items: newItems,
        totalQuantity: newItems.reduce((sum, item) => sum + item.quantity, 0),
        totalAmount: newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      }
    }

    case 'CLEAR_CART':
      return {
        items: [],
        totalQuantity: 0,
        totalAmount: 0
      }

    case 'LOAD_CART':
      return action.payload

    default:
      return state
  }
}

// Cart Provider
interface CartProviderProps {
  children: React.ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  const [cart, dispatch] = useReducer(cartReducer, {
    items: [],
    totalQuantity: 0,
    totalAmount: 0
  })

  // Load cart from localStorage on mount
  React.useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        dispatch({ type: 'LOAD_CART', payload: parsedCart })
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  React.useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  const addItem = useCallback((product: TemplateProduct, variantId: string, quantity = 1) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, variantId, quantity } })
  }, [])

  const removeItem = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id } })
  }, [])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } })
  }, [])

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' })
  }, [])

  const getItemCount = useCallback(() => cart.totalQuantity, [cart.totalQuantity])

  const getTotalAmount = useCallback(() => cart.totalAmount, [cart.totalAmount])

  const value = useMemo(
    () => ({
      cart,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getItemCount,
      getTotalAmount
    }),
    [cart, addItem, removeItem, updateQuantity, clearCart, getItemCount, getTotalAmount]
  )

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
