/**
 * Template Tags API Endpoint
 * 
 * Provides template-compatible tag data
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'
import { getTemplateTags } from '@/lib/template-adapters'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
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
