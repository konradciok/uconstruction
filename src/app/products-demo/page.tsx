'use client';

import { useState, useEffect } from 'react';
import Container from '@/components/Container';
import ProductCard from '@/components/Product/ProductCard';
import ProductGrid from '@/components/Product/ProductGrid';
import ProductFilters from '@/components/Product/ProductFilters';
import { useProducts } from '@/hooks/useProducts';
import { ProductWithRelations, ProductFilters as ProductFiltersType, ProductCategory, ProductTag } from '@/types/product';

// This page now uses REAL data from the Shopify database via API endpoints

export default function ProductsDemoPage() {
  // Use real product data hook
  const {
    products,
    loading,
    error,
    hasMore,
    filters,
    setFilters,
    loadMore,
    refresh
  } = useProducts({
    initialFilters: { publishedOnly: false }, // Show all products for demo
    limit: 10 // Smaller limit for demo
  });

  // Local state for demo-specific data
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [tags, setTags] = useState<ProductTag[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Fetch categories and tags for filters demo
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [categoriesRes, tagsRes] = await Promise.all([
          fetch('/api/products/categories'),
          fetch('/api/products/tags')
        ]);
        
        if (categoriesRes.ok && tagsRes.ok) {
          const [categoriesData, tagsData] = await Promise.all([
            categoriesRes.json(),
            tagsRes.json()
          ]);
          
          if (categoriesData.success) setCategories(categoriesData.data.categories);
          if (tagsData.success) setTags(tagsData.data.tags);
        }
      } catch (err) {
        console.error('Failed to fetch filter data:', err);
      } finally {
        setDataLoading(false);
      }
    };

    fetchFilterData();
  }, []);

  const handleProductSelect = (product: ProductWithRelations) => {
    alert(`Selected: ${product.title} ($${product.variants[0]?.priceAmount || 'N/A'})`);
  };

  const handleFiltersChange = (newFilters: ProductFiltersType) => {
    setFilters(newFilters);
    console.log('Filters changed:', newFilters);
  };

  const handleLoadMore = () => {
    loadMore();
  };

  const handleRetry = () => {
    refresh();
  };

  return (
    <main style={{ padding: '2rem 0', background: 'var(--color-background, #F2F2F2)' }}>
      <Container>
        <h1 style={{ 
          marginBottom: '2rem', 
          color: 'var(--color-text, #111111)',
          fontSize: '2rem',
          fontWeight: '600'
        }}>
          Product System Demo - Real Database Connection
        </h1>
        
        {/* Real Data Status */}
        <section style={{ marginBottom: '3rem' }}>
          <div style={{
            padding: '1rem',
            backgroundColor: products.length > 0 ? 'var(--color-success-light, #f0f9ff)' : 'var(--color-warning-light, #fef3c7)',
            border: `1px solid ${products.length > 0 ? 'var(--color-success, #10b981)' : 'var(--color-warning, #f59e0b)'}`,
            borderRadius: '8px',
            marginBottom: '2rem'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-text, #111111)' }}>
              🗄️ Real Database Connection Status
            </h3>
            <p style={{ margin: 0, color: 'var(--color-text-secondary, #666)' }}>
              {loading ? '🔄 Loading products from database...' : 
               error ? `❌ Error: ${error}` :
               products.length > 0 ? `✅ Connected! Loaded ${products.length} products from Shopify database` :
               '⏳ No products found in database'}
            </p>
            {error && (
              <button 
                onClick={handleRetry}
                style={{
                  marginTop: '0.5rem',
                  padding: '0.25rem 0.5rem',
                  background: 'var(--color-primary, #80A6F2)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Retry Connection
              </button>
            )}
          </div>
        </section>

        {/* Product Cards Preview */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ 
            marginBottom: '1rem', 
            color: 'var(--color-text, #111111)',
            fontSize: '1.5rem',
            fontWeight: '500'
          }}>
            ProductCard - Real Data Preview
          </h2>
          
          {products.length > 0 ? (
            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              flexWrap: 'wrap',
              marginBottom: '2rem'
            }}>
              <ProductCard 
                product={products[0]} 
                size="small"
                onSelect={handleProductSelect}
              />
              <ProductCard 
                product={products[0]} 
                size="medium"
                onSelect={handleProductSelect}
              />
              <ProductCard 
                product={products[0]} 
                size="large"
                onSelect={handleProductSelect}
              />
            </div>
          ) : (
            <div style={{
              padding: '2rem',
              textAlign: 'center',
              background: 'var(--color-background-secondary, #f8f8f8)',
              borderRadius: '8px',
              color: 'var(--color-text-secondary, #666)'
            }}>
              {loading ? 'Loading products...' : error ? 'Error loading products' : 'No products available for preview'}
            </div>
          )}
        </section>

        {/* Product Filters Demo */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ 
            marginBottom: '1rem', 
            color: 'var(--color-text, #111111)',
            fontSize: '1.5rem',
            fontWeight: '500'
          }}>
            ProductFilters - Live Demo
          </h2>
          
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1rem', color: 'var(--color-text, #111111)' }}>
              Interactive Filters (Connected to Database)
            </h3>
            <ProductFilters 
              filters={filters}
              onFiltersChange={handleFiltersChange}
              categories={categories}
              tags={tags}
              layout="horizontal"
              loading={dataLoading}
            />
          </div>
        </section>

        {/* Product Grid Demo */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{ 
            marginBottom: '1rem', 
            color: 'var(--color-text, #111111)',
            fontSize: '1.5rem',
            fontWeight: '500'
          }}>
            ProductGrid - Live Results
          </h2>
          
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1rem', color: 'var(--color-text, #111111)' }}>
              Filtered Results from Database
            </h3>
            <ProductGrid 
              products={products}
              loading={loading}
              error={error}
              hasMore={hasMore}
              onLoadMore={handleLoadMore}
              onProductSelect={handleProductSelect}
            />
          </div>
        </section>

        {/* Demo Instructions */}
        <div style={{ 
          marginTop: '3rem', 
          padding: '1rem', 
          background: 'var(--color-accent, #F2EDA7)',
          borderRadius: '8px'
        }}>
          <p style={{ margin: 0, color: 'var(--color-text, #111111)' }}>
            💡 <strong>This is now connected to real data!</strong> The filters above connect to your Shopify database via the API endpoints we built. Try searching, filtering by category, or adjusting price ranges to see real-time results.
          </p>
        </div>

        {/* Debug Info */}
        <div style={{ 
          marginTop: '1rem', 
          padding: '1rem', 
          background: 'var(--color-background, #ffffff)',
          border: '1px solid var(--color-border, #e5e5e5)',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-text, #111111)' }}>Active Filters:</h4>
              <pre style={{ 
                margin: 0, 
                fontSize: '12px', 
                color: 'var(--color-text-secondary, #666)',
                background: 'var(--color-background-secondary, #f8f8f8)',
                padding: '0.5rem',
                borderRadius: '4px',
                overflow: 'auto',
                minHeight: '100px'
              }}>
                {JSON.stringify(filters, null, 2)}
              </pre>
            </div>
            <div>
              <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-text, #111111)' }}>Results Summary:</h4>
              <div style={{ 
                fontSize: '14px', 
                color: 'var(--color-text-secondary, #666)',
                background: 'var(--color-background-secondary, #f8f8f8)',
                padding: '0.5rem',
                borderRadius: '4px',
                minHeight: '100px'
              }}>
                <div>📊 Products found: {products.length}</div>
                <div>🔄 Loading: {loading ? 'Yes' : 'No'}</div>
                <div>📄 Has more: {hasMore ? 'Yes' : 'No'}</div>
                <div>❌ Error: {error || 'None'}</div>
                <div>🏷️ Categories: {categories.length}</div>
                <div>🏷️ Tags: {tags.length}</div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}