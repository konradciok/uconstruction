/**
 * Cart Sync API Route
 * 
 * Handles cart synchronization
 * GET /api/cart/sync - Sync cart state
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { CartService } from '@/lib/cart-service'
import { SessionManager } from '@/lib/session-manager'
import { productLogger } from '@/lib/logger'

const cartService = new CartService(prisma)

/**
 * GET /api/cart/sync - Sync cart state
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const sessionId = SessionManager.getSessionIdFromRequest(request)
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session required' },
        { status: 401 }
      )
    }

    // Sync cart (refresh cart data)
    const result = await cartService.syncCart(sessionId)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    const headers = SessionManager.createSessionHeaders(sessionId)
    return NextResponse.json(
      { 
        cart: result.data,
        message: 'Cart synced successfully'
      },
      { headers }
    )
  } catch (error) {
    productLogger.error('Error in GET /api/cart/sync', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
