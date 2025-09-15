/**
 * Product Detail Page - Server Component Implementation
 * 
 * This page uses server-side data fetching and parameter handling
 * for better performance and SEO.
 */

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fetchProductByHandle } from '@/lib/product-fetcher'
import ProductPageClient from '@/components/product/ProductPageClient'

// Use inline param typing to align with Next.js PageProps

/**
 * Generate metadata for the product page
 */
export async function generateMetadata(props: unknown): Promise<Metadata> {
  const { params } = props as { params: { handle: string } }
  const { handle } = params
  
  try {
    const result = await fetchProductByHandle(handle)
    
    if (!result.success || !result.product) {
      return {
        title: 'Product Not Found | UConstruction',
        description: 'The requested product could not be found.'
      }
    }

    const product = result.product
    
    return {
      title: `${product.title} | UConstruction`,
      description: product.bodyHtml ? 
        product.bodyHtml.replace(/<[^>]*>/g, '').substring(0, 160) : 
        `Shop ${product.title} - high quality watercolor artwork and supplies.`,
      keywords: `${product.title}, watercolor, art, shop, product, ${product.vendor || ''}`,
      openGraph: {
        title: product.title,
        description: product.bodyHtml ? 
          product.bodyHtml.replace(/<[^>]*>/g, '').substring(0, 160) : 
          `Shop ${product.title}`,
        images: product.media && product.media.length > 0 
          ? [product.media[0].url] 
          : [],
      },
    }
  } catch (error) {
    console.error('Error generating metadata for product:', error)
    return {
      title: 'Product | UConstruction',
      description: 'Shop our collection of watercolor artwork and supplies.'
    }
  }
}

/**
 * Main product page component
 */
export default async function ProductPage(props: unknown) {
  const { params } = props as { params: { handle: string } }
  const { handle } = params
  
  // Fetch product data server-side
  const result = await fetchProductByHandle(handle)
  
  // Handle errors and not found cases
  if (!result.success) {
    if (result.error === 'Product not found') {
      notFound()
    }
    
    // For other errors, we could show an error page
    // For now, we'll use notFound() as a fallback
    notFound()
  }
  
  if (!result.product) {
    notFound()
  }

  // Render the client component with the fetched product
  return <ProductPageClient product={result.product} />
}