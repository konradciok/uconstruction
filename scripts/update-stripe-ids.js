#!/usr/bin/env node

/**
 * Update Stripe Product IDs in PostgreSQL
 * 
 * This script updates the stripeProductId field in the Product table
 * with the corresponding Stripe product IDs.
 */

const { PrismaClient } = require('../src/generated/prisma')

const prisma = new PrismaClient()

// Mapping of product handles to Stripe product IDs
const stripeProductMappings = {
  'novocumulus-01-fine-art-print': 'prod_T2kS0ddu50quBd',
  'novocumulus-46-fine-art-print': null, // Not yet synced
  'stratocumulus-03-copy': null, // Not yet synced
  'novocumulus-07-fine-art-print-kopia': null, // Not yet synced
  'novocumulus-30-fine-art-print': null, // Not yet synced
}

async function updateStripeProductIds() {
  console.log('🔄 Updating Stripe Product IDs...\n')
  
  try {
    for (const [handle, stripeProductId] of Object.entries(stripeProductMappings)) {
      if (stripeProductId) {
        const result = await prisma.product.update({
          where: { handle },
          data: { stripeProductId },
        })
        console.log(`✅ Updated ${handle} → ${stripeProductId}`)
      } else {
        console.log(`⏳ Skipped ${handle} (not yet synced to Stripe)`)
      }
    }
    
    console.log('\n🎉 Stripe Product ID update completed!')
    
    // Show current state
    console.log('\n📊 Current Product → Stripe ID mappings:')
    const products = await prisma.product.findMany({
      select: {
        handle: true,
        title: true,
        stripeProductId: true,
      },
      orderBy: { handle: 'asc' }
    })
    
    products.forEach(product => {
      const status = product.stripeProductId ? '✅' : '⏳'
      console.log(`${status} ${product.handle} → ${product.stripeProductId || 'Not synced'}`)
    })
    
  } catch (error) {
    console.error('❌ Error updating Stripe Product IDs:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the update
updateStripeProductIds()
