/**
 * Template Collections API Endpoint
 * 
 * Provides template-compatible collection data
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getTemplateCollections } from '@/lib/template-adapters'

export async function GET(_request: NextRequest) {
  try {
    const collections = await getTemplateCollections(prisma)
    
    return NextResponse.json({
      collections,
      count: collections.length
    })
  } catch (error) {
    console.error('Error fetching collections:', error)
    return NextResponse.json(
      { error: 'Failed to fetch collections' },
      { status: 500 }
    )
  }
}
