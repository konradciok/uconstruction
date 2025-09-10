/**
 * Cart Item API Routes
 * 
 * Handles individual cart item operations
 * PUT /api/cart/items/[itemId] - Update item quantity
 * DELETE /api/cart/items/[itemId] - Remove item from cart
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { CartService } from '@/lib/cart-service'
import { SessionManager } from '@/lib/session-manager'
import { productLogger } from '@/lib/logger'
import type { UpdateCartItemRequest } from '@/types/cart'

const cartService = new CartService(prisma)

/**
 * PUT /api/cart/items/[itemId] - Update item quantity
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
): Promise<NextResponse> {
  try {
    const sessionId = SessionManager.getSessionIdFromRequest(request)
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session required' },
        { status: 401 }
      )
    }

    const { itemId } = await params

    // Parse request body
    const body = await request.json()
    const { quantity } = body as UpdateCartItemRequest

    // Validate input
    if (quantity === undefined || quantity < 0) {
      return NextResponse.json(
        { error: 'Invalid quantity' },
        { status: 400 }
      )
    }

    // Update item quantity
    const result = await cartService.updateItemQuantity(itemId, quantity)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    // Get updated cart
    const cartResult = await cartService.getCart(sessionId)
    
    if (!cartResult.success) {
      return NextResponse.json(
        { error: cartResult.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      cartItem: result.data,
      cart: cartResult.data
    })
  } catch (error) {
    productLogger.error('Error in PUT /api/cart/items/[itemId]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/cart/items/[itemId] - Remove item from cart
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
): Promise<NextResponse> {
  try {
    const sessionId = SessionManager.getSessionIdFromRequest(request)
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session required' },
        { status: 401 }
      )
    }

    const { itemId } = await params

    // Remove item from cart
    const result = await cartService.removeItem(itemId)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    // Get updated cart
    const cartResult = await cartService.getCart(sessionId)
    
    if (!cartResult.success) {
      return NextResponse.json(
        { error: cartResult.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Item removed successfully',
      cart: cartResult.data
    })
  } catch (error) {
    productLogger.error('Error in DELETE /api/cart/items/[itemId]', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
