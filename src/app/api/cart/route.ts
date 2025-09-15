/**
 * Cart API Routes
 * 
 * Handles cart creation, retrieval, updates, and deletion
 * GET /api/cart - Get current cart
 * POST /api/cart - Create new cart
 * PUT /api/cart - Update cart
 * DELETE /api/cart - Clear cart
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { CartService } from '@/lib/cart-service'
import { SessionManager } from '@/lib/session-manager'
import { productLogger } from '@/lib/logger'

const cartService = new CartService(prisma)

/**
 * GET /api/cart - Get current cart
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Get session ID from request
    let sessionId = SessionManager.getSessionIdFromRequest(request)
    
    if (!sessionId) {
      // Create new session if none exists
      sessionId = SessionManager.generateSessionId()
    }

    // Get cart for this session
    const result = await cartService.getCart(sessionId)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    // If no cart exists, create one
    if (!result.data) {
      const createResult = await cartService.createCart(sessionId)
      
      if (!createResult.success) {
        return NextResponse.json(
          { error: createResult.error },
          { status: 500 }
        )
      }

      const headers = SessionManager.createSessionHeaders(sessionId)
      return NextResponse.json(
        { cart: createResult.data },
        { headers }
      )
    }

    const headers = SessionManager.createSessionHeaders(sessionId)
    return NextResponse.json(
      { cart: result.data },
      { headers }
    )
  } catch (error) {
    productLogger.error('Error in GET /api/cart', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/cart - Create new cart
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Get session ID from request
    let sessionId = SessionManager.getSessionIdFromRequest(request)
    
    if (!sessionId) {
      sessionId = SessionManager.generateSessionId()
    }

    // Check if cart already exists
    const existingCart = await cartService.getCart(sessionId)
    
    if (existingCart.success && existingCart.data) {
      // Return existing cart
      const headers = SessionManager.createSessionHeaders(sessionId)
      return NextResponse.json(
        { cart: existingCart.data },
        { headers }
      )
    }

    // Create new cart
    const result = await cartService.createCart(sessionId)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    const headers = SessionManager.createSessionHeaders(sessionId)
    return NextResponse.json(
      { cart: result.data },
      { headers }
    )
  } catch (error) {
    productLogger.error('Error in POST /api/cart', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/cart - Update cart (placeholder for future cart updates)
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const sessionId = SessionManager.getSessionIdFromRequest(request)
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session required' },
        { status: 401 }
      )
    }

    // For now, just return the current cart
    // This endpoint can be extended for cart-level updates
    const result = await cartService.getCart(sessionId)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    if (!result.data) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ cart: result.data })
  } catch (error) {
    productLogger.error('Error in PUT /api/cart', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/cart - Clear cart
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const sessionId = SessionManager.getSessionIdFromRequest(request)
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session required' },
        { status: 401 }
      )
    }

    // Get cart first
    const cartResult = await cartService.getCart(sessionId)
    
    if (!cartResult.success || !cartResult.data) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      )
    }

    // Delete the cart
    const deleteResult = await cartService.deleteCart(cartResult.data.id)
    
    if (!deleteResult.success) {
      return NextResponse.json(
        { error: deleteResult.error },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Cart cleared successfully' })
  } catch (error) {
    productLogger.error('Error in DELETE /api/cart', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
