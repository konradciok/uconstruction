import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { force: _force = false } = body

    console.log('Starting database to Stripe synchronization...')

    // Run the sync script
    const { stdout, stderr } = await execAsync(
      `cd /Users/konradciok/uc/uconstruction && node scripts/sync-products-to-stripe.js`
    )

    if (stderr) {
      console.error('Sync script stderr:', stderr)
    }

    console.log('Sync script stdout:', stdout)

    return NextResponse.json({
      success: true,
      message: 'Database to Stripe synchronization completed',
      output: stdout
    })
  } catch (error) {
    console.error('Error running database to Stripe sync:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to run database to Stripe synchronization',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
