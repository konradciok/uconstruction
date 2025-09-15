import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Container from '@/components/Container'
import { CollectionPageClient } from './collection-page-client'

// Inline props typing at call sites to avoid PageProps generic mismatch

// Mock collection data - this will be replaced with real data from the database
const collections = {
  'original-paintings': {
    title: 'Original Paintings',
    description: 'Unique watercolor paintings created with traditional techniques and artistic vision.',
    slug: 'original-paintings'
  },
  'limited-prints': {
    title: 'Limited Edition Prints',
    description: 'High-quality archival prints in limited quantities, perfect for art collectors.',
    slug: 'limited-prints'
  },
  'art-supplies': {
    title: 'Art Supplies',
    description: 'Professional watercolor supplies and tools for artists of all levels.',
    slug: 'art-supplies'
  }
}

export async function generateMetadata(props: unknown): Promise<Metadata> {
  const { params } = props as { params: { collection: string } }
  const collection = collections[params.collection as keyof typeof collections]
  
  if (!collection) {
    return {
      title: 'Collection Not Found | UConstruction'
    }
  }

  return {
    title: `${collection.title} | UConstruction`,
    description: collection.description,
    keywords: `${collection.title.toLowerCase()}, watercolor, art, collection, shop`,
  }
}

export default async function CollectionPage(props: unknown) {
  const { params } = props as { params: { collection: string } }
  const collection = collections[params.collection as keyof typeof collections]

  if (!collection) {
    notFound()
  }

  return (
    <main>
      <Container>
        <div className="py-8">
          {/* Collection Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {collection.title}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {collection.description}
            </p>
          </div>

          {/* Collection Products - Now with real data */}
          <CollectionPageClient collectionHandle={params.collection} />

          {/* Collection Info */}
          <section className="mt-16 bg-gray-50 rounded-lg p-8">
            <div className="max-w-3xl mx-auto text-center">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                About {collection.title}
              </h3>
              <p className="text-gray-600 mb-6">
                {collection.description} Each piece in this collection has been carefully 
                selected to represent the highest quality and artistic excellence.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div className="bg-white rounded-lg p-4">
                  <div className="text-2xl mb-2">🚚</div>
                  <h4 className="font-semibold text-gray-900 mb-1">Free Shipping</h4>
                  <p className="text-gray-600">On orders over $50</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-2xl mb-2">↩️</div>
                  <h4 className="font-semibold text-gray-900 mb-1">Easy Returns</h4>
                  <p className="text-gray-600">30-day return policy</p>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-2xl mb-2">🎨</div>
                  <h4 className="font-semibold text-gray-900 mb-1">Authentic Art</h4>
                  <p className="text-gray-600">Certificate of authenticity</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </Container>
    </main>
  )
}

// Generate static params for known collections
export async function generateStaticParams() {
  return Object.keys(collections).map((collection) => ({
    collection,
  }))
}
