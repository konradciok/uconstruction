import { ProcessedImage } from '@/types/upload';
import { Artwork, PortfolioStats, SourceConfig } from '@/types/portfolio2';
import { ProductWithRelations } from '@/types/product';
import { ProductToArtworkTransformer } from './product-to-artwork-transformer';

export class Portfolio2Manager {
  private static readonly PORTFOLIO_DATA_PATH = '/src/lib/portfolio2-data.ts';
  private static readonly UPLOADED_ARTWORKS_KEY = 'UPLOADED_ARTWORKS';
  private static readonly PORTFOLIO_CONFIG_KEY = 'PORTFOLIO_CONFIG';
  private static readonly SHOPIFY_SYNC_KEY = 'SHOPIFY_SYNC_TIMESTAMP';

  /**
   * Convert ProcessedImage to Artwork format with uploaded source
   */
  static convertToArtwork(processedImage: ProcessedImage): Artwork {
    return {
      id: processedImage.id,
      title: processedImage.title,
      dimensions: processedImage.dimensions,
      thumbnail: {
        jpg: processedImage.thumbnail.jpg,
        webp: processedImage.thumbnail.webp,
        avif: processedImage.thumbnail.avif,
        width: processedImage.thumbnail.width,
        height: processedImage.thumbnail.height
      },
      full: {
        jpg: processedImage.full.jpg,
        webp: processedImage.full.webp,
        avif: processedImage.full.avif,
        width: processedImage.full.width,
        height: processedImage.full.height
      },
      alt: processedImage.alt,
      source: {
        type: 'uploaded',
        metadata: {
          lastUpdated: new Date().toISOString()
        }
      }
    };
  }

  /**
   * Get all artworks from static data, uploaded data, and Shopify products
   */
  static async getAllArtworks(config?: SourceConfig): Promise<Artwork[]> {
    try {
      const sourceConfig = { 
        includeStatic: true, 
        includeUploaded: true, 
        includeShopify: true, 
        ...config 
      };
      
      const allArtworks: Artwork[] = [];
      
      // Get static artworks
      if (sourceConfig.includeStatic) {
        const { ARTWORKS } = await import('@/lib/portfolio2-data');
        // Mark static artworks with source
        const staticWithSource = ARTWORKS.map(artwork => ({
          ...artwork,
          source: { type: 'static' as const }
        }));
        allArtworks.push(...staticWithSource);
      }
      
      // Get uploaded artworks from localStorage
      if (sourceConfig.includeUploaded) {
        const uploadedArtworks = this.getUploadedArtworks();
        allArtworks.push(...uploadedArtworks);
      }
      
      // Get Shopify products
      if (sourceConfig.includeShopify) {
        const shopifyArtworks = await this.getShopifyArtworks(sourceConfig.shopifyFilters);
        allArtworks.push(...shopifyArtworks);
      }
      
      return allArtworks;
    } catch (error) {
      console.error('Error loading artworks:', error);
      return [];
    }
  }

  /**
   * Add new artworks to the portfolio
   */
  static async addArtworks(processedImages: ProcessedImage[]): Promise<void> {
    try {
      // Convert to Artwork format
      const newArtworks = processedImages.map(img => this.convertToArtwork(img));
      
      // Get existing uploaded artworks
      const existingArtworks = this.getUploadedArtworks();
      
      // Add new artworks
      const updatedArtworks = [...existingArtworks, ...newArtworks];
      
      // Save to localStorage
      this.saveUploadedArtworks(updatedArtworks);
      
      // Trigger gallery update
      this.notifyGalleryUpdate();
      
      console.log(`Added ${newArtworks.length} new artworks to portfolio`);
    } catch (error) {
      console.error('Error adding artworks:', error);
      throw error;
    }
  }

  /**
   * Remove artwork from portfolio
   */
  static async removeArtwork(artworkId: string): Promise<void> {
    try {
      const uploadedArtworks = this.getUploadedArtworks();
      const filteredArtworks = uploadedArtworks.filter(art => art.id !== artworkId);
      
      this.saveUploadedArtworks(filteredArtworks);
      this.notifyGalleryUpdate();
      
      console.log(`Removed artwork ${artworkId} from portfolio`);
    } catch (error) {
      console.error('Error removing artwork:', error);
      throw error;
    }
  }

  /**
   * Update artwork in portfolio
   */
  static async updateArtwork(artworkId: string, updates: Partial<Artwork>): Promise<void> {
    try {
      const uploadedArtworks = this.getUploadedArtworks();
      const updatedArtworks = uploadedArtworks.map(art => 
        art.id === artworkId ? { ...art, ...updates } : art
      );
      
      this.saveUploadedArtworks(updatedArtworks);
      this.notifyGalleryUpdate();
      
      console.log(`Updated artwork ${artworkId} in portfolio`);
    } catch (error) {
      console.error('Error updating artwork:', error);
      throw error;
    }
  }

