import { TemplateProduct } from '@/lib/template-adapters'
import styles from './description.module.css'

interface ProductDescriptionProps {
  product: TemplateProduct
}

export function ProductDescription({ product }: ProductDescriptionProps) {
  return (
    <div className={styles.container}>
      {/* Product Description */}
      {product.description && (
        <div className={styles.description}>
          <h3 className={styles.descriptionTitle}>
            Description
          </h3>
          <div 
            className={styles.descriptionContent}
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </div>
      )}

      {/* Product Features */}
      <div className={styles.features}>
        <h3 className={styles.featuresTitle}>
          Product Features
        </h3>
        <ul className={styles.featuresList}>
          <li className={styles.featureItem}>
            <span className={styles.featureIcon}>✓</span>
            Original watercolor artwork
          </li>
          <li className={styles.featureItem}>
            <span className={styles.featureIcon}>✓</span>
            High-quality archival materials
          </li>
          <li className={styles.featureItem}>
            <span className={styles.featureIcon}>✓</span>
            Certificate of authenticity included
          </li>
          <li className={styles.featureItem}>
            <span className={styles.featureIcon}>✓</span>
            Ready for framing
          </li>
          <li className={styles.featureItem}>
            <span className={styles.featureIcon}>✓</span>
            Free shipping on orders over $50
          </li>
        </ul>
      </div>

      {/* Product Tags */}
      {product.tags && product.tags.length > 0 && (
        <div className={styles.tags}>
          <h3 className={styles.tagsTitle}>
            Tags
          </h3>
          <div className={styles.tagsList}>
            {product.tags.map((tag, index) => (
              <span
                key={index}
                className={styles.tag}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Product Collections */}
      {product.collections && product.collections.length > 0 && (
        <div className={styles.collections}>
          <h3 className={styles.collectionsTitle}>
            Collections
          </h3>
          <div className={styles.collectionsList}>
            {product.collections.map((collection, index) => (
              <a
                key={index}
                href={`/shop/${collection.handle}`}
                className={styles.collectionLink}
              >
                {collection.title}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
