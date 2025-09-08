'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ProductWithRelations } from '@/types/product';
import styles from './ProductDetails.module.css';

interface ProductDetailsProps {
  product: ProductWithRelations;
  onAddToCart?: (variantId: string) => void;
  onClose?: () => void;
  isModal?: boolean;
}

export default function ProductDetails({
  product,
  onAddToCart,
  onClose,
  isModal = false,
}: ProductDetailsProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants[0]?.shopifyId || ''
  );
  const [quantity, setQuantity] = useState(1);

  const selectedVariant =
    product.variants.find((v) => v.shopifyId === selectedVariantId) ||
    product.variants[0];
  const mainImage = product.media[selectedImageIndex];
  const hasMultipleImages = product.media.length > 1;

  const handleAddToCart = () => {
    if (onAddToCart && selectedVariantId) {
      onAddToCart(selectedVariantId);
    }
  };

  const formatPrice = (amount?: any, currency?: string) => {
    if (!amount) return 'N/A';
    const numericAmount =
      typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(numericAmount);
  };

  const hasComparePrice =
    selectedVariant?.compareAtPriceAmount &&
    parseFloat(selectedVariant.compareAtPriceAmount.toString()) >
      parseFloat(selectedVariant.priceAmount?.toString() || '0');

  return (
    <div className={`${styles.container} ${isModal ? styles.modal : ''}`}>
      {isModal && onClose && (
        <button
          onClick={onClose}
          className={styles.closeButton}
          aria-label="Close product details"
        >
          ×
        </button>
      )}

      <div className={styles.content}>
        {/* Image Gallery Section */}
        <div className={styles.imageSection}>
          <div className={styles.mainImageContainer}>
            {mainImage ? (
              <Image
                src={mainImage.url}
                alt={mainImage.altText || product.title}
                fill
                className={styles.mainImage}
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className={styles.placeholderImage}>
                <span>No image available</span>
              </div>
            )}

            {/* Trust Badge */}
            <div className={styles.trustBadge}>
              <span>🔒 Secure Checkout</span>
            </div>
          </div>

          {/* Thumbnail Gallery */}
          {hasMultipleImages && (
            <div className={styles.thumbnailGallery}>
              {product.media.map((media, index) => (
                <button
                  key={media.id}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`${styles.thumbnail} ${
                    index === selectedImageIndex ? styles.thumbnailActive : ''
                  }`}
                >
                  <Image
                    src={media.url}
                    alt={media.altText || `${product.title} view ${index + 1}`}
                    fill
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info Section */}
        <div className={styles.infoSection}>
          {/* Product Title & Pricing */}
          <div className={styles.header}>
            <h1 className={styles.title}>{product.title}</h1>

            <div className={styles.priceContainer}>
              <span className={styles.price}>
                {formatPrice(
                  selectedVariant?.priceAmount,
                  selectedVariant?.priceCurrency
                )}
              </span>
              {hasComparePrice && (
                <span className={styles.comparePrice}>
                  {formatPrice(
                    selectedVariant?.compareAtPriceAmount,
                    selectedVariant?.compareAtPriceCurrency
                  )}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className={styles.stockStatus}>
              <span className={`${styles.stockIndicator} ${styles.inStock}`}>
                ✓ In Stock
              </span>
              <span className={styles.stockCount}>
                Limited quantity available
              </span>
            </div>
          </div>

          {/* Product Description */}
          {product.bodyHtml && (
            <div className={styles.description}>
              <h3>Description</h3>
              <div dangerouslySetInnerHTML={{ __html: product.bodyHtml }} />
            </div>
          )}

          {/* Variant Selection */}
          {product.variants.length > 1 && (
            <div className={styles.variantSelection}>
              <h4>Options</h4>
              <div className={styles.variants}>
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariantId(variant.shopifyId)}
                    className={`${styles.variantButton} ${
                      selectedVariantId === variant.shopifyId
                        ? styles.variantButtonActive
                        : ''
                    }`}
                  >
                    {variant.title || 'Default'}
                    <span className={styles.variantPrice}>
                      {formatPrice(variant.priceAmount, variant.priceCurrency)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className={styles.quantitySection}>
            <label htmlFor="quantity">Quantity:</label>
            <div className={styles.quantityControls}>
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className={styles.quantityButton}
              >
                -
              </button>
              <input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                }
                className={styles.quantityInput}
                min="1"
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                className={styles.quantityButton}
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart CTA */}
          <div className={styles.ctaSection}>
            <button
              onClick={handleAddToCart}
              className={styles.addToCartButton}
              disabled={!selectedVariantId}
            >
              Add to Cart -{' '}
              {formatPrice(
                selectedVariant?.priceAmount,
                selectedVariant?.priceCurrency
              )}
            </button>

            <button className={styles.buyNowButton}>
              Buy Now - Fast Checkout
            </button>
          </div>

          {/* Product Meta Information */}
          <div className={styles.metaInfo}>
            {product.vendor && (
              <div className={styles.metaItem}>
                <strong>Artist:</strong> {product.vendor}
              </div>
            )}
            {product.productType && (
              <div className={styles.metaItem}>
                <strong>Type:</strong> {product.productType}
              </div>
            )}
            {selectedVariant?.sku && (
              <div className={styles.metaItem}>
                <strong>SKU:</strong> {selectedVariant.sku}
              </div>
            )}
          </div>

          {/* Trust Signals */}
          <div className={styles.trustSignals}>
            <div className={styles.trustItem}>
              <span>🚚</span>
              <div>
                <strong>Free Shipping</strong>
                <p>On orders over $50</p>
              </div>
            </div>
            <div className={styles.trustItem}>
              <span>↩️</span>
              <div>
                <strong>Easy Returns</strong>
                <p>30-day return policy</p>
              </div>
            </div>
            <div className={styles.trustItem}>
              <span>🛡️</span>
              <div>
                <strong>Secure Payment</strong>
                <p>SSL encrypted checkout</p>
              </div>
            </div>
          </div>

          {/* Social Proof Section */}
          <div className={styles.socialProof}>
            <div className={styles.rating}>
              <span className={styles.stars}>★★★★★</span>
              <span className={styles.ratingText}>4.8/5 (127 reviews)</span>
            </div>
            <p className={styles.testimonial}>
              "Beautiful artwork and excellent quality. Fast shipping too!" -
              Sarah M.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
