import { ProductWithRelations } from '@/types/product';
import { Artwork } from '@/types/portfolio2';

/**
 * Transform products into Portfolio2 Artwork format
 * Maintains the 4:5 aspect ratio expected by Portfolio2 components
 */
export class ProductToArtworkTransformer {
  /**
   * Convert a single ProductWithRelations to Artwork
   */
  static transformProduct(product: ProductWithRelations): Artwork {
    const primaryImage = product.media?.[0];

    // Generate artwork ID (prefixed to avoid conflicts)
    const artworkId = `product-${product.id}`;

    // Create dimensions string from product info
    const dimensions = this.createDimensionsString(product);

    // Get price display
    const price = this.getPriceDisplay(product);

    // Extract tags
    const tags = product.productTags?.map((pt) => pt.tag.name) || [];

    // Create artwork object
    const artwork: Artwork = {
      id: artworkId,
      title: product.title,
      dimensions,
      thumbnail: this.createImageConfig(primaryImage, 'thumbnail'),
      full: this.createImageConfig(primaryImage, 'full'),
      alt: primaryImage?.altText || product.title,
      medium: product.productType || 'Digital Art',
      tags,
      source: {
        type: 'product',
        id: product.id,
        url: `/products/${product.handle}`, // Future product page URL
        metadata: {
          price,
          vendor: product.vendor || undefined,
          status: product.status || undefined,
          lastUpdated: product.updatedAt
            ? product.updatedAt instanceof Date
              ? product.updatedAt.toISOString()
              : new Date(product.updatedAt).toISOString()
            : new Date().toISOString(),
        },
      },
    };

    return artwork;
  }

  /**
   * Convert multiple products to artworks
   */
  static transformProducts(products: ProductWithRelations[]): Artwork[] {
    return products
      .filter((product) => product.media && product.media.length > 0) // Only products with images
      .map((product) => this.transformProduct(product));
  }

  /**
   * Create dimensions string from product data
   */
  private static createDimensionsString(product: ProductWithRelations): string {
    // Try to extract dimensions from product title or description
    const titleDimensions = this.extractDimensionsFromText(product.title);
    if (titleDimensions) return titleDimensions;

    // Try to extract from first image dimensions
    const primaryImage = product.media?.[0];
    if (primaryImage?.width && primaryImage?.height) {
      return `${primaryImage.width} × ${primaryImage.height} px, ${product.productType || 'digital'}`;
    }

    // Fallback
    return `${product.productType || 'Art Print'}, ${product.vendor}`;
  }

  /**
   * Extract dimensions from text (e.g., "Painting 30x40cm" -> "30 × 40 cm")
   */
  private static extractDimensionsFromText(text: string): string | null {
    // Common dimension patterns
    const patterns = [
      /(\d+)\s*[x×]\s*(\d+)\s*(cm|in|inch|inches)/i,
      /(\d+)\s*(cm|in|inch|inches)\s*[x×]\s*(\d+)\s*(cm|in|inch|inches)/i,
      /(\d+["'′])\s*[x×]\s*(\d+["'′])/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        if (match[3]) {
          return `${match[1]} × ${match[2]} ${match[3].toLowerCase()}`;
        } else if (match[4]) {
          return `${match[1]} × ${match[3]}`;
        }
      }
    }

    return null;
  }

  /**
   * Get price display string from product variants
   */
  private static getPriceDisplay(product: ProductWithRelations): string {
    if (!product.variants || product.variants.length === 0) {
      return '';
    }

    const prices = product.variants
      .filter((v) => v.priceAmount)
      .map((v) => parseFloat(v.priceAmount?.toString() || '0'));

    if (prices.length === 0) return '';

    if (prices.length === 1) {
      return `$${prices[0].toFixed(2)}`;
    }

    const min = Math.min(...prices);
    const max = Math.max(...prices);

    if (min === max) {
      return `$${min.toFixed(2)}`;
    }

    return `$${min.toFixed(2)} - $${max.toFixed(2)}`;
  }

  /**
   * Create image configuration for Portfolio2 format
   */
  private static createImageConfig(
    media: ProductWithRelations['media'][0] | undefined,
    type: 'thumbnail' | 'full'
  ): Artwork['thumbnail'] | Artwork['full'] {
    if (!media) {
      // Fallback placeholder image
      return {
        jpg: '/images/placeholder-artwork.jpg',
        width: 320,
        height: 400, // 4:5 ratio
      };
    }

    // Use original image for both thumbnail and full
    // In a production setup, you might want to generate optimized thumbnails
    const config = {
      jpg: media.url,
      width: media.width || 320,
      height: media.height || 400,
    };

    // Ensure 4:5 aspect ratio for Portfolio2 compatibility
    if (type === 'thumbnail') {
      // Scale down for thumbnail while maintaining aspect ratio
      const targetWidth = 320;
      const aspectRatio = config.height / config.width;
      const targetHeight = Math.round(targetWidth * aspectRatio);

      // Adjust to be closer to 4:5 if needed
      const idealHeight = Math.round(targetWidth * 1.25); // 4:5 ratio

      return {
        jpg: config.jpg,
        width: targetWidth,
        height: Math.min(targetHeight, idealHeight + 50), // Allow some flexibility
      };
    }

    return config;
  }

  /**
   * Create a placeholder artwork for products without images
   */
  static createPlaceholderArtwork(product: ProductWithRelations): Artwork {
    return {
      id: `product-${product.id}`,
      title: product.title,
      dimensions: `${product.productType || 'Art'}, ${product.vendor}`,
      thumbnail: {
        jpg: '/images/placeholder-artwork.jpg',
        width: 320,
        height: 400,
      },
      full: {
        jpg: '/images/placeholder-artwork.jpg',
        width: 800,
        height: 1000,
      },
      alt: product.title,
      medium: product.productType || 'Digital Art',
      tags: product.productTags?.map((pt) => pt.tag.name) || [],
      source: {
        type: 'product',
        id: product.id,
        url: `/products/${product.handle}`,
        metadata: {
          price: this.getPriceDisplay(product),
          vendor: product.vendor || undefined,
          status: product.status || undefined,
          lastUpdated: new Date().toISOString(),
        },
      },
    };
  }

  /**
   * Filter and validate transformed artworks
   */
  static validateArtworks(artworks: Artwork[]): Artwork[] {
    return artworks.filter((artwork) => {
      // Basic validation
      if (!artwork.id || !artwork.title) return false;
      if (!artwork.thumbnail?.jpg || !artwork.full?.jpg) return false;

      return true;
    });
  }
}