  /**
   * Get uploaded artworks from localStorage
   */
  private static getUploadedArtworks(): Artwork[] {
    try {
      if (typeof window === 'undefined') return [];
      
      const stored = localStorage.getItem(this.UPLOADED_ARTWORKS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading uploaded artworks:', error);
      return [];
    }
  }

  /**
   * List uploaded artworks (public accessor for CMS)
   */
  static listUploadedArtworks(): Artwork[] {
    return this.getUploadedArtworks();
  }

  /**
   * Save uploaded artworks to localStorage
   */
  private static saveUploadedArtworks(artworks: Artwork[]): void {
    try {
      if (typeof window === 'undefined') return;
      
      localStorage.setItem(this.UPLOADED_ARTWORKS_KEY, JSON.stringify(artworks));
    } catch (error) {
      console.error('Error saving uploaded artworks:', error);
    }
  }

  /**
   * Notify gallery components about updates
   */
  private static notifyGalleryUpdate(): void {
    try {
      if (typeof window === 'undefined') return;
      
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('portfolio2-update', {
        detail: { timestamp: Date.now() }
      }));
    } catch (error) {
      console.error('Error notifying gallery update:', error);
    }
  }

  /**
   * Export portfolio data as file
   */
  static exportPortfolioData(): void {
    try {
      const allArtworks = this.getUploadedArtworks();
      
      if (allArtworks.length === 0) {
        alert('No uploaded artworks to export');
        return;
      }

      const content = this.generatePortfolioDataContent(allArtworks);
      this.downloadFile(content, 'portfolio2-uploaded-artworks.ts', 'text/javascript');
      
      console.log(`Exported ${allArtworks.length} artworks`);
    } catch (error) {
      console.error('Error exporting portfolio data:', error);
    }
  }

  /**
   * Generate TypeScript content for portfolio data
   */
  private static generatePortfolioDataContent(artworks: Artwork[]): string {
    const artworkEntries = artworks.map(art => {
      const entry = `  {
    id: "${art.id}",
    title: "${art.title}",
    dimensions: "${art.dimensions}",
    thumbnail: {
      ${art.thumbnail.webp ? `webp: "${art.thumbnail.webp}",` : ''}
      ${art.thumbnail.avif ? `avif: "${art.thumbnail.avif}",` : ''}
      jpg: "${art.thumbnail.jpg}",
      width: ${art.thumbnail.width},
      height: ${art.thumbnail.height}
    },
    full: {
      ${art.full.webp ? `webp: "${art.full.webp}",` : ''}
      ${art.full.avif ? `avif: "${art.full.avif}",` : ''}
      jpg: "${art.full.jpg}",
      width: ${art.full.width},
      height: ${art.full.height}
    }${art.alt ? `,
    alt: "${art.alt}"` : ''}
  }`;
      return entry;
    });

    return `import { Artwork } from '@/types/portfolio2';

export const UPLOADED_ARTWORKS: Artwork[] = [
${artworkEntries.join(',\n')}
];

// Auto-generated on ${new Date().toISOString()}
// Total artworks: ${artworks.length}
`;
  }

  /**
   * Download file to user's computer
   */
  private static downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Clear all uploaded artworks
   */
  static clearUploadedArtworks(): void {
    try {
      if (typeof window === 'undefined') return;
      
      localStorage.removeItem(this.UPLOADED_ARTWORKS_KEY);
      this.notifyGalleryUpdate();
      
      console.log('Cleared all uploaded artworks');
    } catch (error) {
      console.error('Error clearing uploaded artworks:', error);
    }
  }

  /**
   * Get statistics about portfolio including Shopify products
   */
  static async getPortfolioStats(): Promise<PortfolioStats> {
    try {
      const uploaded = this.getUploadedArtworks().length;
      
      // Get static count
      const { ARTWORKS } = await import('@/lib/portfolio2-data');
      const staticCount = ARTWORKS.length;
      
      // Get Shopify count from cache or API
      const shopifyCount = await this.getShopifyArtworkCount();
      
      const total = uploaded + staticCount + shopifyCount;
      const lastSync = this.getLastSyncTime();
      
      return { 
        total, 
        uploaded, 
        static: staticCount, 
        shopify: shopifyCount,
        lastSync 
      };
    } catch (error) {
      console.error('Error getting portfolio stats:', error);
      return { total: 0, uploaded: 0, static: 0, shopify: 0 };
    }
  }

