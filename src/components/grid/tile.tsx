import clsx from 'clsx'
import Image from 'next/image'
import { TemplateProduct } from '@/lib/template-adapters'
import styles from './tile.module.css'

interface GridTileImageProps {
  product: TemplateProduct
  isInteractive?: boolean
  active?: boolean
  priority?: boolean
  className?: string
}

export function GridTileImage({
  product,
  isInteractive = true,
  active = false,
  priority = false,
  className
}: GridTileImageProps) {
  const imageUrl = product.featuredImage.url
  const imageAlt = product.featuredImage.altText
  const price = product.priceRange.minVariantPrice.amount

  return (
    <div
      className={clsx(
        styles.tile,
        {
          [styles.tileActive]: active,
          [styles.tileInactive]: !active
        },
        className
      )}
    >
      {imageUrl ? (
        <div className={styles.imageContainer}>
          <Image
            className={clsx(styles.image, {
              [styles.imageInteractive]: isInteractive
            })}
            src={imageUrl}
            alt={imageAlt}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            priority={priority}
          />
          
          {/* Product Label Overlay */}
          <div className={styles.overlay}>
            <h3 className={styles.title}>
              {product.title}
            </h3>
            <div className={styles.priceContainer}>
              <span className={styles.price}>
                ${price}
              </span>
              {product.vendor && (
                <span className={styles.vendor}>
                  by {product.vendor}
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.placeholder}>
          <span className={styles.placeholderIcon}>🖼️</span>
        </div>
      )}
    </div>
  )
}
