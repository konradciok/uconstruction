/**
 * Shop Page - Template Implementation
 * 
 * This page demonstrates the integration of template components
 * with the Prisma database through template adapters.
 */

import { ThreeItemGrid } from '@/components/grid/three-item'
import { ProductGrid } from '@/components/grid/product-grid'
import { getShopProducts } from '@/lib/template-adapters'
import { prisma } from '@/lib/db'
import Container from '@/components/Container'
import styles from './page.module.css'

export default async function ShopPage() {
  // Fetch products server-side
  const result = await getShopProducts(prisma, 1, 20)
  const products = result.products
  const hasMore = result.hasMore

  return (
    <div className={styles.shopPage}>
      <Container>
        <div className={styles.content}>
          {/* Header */}
          <header className={`${styles.header} animate-fadeInUp`}>
            <h1 className={styles.title}>Shop</h1>
            <p className={styles.subtitle}>
              Discover our collection of watercolor artwork and prints
            </p>
          </header>

          <div className={styles.sections}>
            {/* Featured Products Section */}
            {products.length > 0 && (
              <section className={`${styles.featuredSection} animate-fadeInUp`}>
                <h2 className={styles.sectionTitle}>Featured Products</h2>
                <ThreeItemGrid products={products.slice(0, 3)} />
              </section>
            )}

            {/* Products Grid */}
            <main className={`${styles.productsSection} animate-fadeInUp`}>
              <div className={styles.productsHeader}>
                <h2 className={styles.productsTitle}>All Products</h2>
              </div>

              <ProductGrid
                products={products}
                loading={false}
                error={undefined}
                hasMore={hasMore}
                columns={{ xs: 1, sm: 2, md: 2, lg: 2, xl: 2 }}
              />
            </main>
          </div>
        </div>
      </Container>
    </div>
  )
}