/**
 * Template Tags API Endpoint
 * 
 * Provides template-compatible tag data
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getTemplateTags } from '@/lib/template-adapters'

export async function GET(_request: NextRequest) {
  try {
    const tags = await getTemplateTags(prisma)
    
    return NextResponse.json({
      tags,
      count: tags.length
    })
  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    )
  }
}
