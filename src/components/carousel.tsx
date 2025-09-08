/**
 * Carousel Component - Template Implementation
 * 
 * Displays a horizontal scrolling carousel of products
 * with smooth animation and responsive design.
 */

'use client'

import Link from 'next/link'
import { GridTileImage } from './grid/tile'
import { TemplateProduct } from '@/lib/template-adapters'
import styles from './carousel.module.css'

interface CarouselProps {
  products: TemplateProduct[]
  title?: string
  className?: string
}

export function Carousel({ products, title, className }: CarouselProps) {
  if (!products?.length) return null

  // Purposefully duplicating products to make the carousel loop smoothly
  const carouselProducts = [...products, ...products, ...products]

  return (
    <div className={className}>
      {title && (
        <h2 className={styles.title}>
          {title}
        </h2>
      )}
      <div className={styles.container}>
        <ul className={styles.carousel}>
          {carouselProducts.map((product, i) => (
            <li
              key={`${product.handle}${i}`}
              className={styles.carouselItem}
            >
              <Link href={`/product/${product.handle}`} className={styles.productLink}>
                <GridTileImage
                  product={product}
                  isInteractive={true}
                  priority={i < 3} // Prioritize first few images
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}