  /**
   * Get Shopify products transformed as artworks
   */
  static async getShopifyArtworks(filters?: SourceConfig['shopifyFilters']): Promise<Artwork[]> {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      
      if (filters?.publishedOnly !== false) {
        params.set('publishedOnly', 'true');
      }
      
      if (filters?.vendor) {
        params.set('vendor', filters.vendor);
      }
      
      if (filters?.tags && filters.tags.length > 0) {
        params.set('tags', filters.tags.join(','));
      }
      
      if (filters?.categories && filters.categories.length > 0) {
        params.set('category', filters.categories[0]); // Take first category
      }
      
      // Set a reasonable limit for portfolio display
      params.set('limit', '50');
      
      // Fetch products from API
      const response = await fetch(`/api/products?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error?.message || 'Failed to fetch products');
      }
      
      // Transform products to artworks
      const shopifyArtworks = ProductToArtworkTransformer.transformProducts(data.data.products);
      
      // Update sync timestamp
      this.updateSyncTimestamp();
      
      console.log(`Loaded ${shopifyArtworks.length} Shopify artworks`);
      return shopifyArtworks;
      
    } catch (error) {
      console.error('Error fetching Shopify artworks:', error);
      return [];
    }
  }

  /**
   * Get count of available Shopify artworks (cached for performance)
   */
  static async getShopifyArtworkCount(): Promise<number> {
    try {
      // Check if we have a recent count cached
      const cachedCount = this.getCachedShopifyCount();
      if (cachedCount !== null) {
        return cachedCount;
      }
      
      // Fetch fresh count
      const response = await fetch('/api/products/stats');
      
      if (!response.ok) {
        return 0;
      }
      
      const data = await response.json();
      
      if (data.success) {
        const count = data.data.publishedProducts || data.data.totalProducts || 0;
        this.setCachedShopifyCount(count);
        return count;
      }
      
      return 0;
    } catch (error) {
      console.error('Error getting Shopify artwork count:', error);
      return 0;
    }
  }

  /**
   * Get cached Shopify count (valid for 5 minutes)
   */
  private static getCachedShopifyCount(): number | null {
    try {
      if (typeof window === 'undefined') return null;
      
      const cached = localStorage.getItem('SHOPIFY_COUNT_CACHE');
      const timestamp = localStorage.getItem('SHOPIFY_COUNT_TIMESTAMP');
      
      if (!cached || !timestamp) return null;
      
      const age = Date.now() - parseInt(timestamp);
      const maxAge = 5 * 60 * 1000; // 5 minutes
      
      if (age > maxAge) {
        // Cache expired
        localStorage.removeItem('SHOPIFY_COUNT_CACHE');
        localStorage.removeItem('SHOPIFY_COUNT_TIMESTAMP');
        return null;
      }
      
      return parseInt(cached);
    } catch (error) {
      return null;
    }
  }

  /**
   * Cache Shopify count
   */
  private static setCachedShopifyCount(count: number): void {
    try {
      if (typeof window === 'undefined') return;
      
      localStorage.setItem('SHOPIFY_COUNT_CACHE', count.toString());
      localStorage.setItem('SHOPIFY_COUNT_TIMESTAMP', Date.now().toString());
    } catch (error) {
      console.error('Error caching Shopify count:', error);
    }
  }

  /**
   * Update sync timestamp
   */
  private static updateSyncTimestamp(): void {
    try {
      if (typeof window === 'undefined') return;
      
      localStorage.setItem(this.SHOPIFY_SYNC_KEY, new Date().toISOString());
    } catch (error) {
      console.error('Error updating sync timestamp:', error);
    }
  }

  /**
   * Get last sync time
   */
  private static getLastSyncTime(): string | undefined {
    try {
      if (typeof window === 'undefined') return undefined;
      
      return localStorage.getItem(this.SHOPIFY_SYNC_KEY) || undefined;
    } catch (error) {
      return undefined;
    }
  }

  /**
   * Force refresh Shopify artworks and clear cache
   */
  static async refreshShopifyArtworks(): Promise<void> {
    try {
      // Clear cache
      if (typeof window !== 'undefined') {
        localStorage.removeItem('SHOPIFY_COUNT_CACHE');
        localStorage.removeItem('SHOPIFY_COUNT_TIMESTAMP');
      }
      
      // Trigger portfolio update
      this.notifyGalleryUpdate();
      
      console.log('Shopify artworks cache cleared and refresh triggered');
    } catch (error) {
      console.error('Error refreshing Shopify artworks:', error);
    }
  }

  /**
   * Configure portfolio sources
   */
  static setSourceConfig(config: SourceConfig): void {
    try {
      if (typeof window === 'undefined') return;
      
      localStorage.setItem(this.PORTFOLIO_CONFIG_KEY, JSON.stringify(config));
      this.notifyGalleryUpdate();
    } catch (error) {
      console.error('Error setting source config:', error);
    }
  }

  /**
   * Get portfolio source configuration
   */
  static getSourceConfig(): SourceConfig {
    try {
      if (typeof window === 'undefined') {
        return { includeStatic: true, includeUploaded: true, includeShopify: true };
      }
      
      const stored = localStorage.getItem(this.PORTFOLIO_CONFIG_KEY);
      
      if (stored) {
        return JSON.parse(stored);
      }
      
      // Default configuration
      return { includeStatic: true, includeUploaded: true, includeShopify: true };
    } catch (error) {
      console.error('Error getting source config:', error);
      return { includeStatic: true, includeUploaded: true, includeShopify: true };
    }
  }
}
