/**
 * Cart Items API Routes
 * 
 * Handles cart item operations
 * POST /api/cart/items - Add item to cart
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { CartService } from '@/lib/cart-service'
import { SessionManager } from '@/lib/session-manager'
import { productLogger } from '@/lib/logger'
import type { AddToCartRequest } from '@/types/cart'

const cartService = new CartService(prisma)

/**
 * POST /api/cart/items - Add item to cart
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const sessionId = SessionManager.getSessionIdFromRequest(request)
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session required' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { productId, variantId, quantity = 1 } = body as AddToCartRequest

    // Validate input
    if (!productId || !variantId || quantity <= 0) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    // Get or create cart
    let cartResult = await cartService.getCart(sessionId)
    
    if (!cartResult.success) {
      return NextResponse.json(
        { error: cartResult.error },
        { status: 500 }
      )
    }

    if (!cartResult.data) {
      // Create new cart
      const createResult = await cartService.createCart(sessionId)
      
      if (!createResult.success) {
        return NextResponse.json(
          { error: createResult.error },
          { status: 500 }
        )
      }
      
      cartResult = createResult
    }

    // Add item to cart
    const addResult = await cartService.addItem(cartResult.data!.id, {
      productId,
      variantId,
      quantity
    })

    if (!addResult.success) {
      return NextResponse.json(
        { error: addResult.error },
        { status: 500 }
      )
    }

    // Get updated cart
    const updatedCartResult = await cartService.getCart(sessionId)
    
    if (!updatedCartResult.success) {
      return NextResponse.json(
        { error: updatedCartResult.error },
        { status: 500 }
      )
    }

    const headers = SessionManager.createSessionHeaders(sessionId)
    return NextResponse.json(
      { 
        cartItem: addResult.data,
        cart: updatedCartResult.data
      },
      { headers }
    )
  } catch (error) {
    productLogger.error('Error in POST /api/cart/items', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
