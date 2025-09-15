import { PrismaClient } from '@/generated/prisma'

// Global variable to store the PrismaClient instance
declare global {
  var __prisma: PrismaClient | undefined
}

/**
 * Singleton PrismaClient instance with proper connection pooling
 * 
 * In development, the instance is stored in a global variable to prevent
 * multiple instances during hot reloads. In production, this creates a
 * single instance per process.
 */
export const prisma = globalThis.__prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

// Store in global variable in development to prevent multiple instances
if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma
}

/**
 * Gracefully disconnect from the database
 * Should be called on application shutdown
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect()
}

/**
 * Health check for database connection
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('[Database] Health check failed:', error)
    return false
  }
}

// Handle process termination gracefully
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    await disconnectDatabase()
  })

  process.on('SIGINT', async () => {
    await disconnectDatabase()
    process.exit(0)
  })

  process.on('SIGTERM', async () => {
    await disconnectDatabase()
    process.exit(0)
  })
}
