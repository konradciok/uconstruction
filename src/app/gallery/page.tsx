import { Metadata } from 'next'
import Container from '@/components/Container'
// import { GalleryGrid } from '@/legacy/components/Portfolio2/GalleryGrid'
// import { ARTWORKS } from '@/lib/portfolio2-data'

export const metadata: Metadata = {
  title: 'Gallery | UConstruction',
  description: 'Explore our diverse collection of watercolor artworks, from traditional paintings to contemporary digital pieces. Each piece represents our commitment to artistic excellence.',
  keywords: 'gallery, watercolor, art, paintings, portfolio, artwork, exhibition, collection',
}

export default function GalleryPage() {
  return (
    <main>
      <Container>
        <div className="py-8">
          {/* Gallery Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Art Gallery
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore our diverse collection of watercolor artworks, from traditional 
              paintings to contemporary digital pieces. Each piece represents our 
              commitment to artistic excellence and creative innovation.
            </p>
          </div>

          {/* Gallery Navigation */}
          <div className="mb-8">
            <div className="flex flex-wrap justify-center gap-4">
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                All Artworks
              </button>
              <button className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Watercolor Paintings
              </button>
              <button className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Digital Art
              </button>
              <button className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Mixed Media
              </button>
              <button className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Sketches
              </button>
            </div>
          </div>

          {/* Gallery Grid */}
          <section className="mb-16">
            <div className="text-center py-12">
              <p className="text-gray-600">Gallery grid will be implemented here</p>
            </div>
          </section>

          {/* Gallery Info */}
          <section className="bg-gray-50 rounded-lg p-8">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                About Our Gallery
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    🎨 Artistic Vision
                  </h3>
                  <p className="text-gray-600">
                    Our gallery showcases the evolution of watercolor art, from 
                    traditional techniques to modern interpretations. Each piece 
                    tells a story and captures the essence of artistic expression.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    🖼️ Collection Highlights
                  </h3>
                  <p className="text-gray-600">
                    Featuring original paintings, limited edition prints, and 
                    experimental works. Our collection spans various themes and 
                    styles, offering something for every art enthusiast.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Gallery Stats */}
          <section className="mt-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  50+
                </div>
                <div className="text-gray-600">Artworks</div>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  15+
                </div>
                <div className="text-gray-600">Collections</div>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  5+
                </div>
                <div className="text-gray-600">Years Creating</div>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  100+
                </div>
                <div className="text-gray-600">Happy Collectors</div>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="mt-16 text-center">
            <div className="bg-blue-600 rounded-lg p-8 text-white">
              <h2 className="text-2xl font-semibold mb-4">
                Interested in a Custom Piece?
              </h2>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                Commission a custom watercolor painting tailored to your vision. 
                Let's create something beautiful together.
              </p>
              <div className="space-x-4">
                <a
                  href="/commissions"
                  className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  View Commissions
                </a>
                <a
                  href="/shop"
                  className="inline-block border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Shop Artworks
                </a>
              </div>
            </div>
          </section>
        </div>
      </Container>
    </main>
  )
}
