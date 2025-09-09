#!/usr/bin/env node

/**
 * Sample Data Seeding Script
 * Populates the PostgreSQL database with sample products for testing
 */

const { PrismaClient } = require('../src/generated/prisma')

const prisma = new PrismaClient()

const sampleProducts = [
  {
    shopifyId: 'gid://shopify/Product/1',
    handle: 'watercolor-landscape-1',
    title: 'Mountain Landscape Watercolor',
    bodyHtml: '<p>A beautiful watercolor painting of mountain landscapes with soft, flowing colors.</p>',
    vendor: 'Art Studio',
    productType: 'Original Artwork',
    status: 'active',
    publishedAt: new Date(),
    shopifyUpdatedAt: new Date(),
    variants: [
      {
        shopifyId: 'gid://shopify/ProductVariant/1',
        title: 'Original',
        sku: 'WL-001-ORIG',
        priceAmount: 299.99,
        priceCurrency: 'USD',
        compareAtPriceAmount: 399.99,
        compareAtPriceCurrency: 'USD',
        position: 1,
        inventoryPolicy: 'deny',
        requiresShipping: true,
        taxable: true,
        weight: 0.5,
        weightUnit: 'kg'
      }
    ],
    media: [
      {
        shopifyId: 'gid://shopify/MediaImage/1',
        mediaType: 'image',
        url: '/assets/pics/gallery/landscape1.webp',
        altText: 'Mountain Landscape Watercolor',
        position: 1,
        width: 800,
        height: 600
      }
    ],
    options: [
      {
        name: 'Size',
        position: 1
      }
    ]
  },
  {
    shopifyId: 'gid://shopify/Product/2',
    handle: 'watercolor-portrait-1',
    title: 'Portrait Study in Watercolor',
    bodyHtml: '<p>An intimate portrait study showcasing the delicate nature of watercolor techniques.</p>',
    vendor: 'Art Studio',
    productType: 'Original Artwork',
    status: 'active',
    publishedAt: new Date(),
    shopifyUpdatedAt: new Date(),
    variants: [
      {
        shopifyId: 'gid://shopify/ProductVariant/2',
        title: 'Original',
        sku: 'WP-001-ORIG',
        priceAmount: 199.99,
        priceCurrency: 'USD',
        compareAtPriceAmount: 249.99,
        compareAtPriceCurrency: 'USD',
        position: 1,
        inventoryPolicy: 'deny',
        requiresShipping: true,
        taxable: true,
        weight: 0.3,
        weightUnit: 'kg'
      }
    ],
    media: [
      {
        shopifyId: 'gid://shopify/MediaImage/2',
        mediaType: 'image',
        url: '/assets/pics/gallery/portrait1.webp',
        altText: 'Portrait Study in Watercolor',
        position: 1,
        width: 600,
        height: 800
      }
    ],
    options: [
      {
        name: 'Size',
        position: 1
      }
    ]
  },
  {
    shopifyId: 'gid://shopify/Product/3',
    handle: 'watercolor-abstract-1',
    title: 'Abstract Watercolor Composition',
    bodyHtml: '<p>A vibrant abstract composition exploring color and form through watercolor techniques.</p>',
    vendor: 'Art Studio',
    productType: 'Original Artwork',
    status: 'active',
    publishedAt: new Date(),
    shopifyUpdatedAt: new Date(),
    variants: [
      {
        shopifyId: 'gid://shopify/ProductVariant/3',
        title: 'Original',
        sku: 'WA-001-ORIG',
        priceAmount: 399.99,
        priceCurrency: 'USD',
        compareAtPriceAmount: 499.99,
        compareAtPriceCurrency: 'USD',
        position: 1,
        inventoryPolicy: 'deny',
        requiresShipping: true,
        taxable: true,
        weight: 0.7,
        weightUnit: 'kg'
      }
    ],
    media: [
      {
        shopifyId: 'gid://shopify/MediaImage/3',
        mediaType: 'image',
        url: '/assets/pics/gallery/abstract1.webp',
        altText: 'Abstract Watercolor Composition',
        position: 1,
        width: 1000,
        height: 800
      }
    ],
    options: [
      {
        name: 'Size',
        position: 1
      }
    ]
  }
]

