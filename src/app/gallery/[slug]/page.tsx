import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Container from '@/components/Container'
import { fetchArtworkBySlug, generateArtworkStaticParams } from '@/lib/artwork-fetcher'
import styles from './page.module.css'

interface ArtworkPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: ArtworkPageProps): Promise<Metadata> {
  const resolvedParams = await params
  const result = await fetchArtworkBySlug(resolvedParams.slug)
  
  if (!result.success || !result.artwork) {
    return {
      title: 'Artwork Not Found | UConstruction'
    }
  }

  const artwork = result.artwork

  return {
    title: `${artwork.title} | UConstruction Gallery`,
    description: artwork.alt || `View ${artwork.title} - a beautiful watercolor artwork in our gallery collection.`,
    keywords: `${artwork.title}, watercolor, art, gallery, artwork, painting`,
    openGraph: {
      title: artwork.title,
      description: artwork.alt,
      images: artwork.full?.jpg ? [artwork.full.jpg] : [],
    },
  }
}

export async function generateStaticParams() {
  return await generateArtworkStaticParams()
}

export default async function ArtworkPage({ params }: ArtworkPageProps) {
  const resolvedParams = await params
  const result = await fetchArtworkBySlug(resolvedParams.slug)

  if (!result.success || !result.artwork) {
    notFound()
  }

  const artwork = result.artwork

  return (
    <main>
      <Container>
        <div className={styles.page}>
          {/* Breadcrumb Navigation */}
          <nav className={styles.breadcrumb}>
            <div className={styles.breadcrumbNav}>
              <Link href="/gallery" className={styles.breadcrumbLink}>
                Gallery
              </Link>
              <span className={styles.breadcrumbSeparator}>›</span>
              <span className={styles.breadcrumbCurrent}>{artwork.title}</span>
            </div>
          </nav>

          {/* Artwork Details */}
          <div className={styles.artworkGrid}>
            {/* Artwork Image */}
            <div className={styles.imageContainer}>
              <div className={styles.imageWrapper}>
                {artwork.full?.jpg ? (
                  <Image
                    src={artwork.full.jpg}
                    alt={artwork.title}
                    width={600}
                    height={600}
                    className={styles.image}
                    priority
                  />
                ) : (
                  <div className={styles.imagePlaceholder}>
                    <span>🖼️</span>
                  </div>
                )}
              </div>
              
              {/* Image Actions */}
              <div className={styles.imageActions}>
                <button className={`${styles.actionButton} ${styles.primaryAction}`}>
                  View Full Size
                </button>
                <button className={`${styles.actionButton} ${styles.secondaryAction}`}>
                  Download
                </button>
              </div>
            </div>

            {/* Artwork Information */}
            <div className={styles.infoContainer}>
              <div className={styles.infoSticky}>
                <h1 className={styles.title}>
                  {artwork.title}
                </h1>
                
                {artwork.source?.metadata?.vendor && (
                  <p className={styles.artist}>
                    by {artwork.source.metadata.vendor}
                  </p>
                )}

                {/* Artwork Meta */}
                <div className={styles.metaContainer}>
                  {artwork.medium && (
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Medium:</span>
                      <span className={styles.metaValue}>{artwork.medium}</span>
                    </div>
                  )}
                  {artwork.dimensions && (
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Size:</span>
                      <span className={styles.metaValue}>{artwork.dimensions}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {artwork.alt && (
                  <div className={styles.description}>
                    <h3 className={styles.descriptionTitle}>
                      About This Artwork
                    </h3>
                    <p className={styles.descriptionText}>
                      {artwork.alt}
                    </p>
                  </div>
                )}

                {/* Tags */}
                {artwork.tags && artwork.tags.length > 0 && (
                  <div className={styles.tags}>
                    <h3 className={styles.tagsTitle}>
                      Tags
                    </h3>
                    <div className={styles.tagsList}>
                      {artwork.tags.map((tag, index) => (
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

                {/* Actions */}
                <div className={styles.actions}>
                  <button className={styles.purchaseButton}>
                    Purchase Print
                  </button>
                  <button className={styles.commissionButton}>
                    Commission Similar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Artwork Details */}
          <div className={styles.detailsGrid}>
            <div className={styles.detailCard}>
              <h3 className={styles.detailTitle}>
                🎨 Technique
              </h3>
              <p className={styles.detailText}>
                This artwork showcases traditional watercolor techniques with 
                modern artistic interpretation, creating a unique visual experience.
              </p>
            </div>

            <div className={styles.detailCard}>
              <h3 className={styles.detailTitle}>
                🖼️ Framing
              </h3>
              <p className={styles.detailText}>
                Available in various framing options. Contact us for custom 
                framing recommendations that complement your space.
              </p>
            </div>

            <div className={styles.detailCard}>
              <h3 className={styles.detailTitle}>
                📦 Shipping
              </h3>
              <p className={styles.detailText}>
                Carefully packaged and shipped worldwide. Free shipping on 
                orders over $50 with insurance included.
              </p>
            </div>
          </div>

          {/* Related Artworks */}
          <section className={styles.relatedSection}>
            <h2 className={styles.relatedTitle}>
              Related Artworks
            </h2>
            <div className={styles.relatedGrid}>
              {/* Note: Related artworks would need to be fetched from database */}
              <div className={styles.relatedPlaceholder}>
                <p>Related artworks will be loaded from the database</p>
              </div>
            </div>
          </section>
        </div>
      </Container>
    </main>
  )
}
