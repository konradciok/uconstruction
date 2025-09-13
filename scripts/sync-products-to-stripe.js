#!/usr/bin/env node

/**
 * Sync Products from PostgreSQL to Stripe
 * 
 * This script synchronizes products from the database to Stripe,
 * creating products and prices, and updating the stripeProductId field.
 */

const { PrismaClient } = require('../src/generated/prisma')
const Stripe = require('stripe')

// Initialize Stripe with secret key from environment
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const prisma = new PrismaClient()

async function syncProductsToStripe() {
  console.log('🔄 Starting product synchronization to Stripe...\n')
  
  try {
    // Get products that haven't been synced to Stripe yet
    const productsToSync = await prisma.product.findMany({
      where: {
        stripeProductId: null,
        deletedAt: null,
        status: 'ACTIVE'
      },
      include: {
        variants: {
          where: {
            // Only include variants with valid prices
            priceAmount: {
              gt: 0
            }
          },
          orderBy: {
            position: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })
    
    console.log(`📦 Found ${productsToSync.length} products to sync\n`)
    
    for (const product of productsToSync) {
      console.log(`🔄 Syncing: ${product.title} (${product.handle})`)
      
      try {
        // Create product in Stripe
        const stripeProduct = await stripe.products.create({
          name: product.title,
          description: product.bodyHtml ? 
            product.bodyHtml.replace(/<[^>]*>/g, '').substring(0, 500) : 
            `Fine art print - ${product.title}`,
          metadata: {
            handle: product.handle,
            shopifyId: product.shopifyId,
            source: 'postgres_sync',
            syncDate: new Date().toISOString()
          }
        })
        
        console.log(`  ✅ Created Stripe product: ${stripeProduct.id}`)
        
        // Create prices for each variant
        const createdPrices = []
        for (const variant of product.variants) {
          if (variant.priceAmount && variant.priceAmount > 0) {
            const price = await stripe.prices.create({
              product: stripeProduct.id,
              unit_amount: Math.round(parseFloat(variant.priceAmount) * 100), // Convert to cents
              currency: variant.priceCurrency || 'usd',
              metadata: {
                variantId: variant.shopifyId,
                sku: variant.sku || '',
                title: variant.title || '',
                position: variant.position?.toString() || '0'
              }
            })
            createdPrices.push(price.id)
            console.log(`    ✅ Created price: ${price.id} (${variant.title} - $${variant.priceAmount})`)
          }
        }
        
        // Update the product in database with Stripe ID
        await prisma.product.update({
          where: { id: product.id },
          data: { 
            stripeProductId: stripeProduct.id,
            updatedAt: new Date()
          }
        })
        
        console.log(`  ✅ Updated database with Stripe ID: ${stripeProduct.id}`)
        console.log(`  📊 Created ${createdPrices.length} prices\n`)
        
      } catch (error) {
        console.error(`  ❌ Error syncing ${product.handle}:`, error.message)
        console.log('') // Empty line for readability
      }
    }
    
    console.log('🎉 Product synchronization completed!')
    
    // Show summary
    const syncedCount = await prisma.product.count({
      where: { stripeProductId: { not: null } }
    })
    
    const totalCount = await prisma.product.count({
      where: { deletedAt: null, status: 'ACTIVE' }
    })
    
    console.log(`\n📊 Summary:`)
    console.log(`  ✅ Synced: ${syncedCount}`)
    console.log(`  ⏳ Remaining: ${totalCount - syncedCount}`)
    console.log(`  📦 Total active products: ${totalCount}`)
    
  } catch (error) {
    console.error('❌ Error during synchronization:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the synchronization
syncProductsToStripe()
