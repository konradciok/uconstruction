/**
 * Collection Page Client Component
 * 
 * Handles the dynamic product loading for collection pages
 */

'use client'

import { ProductGrid } from '@/components/grid/product-grid'
import { useProductsByCollection } from '@/hooks/useTemplateProducts'

interface CollectionPageClientProps {
  collectionHandle: string
}

export function CollectionPageClient({ collectionHandle }: CollectionPageClientProps) {
  const { products, loading, error, total, hasMore, loadMore } = useProductsByCollection(collectionHandle, 20)

  return (
    <section>
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Products in this Collection
          </h2>
          <div className="text-sm text-gray-500">
            {loading ? 'Loading...' : `${total} products`}
          </div>
        </div>
        
        {/* Product Grid with real data */}
        <ProductGrid
          products={products}
          loading={loading}
          error={error || undefined}
          hasMore={hasMore}
          onLoadMore={loadMore}
          columns={{ xs: 1, sm: 2, md: 2, lg: 2, xl: 2 }}
        />
      </div>
    </section>
  )
}
