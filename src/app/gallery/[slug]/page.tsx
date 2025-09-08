import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Container from '@/components/Container'
import { ARTWORKS } from '@/lib/portfolio2-data'
import { Artwork } from '@/types/portfolio2'

interface ArtworkPageProps {
  params: Promise<{
    slug: string
  }>
}

// Find artwork by slug
function findArtworkBySlug(slug: string): Artwork | null {
  return ARTWORKS.find(artwork => 
    artwork.title.toLowerCase().replace(/[^a-z0-9]/g, '-') === slug
  ) || null
}

export async function generateMetadata({ params }: ArtworkPageProps): Promise<Metadata> {
  const resolvedParams = await params
  const artwork = findArtworkBySlug(resolvedParams.slug)
  
  if (!artwork) {
    return {
      title: 'Artwork Not Found | UConstruction'
    }
  }

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
  return ARTWORKS.map((artwork) => ({
    slug: artwork.title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
  }))
}

export default async function ArtworkPage({ params }: ArtworkPageProps) {
  const resolvedParams = await params
  const artwork = findArtworkBySlug(resolvedParams.slug)

  if (!artwork) {
    notFound()
  }

  return (
    <main>
      <Container>
        <div className="py-8">
          {/* Breadcrumb Navigation */}
          <nav className="mb-8">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <a href="/gallery" className="hover:text-gray-900">
                Gallery
              </a>
              <span>›</span>
              <span className="text-gray-900">{artwork.title}</span>
            </div>
          </nav>

          {/* Artwork Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Artwork Image */}
            <div className="relative">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                {artwork.full?.jpg ? (
                  <Image
                    src={artwork.full.jpg}
                    alt={artwork.title}
                    width={600}
                    height={600}
                    className="w-full h-full object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-4xl">🖼️</span>
                  </div>
                )}
              </div>
              
              {/* Image Actions */}
              <div className="mt-4 flex space-x-4">
                <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  View Full Size
                </button>
                <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                  Download
                </button>
              </div>
            </div>

            {/* Artwork Information */}
            <div>
              <div className="sticky top-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {artwork.title}
                </h1>
                
                {artwork.source?.metadata?.vendor && (
                  <p className="text-lg text-gray-600 mb-4">
                    by {artwork.source.metadata.vendor}
                  </p>
                )}

                {/* Artwork Meta */}
                <div className="mb-6 space-y-2">
                  {artwork.medium && (
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-500 w-20">Medium:</span>
                      <span className="text-sm text-gray-900">{artwork.medium}</span>
                    </div>
                  )}
                  {artwork.dimensions && (
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-500 w-20">Size:</span>
                      <span className="text-sm text-gray-900">{artwork.dimensions}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {artwork.alt && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      About This Artwork
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {artwork.alt}
                    </p>
                  </div>
                )}

                {/* Tags */}
                {artwork.tags && artwork.tags.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {artwork.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-4">
                  <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                    Purchase Print
                  </button>
                  <button className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                    Commission Similar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Artwork Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                🎨 Technique
              </h3>
              <p className="text-sm text-gray-600">
                This artwork showcases traditional watercolor techniques with 
                modern artistic interpretation, creating a unique visual experience.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                🖼️ Framing
              </h3>
              <p className="text-sm text-gray-600">
                Available in various framing options. Contact us for custom 
                framing recommendations that complement your space.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                📦 Shipping
              </h3>
              <p className="text-sm text-gray-600">
                Carefully packaged and shipped worldwide. Free shipping on 
                orders over $50 with insurance included.
              </p>
            </div>
          </div>

          {/* Related Artworks */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
              Related Artworks
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {ARTWORKS
                .filter(a => a.id !== artwork.id)
                .slice(0, 3)
                .map((relatedArtwork) => (
                  <a
                    key={relatedArtwork.id}
                    href={`/gallery/${relatedArtwork.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                    className="group block bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-square bg-gray-100">
                      {relatedArtwork.thumbnail?.jpg ? (
                        <Image
                          src={relatedArtwork.thumbnail.jpg}
                          alt={relatedArtwork.title}
                          width={300}
                          height={300}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <span className="text-2xl">🖼️</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {relatedArtwork.title}
                      </h3>
                      {relatedArtwork.source?.metadata?.vendor && (
                        <p className="text-sm text-gray-600 mt-1">
                          by {relatedArtwork.source.metadata.vendor}
                        </p>
                      )}
                    </div>
                  </a>
                ))}
            </div>
          </section>
        </div>
      </Container>
    </main>
  )
}
