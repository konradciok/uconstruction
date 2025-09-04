import { ProcessedImage } from '@/types/upload';
import { Artwork } from '@/types/portfolio2';

export class Portfolio2Manager {
  private static readonly PORTFOLIO_DATA_PATH = '/src/lib/portfolio2-data.ts';
  private static readonly UPLOADED_ARTWORKS_KEY = 'UPLOADED_ARTWORKS';

  /**
   * Convert ProcessedImage to Artwork format
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
      alt: processedImage.alt
    };
  }

  /**
   * Get all artworks from both static data and uploaded data
   */
  static async getAllArtworks(): Promise<Artwork[]> {
    try {
      // Get static artworks
      const { ARTWORKS } = await import('@/lib/portfolio2-data');
      
      // Get uploaded artworks from localStorage
      const uploadedArtworks = this.getUploadedArtworks();
      
      // Combine and return
      return [...ARTWORKS, ...uploadedArtworks];
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
   * Get statistics about portfolio
   */
  static getPortfolioStats(): { total: number; uploaded: number; static: number } {
    try {
      const uploaded = this.getUploadedArtworks().length;
      // Note: Static count would need to be imported, but we'll estimate
      const staticCount = 10; // Approximate count from portfolio2-data.ts
      const total = uploaded + staticCount;
      
      return { total, uploaded, static: staticCount };
    } catch (error) {
      console.error('Error getting portfolio stats:', error);
      return { total: 0, uploaded: 0, static: 0 };
    }
  }
}
