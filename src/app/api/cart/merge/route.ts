/**
 * Cart Merge API Route
 * 
 * Handles merging localStorage cart with backend cart
 * POST /api/cart/merge - Merge localStorage cart with backend cart
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { CartService } from '@/lib/cart-service'
import { SessionManager } from '@/lib/session-manager'
import { productLogger } from '@/lib/logger'
import type { CartMergeRequest } from '@/types/cart'

const cartService = new CartService(prisma)

/**
 * POST /api/cart/merge - Merge localStorage cart with backend cart
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
    const { localStorageCart } = body as CartMergeRequest

    // Validate input
    if (!Array.isArray(localStorageCart)) {
      return NextResponse.json(
        { error: 'Invalid localStorage cart data' },
        { status: 400 }
      )
    }

    // Get or create backend cart
    let backendCartResult = await cartService.getCart(sessionId)
    
    if (!backendCartResult.success) {
      return NextResponse.json(
        { error: backendCartResult.error },
        { status: 500 }
      )
    }

    if (!backendCartResult.data) {
      // Create new cart
      const createResult = await cartService.createCart(sessionId)
      
      if (!createResult.success) {
        return NextResponse.json(
          { error: createResult.error },
          { status: 500 }
      )
      }
      
      backendCartResult = createResult
    }

    // Merge carts
    const mergeResult = await cartService.mergeCarts(
      backendCartResult.data!,
      localStorageCart
    )

    if (!mergeResult.success) {
      return NextResponse.json(
        { error: mergeResult.error },
        { status: 500 }
      )
    }

    const headers = SessionManager.createSessionHeaders(sessionId)
    return NextResponse.json(
      { 
        cart: mergeResult.data,
        message: 'Carts merged successfully'
      },
      { headers }
    )
  } catch (error) {
    productLogger.error('Error in POST /api/cart/merge', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
