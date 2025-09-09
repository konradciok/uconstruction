/**
 * Homepage - Template Implementation
 * 
 * Main landing page showcasing featured products
 * with carousel and grid layout using template components.
 */

'use client'

import Link from 'next/link'
import { ThreeItemGrid } from '@/components/grid/three-item'
import { Carousel } from '@/components/carousel'
import { useFeaturedProducts } from '@/hooks/useTemplateProducts'
import Container from '@/components/Container'
import styles from './page.module.css'

export default function HomePage() {
  const { products, loading, error } = useFeaturedProducts(6)

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>Loading featured products...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorContent}>
          <div className={styles.errorIcon}>
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className={styles.errorTitle}>Error Loading Products</h1>
          <p className={styles.errorMessage}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className={styles.retryButton}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.homePage}>
      <Container>
        <div className={styles.content}>
          {/* Hero Section */}
          <header className={`${styles.header} animate-fadeInUp`}>
            <h1 className={styles.title}>
              Beautiful Watercolor Artwork
            </h1>
            <p className={styles.subtitle}>
              Discover our collection of hand-painted watercolor pieces, 
              each one a unique expression of artistic vision and creativity.
            </p>
            <div className={styles.ctaButtons}>
              <Link href="/shop" className={styles.primaryButton}>
                Shop Now
              </Link>
              <Link href="/about" className={styles.secondaryButton}>
                Learn More
              </Link>
            </div>
          </header>

          <div className={styles.sections}>
            {/* Featured Products Carousel */}
            {products.length > 0 && (
              <section className={`${styles.section} animate-fadeInUp`}>
                <h2 className={styles.sectionTitle}>Featured Artwork</h2>
                <Carousel 
                  products={products.slice(0, 6)} 
                  title=""
                  className=""
                />
              </section>
            )}

            {/* Three Item Grid */}
            {products.length >= 3 && (
              <section className={`${styles.section} animate-fadeInUp`}>
                <h2 className={styles.sectionTitle}>Handpicked Collection</h2>
                <ThreeItemGrid products={products.slice(0, 3)} />
              </section>
            )}

            {/* About Section */}
            <section className={`${styles.section} animate-fadeInUp`}>
              <h2 className={styles.sectionTitle}>About Our Art</h2>
              <p className={styles.sectionDescription}>
                Each piece in our collection is carefully selected for its unique beauty, 
                artistic merit, and ability to bring joy and inspiration to your space. 
                We work directly with talented watercolor artists to bring you authentic, 
                one-of-a-kind artwork.
              </p>
              <div className={styles.featuresGrid}>
                <div className={styles.feature}>
                  <div className={styles.featureIcon}>
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h3 className={styles.featureTitle}>Handpicked</h3>
                  <p className={styles.featureDescription}>
                    Every piece is carefully selected for quality and artistic merit.
                  </p>
                </div>
                <div className={styles.feature}>
                  <div className={styles.featureIcon}>
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className={styles.featureTitle}>Unique</h3>
                  <p className={styles.featureDescription}>
                    Each artwork is one-of-a-kind, bringing character to your space.
                  </p>
                </div>
                <div className={styles.feature}>
                  <div className={styles.featureIcon}>
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className={styles.featureTitle}>Authentic</h3>
                  <p className={styles.featureDescription}>
                    Direct from talented artists, ensuring authenticity and quality.
                  </p>
                </div>
              </div>
            </section>

            {/* Call to Action */}
            <section className={`${styles.ctaSection} animate-fadeInUp`}>
              <h2 className={styles.ctaTitle}>
                Ready to Find Your Perfect Piece?
              </h2>
              <p className={styles.ctaDescription}>
                Browse our full collection and discover the watercolor artwork 
                that speaks to your soul.
              </p>
              <Link href="/shop" className={styles.ctaButton}>
                Explore Collection
              </Link>
            </section>
          </div>
        </div>
      </Container>
    </div>
  )
}