const sampleCollections = [
  {
    shopifyId: 'gid://shopify/Collection/1',
    handle: 'landscapes',
    title: 'Landscape Paintings',
    bodyHtml: '<p>Beautiful landscape paintings in watercolor.</p>',
    sortOrder: 'manual'
  },
  {
    shopifyId: 'gid://shopify/Collection/2',
    handle: 'portraits',
    title: 'Portrait Studies',
    bodyHtml: '<p>Intimate portrait studies and character studies.</p>',
    sortOrder: 'manual'
  },
  {
    shopifyId: 'gid://shopify/Collection/3',
    handle: 'abstract',
    title: 'Abstract Art',
    bodyHtml: '<p>Abstract compositions exploring color and form.</p>',
    sortOrder: 'manual'
  }
]

const sampleTags = [
  { name: 'watercolor' },
  { name: 'original' },
  { name: 'landscape' },
  { name: 'portrait' },
  { name: 'abstract' },
  { name: 'art' },
  { name: 'painting' }
]

async function seedSampleData() {
  console.log('🌱 Starting to seed sample data...')
  
  try {
    // Clear existing data
    console.log('🧹 Clearing existing data...')
    await prisma.productTag.deleteMany()
    await prisma.productCollection.deleteMany()
    await prisma.productMedia.deleteMany()
    await prisma.variant.deleteMany()
    await prisma.productOption.deleteMany()
    await prisma.product.deleteMany()
    await prisma.collection.deleteMany()
    await prisma.tag.deleteMany()

    // Create tags
    console.log('🏷️  Creating tags...')
    const createdTags = {}
    for (const tagData of sampleTags) {
      const tag = await prisma.tag.create({
        data: tagData
      })
      createdTags[tag.name] = tag
    }

    // Create collections
    console.log('📁 Creating collections...')
    const createdCollections = {}
    for (const collectionData of sampleCollections) {
      const collection = await prisma.collection.create({
        data: collectionData
      })
      createdCollections[collection.handle] = collection
    }

    // Create products with variants, media, and options
    console.log('🎨 Creating products...')
    for (const productData of sampleProducts) {
      const { variants, media, options, ...productInfo } = productData
      
      const product = await prisma.product.create({
        data: productInfo
      })

      // Create options
      for (const optionData of options) {
        await prisma.productOption.create({
          data: {
            ...optionData,
            productId: product.id
          }
        })
      }

      // Create variants
      for (const variantData of variants) {
        await prisma.variant.create({
          data: {
            ...variantData,
            productId: product.id
          }
        })
      }

      // Create media
      for (const mediaData of media) {
        await prisma.productMedia.create({
          data: {
            ...mediaData,
            productId: product.id
          }
        })
      }

      // Create product-tag relationships
      const tagsToAdd = []
      if (product.handle.includes('landscape')) tagsToAdd.push('landscape', 'watercolor')
      if (product.handle.includes('portrait')) tagsToAdd.push('portrait', 'watercolor')
      if (product.handle.includes('abstract')) tagsToAdd.push('abstract', 'watercolor')
      tagsToAdd.push('original', 'art', 'painting')

      for (const tagName of tagsToAdd) {
        if (createdTags[tagName]) {
          await prisma.productTag.create({
            data: {
              productId: product.id,
              tagId: createdTags[tagName].id
            }
          })
        }
      }

      // Create product-collection relationships
      let collectionHandle = ''
      if (product.handle.includes('landscape')) collectionHandle = 'landscapes'
      if (product.handle.includes('portrait')) collectionHandle = 'portraits'
      if (product.handle.includes('abstract')) collectionHandle = 'abstract'

      if (createdCollections[collectionHandle]) {
        await prisma.productCollection.create({
          data: {
            productId: product.id,
            collectionId: createdCollections[collectionHandle].id
          }
        })
      }
    }

    console.log('✅ Sample data seeded successfully!')
    
    // Verify the data
    const productCount = await prisma.product.count()
    const variantCount = await prisma.variant.count()
    const mediaCount = await prisma.productMedia.count()
    const tagCount = await prisma.tag.count()
    const collectionCount = await prisma.collection.count()

    console.log('📊 Data summary:')
    console.log(`   Products: ${productCount}`)
    console.log(`   Variants: ${variantCount}`)
    console.log(`   Media: ${mediaCount}`)
    console.log(`   Tags: ${tagCount}`)
    console.log(`   Collections: ${collectionCount}`)

  } catch (error) {
    console.error('❌ Error seeding data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seeding
if (require.main === module) {
  seedSampleData()
    .then(() => {
      console.log('🎉 Seeding completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error)
      process.exit(1)
    })
}

module.exports = { seedSampleData }
