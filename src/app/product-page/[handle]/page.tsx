'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/components/Container';
import ProductDetails from '@/components/Product/ProductDetails/ProductDetails';
import ProductCard from '@/components/Product/ProductCard/ProductCard';
import { ProductWithRelations } from '@/types/product';
import styles from './productPage.module.css';

interface ProductPageProps {
  params: Promise<{
    handle: string;
  }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  const [product, setProduct] = useState<ProductWithRelations | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ProductWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [handle, setHandle] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const getHandle = async () => {
      const resolvedParams = await params;
      setHandle(resolvedParams.handle);
    };
    getHandle();
  }, [params]);

  useEffect(() => {
    if (!handle) return;

    const fetchProduct = async () => {
      try {
        // Fetch main product
        const productResponse = await fetch(`/api/products/handle/${handle}`);
        
        if (!productResponse.ok) {
          if (productResponse.status === 404) {
            setError('Product not found');
            return;
          }
          throw new Error('Failed to fetch product');
        }

        const productData = await productResponse.json();
        if (!productData.success) {
          throw new Error(productData.error || 'Failed to load product');
        }

        setProduct(productData.data.product);

        // Fetch related products (same category/tags)
        const category = productData.data.product.productCollections?.[0]?.collection?.title;
        const tags = productData.data.product.productTags?.map((pt: any) => pt.tag.name) || [];
        
        let relatedQuery = new URLSearchParams();
        if (category) relatedQuery.set('category', category);
        if (tags.length > 0) relatedQuery.set('tags', tags.slice(0, 2).join(','));
        relatedQuery.set('limit', '4');
        relatedQuery.set('publishedOnly', 'true');

        const relatedResponse = await fetch(`/api/products?${relatedQuery.toString()}`);
        if (relatedResponse.ok) {
          const relatedData = await relatedResponse.json();
          if (relatedData.success) {
            // Filter out current product and limit to 3 items
            const filtered = relatedData.data.products
              .filter((p: ProductWithRelations) => p.id !== productData.data.product.id)
              .slice(0, 3);
            setRelatedProducts(filtered);
          }
        }

      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [handle]);

  const handleAddToCart = (variantId: string) => {
    // TODO: Implement add to cart functionality
    alert(`Added to cart! Variant ID: ${variantId}`);
  };

  const handleRelatedProductSelect = (relatedProduct: ProductWithRelations) => {
    router.push(`/product-page/${relatedProduct.handle}`);
  };

  const handleBackToCatalog = () => {
    router.push('/catalog');
  };

  if (loading) {
    return (
      <main className={styles.main}>
        <Container>
          <div className={styles.loading}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading product...</p>
          </div>
        </Container>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className={styles.main}>
        <Container>
          <div className={styles.error}>
            <h1>Product Not Found</h1>
            <p>{error || 'The product you\'re looking for could not be found.'}</p>
            <button 
              onClick={handleBackToCatalog}
              className={styles.backButton}
            >
              ← Back to Catalog
            </button>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <Container>
        {/* Breadcrumb Navigation */}
        <nav className={styles.breadcrumb}>
          <button 
            onClick={handleBackToCatalog}
            className={styles.breadcrumbLink}
          >
            Catalog
          </button>
          <span className={styles.breadcrumbSeparator}>›</span>
          <span className={styles.breadcrumbCurrent}>{product.title}</span>
        </nav>

        {/* Product Details */}
        <div className={styles.productSection}>
          <ProductDetails 
            product={product}
            onAddToCart={handleAddToCart}
          />
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className={styles.relatedSection}>
            <h2 className={styles.relatedTitle}>You might also like</h2>
            <div className={styles.relatedGrid}>
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  size="medium"
                  onSelect={handleRelatedProductSelect}
                />
              ))}
            </div>
          </section>
        )}

        {/* Additional Information */}
        <section className={styles.additionalInfo}>
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <h3>🚚 Shipping Information</h3>
              <ul>
                <li>Free shipping on orders over $50</li>
                <li>Standard delivery: 3-7 business days</li>
                <li>Express delivery: 1-3 business days</li>
                <li>International shipping available</li>
              </ul>
            </div>
            
            <div className={styles.infoCard}>
              <h3>↩️ Return Policy</h3>
              <ul>
                <li>30-day return window</li>
                <li>Items must be in original condition</li>
                <li>Free return shipping</li>
                <li>Full refund or exchange</li>
              </ul>
            </div>
            
            <div className={styles.infoCard}>
              <h3>🎨 About the Artwork</h3>
              <ul>
                <li>Original watercolor technique</li>
                <li>High-quality archival prints</li>
                <li>Comes with certificate of authenticity</li>
                <li>Ready for framing</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Customer Reviews Section */}
        <section className={styles.reviewsSection}>
          <h2 className={styles.reviewsTitle}>Customer Reviews</h2>
          <div className={styles.reviewsOverview}>
            <div className={styles.reviewsSummary}>
              <div className={styles.averageRating}>
                <span className={styles.ratingNumber}>4.8</span>
                <div className={styles.stars}>★★★★★</div>
                <span className={styles.reviewCount}>Based on 127 reviews</span>
              </div>
            </div>
          </div>
          
          <div className={styles.reviewsList}>
            <div className={styles.review}>
              <div className={styles.reviewHeader}>
                <div className={styles.reviewerName}>Sarah M.</div>
                <div className={styles.reviewStars}>★★★★★</div>
              </div>
              <p className={styles.reviewText}>
                "Absolutely stunning artwork! The colors are vibrant and the quality is exceptional. 
                It arrived perfectly packaged and looks amazing in my living room."
              </p>
            </div>
            
            <div className={styles.review}>
              <div className={styles.reviewHeader}>
                <div className={styles.reviewerName}>Michael R.</div>
                <div className={styles.reviewStars}>★★★★★</div>
              </div>
              <p className={styles.reviewText}>
                "Fast shipping and beautiful print quality. This is my third purchase from this artist 
                and I'm never disappointed. Highly recommend!"
              </p>
            </div>
            
            <div className={styles.review}>
              <div className={styles.reviewHeader}>
                <div className={styles.reviewerName}>Emma L.</div>
                <div className={styles.reviewStars}>★★★★☆</div>
              </div>
              <p className={styles.reviewText}>
                "Beautiful artwork, exactly as described. Only small issue was with delivery timing, 
                but customer service was very helpful."
              </p>
            </div>
          </div>
        </section>
      </Container>
    </main>
  );
}