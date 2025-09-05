import React from 'react';
import Image from 'next/image';
import { ProductWithRelations } from '@/types/product';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: ProductWithRelations;
  onSelect?: (product: ProductWithRelations) => void;
  size?: 'small' | 'medium' | 'large';
  showPrice?: boolean;
  showVendor?: boolean;
  showStatus?: boolean;
  className?: string;
}

export default function ProductCard({
  product,
  onSelect,
  size = 'medium',
  showPrice = true,
  showVendor = true,
  showStatus = true,
  className,
}: ProductCardProps) {
  // Get primary image
  const primaryImage = product.media?.[0];
  
  // Calculate price display
  const getPriceDisplay = () => {
    if (!product.variants?.length) return null;
    
    const prices = product.variants
      .filter(v => v.priceAmount)
      .map(v => parseFloat(v.priceAmount as string));
    
    if (prices.length === 0) return null;
    if (prices.length === 1) return `$${prices[0].toFixed(2)}`;
    
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    
    if (min === max) return `$${min.toFixed(2)}`;
    return `$${min.toFixed(2)} - $${max.toFixed(2)}`;
  };

  // Handle click
  const handleClick = () => {
    if (onSelect) {
      onSelect(product);
    }
  };

  // Handle keyboard interaction
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const cardClasses = [
    styles.card,
    styles[size],
    className,
  ].filter(Boolean).join(' ');

  return (
    <article 
      className={cardClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${product.title}`}
    >
      {/* Image Container */}
      <div className={styles.imageContainer}>
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.altText || product.title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className={styles.image}
            priority={false}
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            <span className={styles.placeholderText}>No Image</span>
          </div>
        )}
        
        {/* Status Badge */}
        {showStatus && product.status && product.status !== 'active' && (
          <div className={styles.statusBadge}>
            {product.status}
          </div>
        )}
      </div>

      {/* Content */}
      <div className={styles.content}>
        <h3 className={styles.title}>{product.title}</h3>
        
        {showVendor && product.vendor && (
          <p className={styles.vendor}>{product.vendor}</p>
        )}
        
        {showPrice && (
          <p className={styles.price}>{getPriceDisplay()}</p>
        )}
      </div>
    </article>
  );
}