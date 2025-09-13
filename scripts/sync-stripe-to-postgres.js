#!/usr/bin/env node

/**
 * Sync Stripe Product IDs to PostgreSQL
 * 
 * This script synchronizes all Stripe product IDs back to the PostgreSQL database,
 * updating the stripeProductId field for products that match by handle or shopifyId.
 */

const { PrismaClient } = require('../src/generated/prisma')
const Stripe = require('stripe')

// Initialize Stripe with secret key from environment
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const prisma = new PrismaClient()

async function syncStripeToPostgres() {
  console.log('🔄 Starting Stripe to PostgreSQL synchronization...\n')
  
  try {
    // Get all products from Stripe
    let allStripeProducts = []
    let hasMore = true
    let startingAfter = null
    
    while (hasMore) {
      const params = { limit: 100 }
      if (startingAfter) {
        params.starting_after = startingAfter
      }
      
      const stripeProducts = await stripe.products.list(params)
      allStripeProducts = allStripeProducts.concat(stripeProducts.data)
      
      hasMore = stripeProducts.has_more
      if (hasMore) {
        startingAfter = stripeProducts.data[stripeProducts.data.length - 1].id
      }
    }
    
    console.log(`📦 Found ${allStripeProducts.length} products in Stripe\n`)
    
    let syncedCount = 0
    let skippedCount = 0
    let errorCount = 0
    
    for (const stripeProduct of allStripeProducts) {
      try {
        const handle = stripeProduct.metadata?.handle
        const shopifyId = stripeProduct.metadata?.shopifyId
        
        if (!handle && !shopifyId) {
          console.log(`⏭️  Skipping ${stripeProduct.name} - no handle or shopifyId in metadata`)
          skippedCount++
          continue
        }
        
        // Find product in database by handle or shopifyId
        let dbProduct = null
        
        if (handle) {
          dbProduct = await prisma.product.findUnique({
            where: { handle }
          })
        }
        
        if (!dbProduct && shopifyId) {
          dbProduct = await prisma.product.findUnique({
            where: { shopifyId }
          })
        }
        
        if (!dbProduct) {
          console.log(`❌ Product not found in database: ${stripeProduct.name} (handle: ${handle}, shopifyId: ${shopifyId})`)
          errorCount++
          continue
        }
        
        // Check if already synced
        if (dbProduct.stripeProductId === stripeProduct.id) {
          console.log(`✅ Already synced: ${dbProduct.title} → ${stripeProduct.id}`)
          syncedCount++
          continue
        }
        
        // Update product with Stripe ID
        await prisma.product.update({
          where: { id: dbProduct.id },
          data: { 
            stripeProductId: stripeProduct.id,
            updatedAt: new Date()
          }
        })
        
        console.log(`🔄 Synced: ${dbProduct.title} → ${stripeProduct.id}`)
        syncedCount++
        
      } catch (error) {
        console.error(`❌ Error syncing ${stripeProduct.name}:`, error.message)
        errorCount++
      }
    }
    
    console.log('\n🎉 Stripe to PostgreSQL synchronization completed!')
    
    // Show summary
    const totalSynced = await prisma.product.count({
      where: { stripeProductId: { not: null } }
    })
    
    const totalProducts = await prisma.product.count({
      where: { deletedAt: null, status: 'ACTIVE' }
    })
    
    console.log(`\n📊 Summary:`)
    console.log(`  ✅ Synced: ${syncedCount}`)
    console.log(`  ⏭️  Skipped: ${skippedCount}`)
    console.log(`  ❌ Errors: ${errorCount}`)
    console.log(`  📦 Total with Stripe ID: ${totalSynced}`)
    console.log(`  📦 Total active products: ${totalProducts}`)
    
    // Show products that still need Stripe IDs
    const productsWithoutStripeId = await prisma.product.findMany({
      where: {
        stripeProductId: null,
        deletedAt: null,
        status: 'ACTIVE'
      },
      select: {
        handle: true,
        title: true,
        shopifyId: true
      },
      orderBy: { handle: 'asc' }
    })
    
    if (productsWithoutStripeId.length > 0) {
      console.log(`\n⏳ Products without Stripe ID (${productsWithoutStripeId.length}):`)
      productsWithoutStripeId.forEach(product => {
        console.log(`  - ${product.handle}: ${product.title}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error during synchronization:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the synchronization
syncStripeToPostgres()
