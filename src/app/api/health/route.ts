import { NextResponse } from 'next/server'
import { checkDatabaseHealth } from '@/lib/db'

/**
 * Health check endpoint for Docker container health monitoring
 * GET /api/health
 */
export async function GET() {
  try {
    // Check database connection
    const dbHealthy = await checkDatabaseHealth()
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealthy ? 'healthy' : 'unhealthy',
        api: 'healthy'
      }
    }

    const statusCode = dbHealthy ? 200 : 503
    
    return NextResponse.json(health, { status: statusCode })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    )
  }
}
