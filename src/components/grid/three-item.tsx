import Link from 'next/link'
import { GridTileImage } from './tile'
import { TemplateProduct } from '@/lib/template-adapters'
import styles from './three-item.module.css'

interface ThreeItemGridItemProps {
  product: TemplateProduct
  size: 'full' | 'half'
  priority?: boolean
}

function ThreeItemGridItem({ product, size, priority }: ThreeItemGridItemProps) {
  return (
    <div
      className={size === 'full' ? styles.gridItemFull : styles.gridItemHalf}
    >
      <Link
        className={styles.link}
        href={`/product/${product.handle}`}
        prefetch={true}
      >
        <GridTileImage
          product={product}
          priority={priority}
        />
      </Link>
    </div>
  )
}

interface ThreeItemGridProps {
  products?: TemplateProduct[]
}

export function ThreeItemGrid({ products }: ThreeItemGridProps) {
  // If no products provided, show placeholder
  if (!products || products.length < 3) {
    return (
      <section className={styles.grid}>
        <div className={styles.gridItemFull}>
          <div className={styles.placeholder}>
            <span className={styles.placeholderText}>Featured Product 1</span>
          </div>
        </div>
        <div className={styles.gridItemHalf}>
          <div className={styles.placeholder}>
            <span className={styles.placeholderText}>Featured Product 2</span>
          </div>
        </div>
        <div className={styles.gridItemHalf}>
          <div className={styles.placeholder}>
            <span className={styles.placeholderText}>Featured Product 3</span>
          </div>
        </div>
      </section>
    )
  }

  const [firstProduct, secondProduct, thirdProduct] = products

  return (
    <section className={styles.grid}>
      <ThreeItemGridItem size="full" product={firstProduct} priority={true} />
      <ThreeItemGridItem size="half" product={secondProduct} priority={true} />
      <ThreeItemGridItem size="half" product={thirdProduct} />
    </section>
  )
}
