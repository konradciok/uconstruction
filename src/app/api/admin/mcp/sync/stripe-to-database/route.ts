import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { updateExisting = true } = body

    console.log('Starting Stripe to database synchronization...')

    // Run the sync script
    const { stdout, stderr } = await execAsync(
      `cd /Users/konradciok/uc/uconstruction && node scripts/sync-stripe-to-postgres.js`
    )

    if (stderr) {
      console.error('Sync script stderr:', stderr)
    }

    console.log('Sync script stdout:', stdout)

    return NextResponse.json({
      success: true,
      message: 'Stripe to database synchronization completed',
      output: stdout
    })
  } catch (error) {
    console.error('Error running Stripe to database sync:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to run Stripe to database synchronization',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
