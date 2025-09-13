import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'
import Stripe from 'stripe'

const prisma = new PrismaClient()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const productId = parseInt(id)
    
    // Get product from database
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        variants: {
          where: {
            priceAmount: { gt: 0 }
          },
          orderBy: { position: 'asc' }
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // If product already has Stripe ID, return it
    if (product.stripeProductId) {
      return NextResponse.json({
        success: true,
        message: 'Product already synced',
        stripeProductId: product.stripeProductId
      })
    }

    // Create product in Stripe
    const stripeProduct = await stripe.products.create({
      name: product.title,
      description: product.bodyHtml ? 
        product.bodyHtml.replace(/<[^>]*>/g, '').substring(0, 500) : 
        `Fine art print - ${product.title}`,
      metadata: {
        handle: product.handle,
        shopifyId: product.shopifyId,
        source: 'admin_dashboard',
        syncDate: new Date().toISOString()
      }
    })

    // Create prices for each variant
    const createdPrices = []
    for (const variant of product.variants) {
      if (variant.priceAmount && parseFloat(variant.priceAmount.toString()) > 0) {
        const price = await stripe.prices.create({
          product: stripeProduct.id,
          unit_amount: Math.round(parseFloat(variant.priceAmount.toString()) * 100),
          currency: variant.priceCurrency || 'usd',
          metadata: {
            variantId: variant.shopifyId,
            sku: variant.sku || '',
            title: variant.title || '',
            position: variant.position?.toString() || '0'
          }
        })
        createdPrices.push(price.id)
      }
    }

    // Update product in database with Stripe ID
    await prisma.product.update({
      where: { id: productId },
      data: { 
        stripeProductId: stripeProduct.id,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Product synced successfully',
      stripeProductId: stripeProduct.id,
      pricesCreated: createdPrices.length
    })

  } catch (error) {
    console.error('Error syncing product:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to sync product',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
