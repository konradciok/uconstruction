/**
 * Portfolio2Manager - Stub Implementation
 * 
 * This is a temporary stub to fix TypeScript errors.
 * The functionality has been moved to other services.
 * TODO: Remove this file and update components to use new services.
 */

import { Artwork, PortfolioStats, SourceConfig } from '@/types/portfolio2';

export class Portfolio2Manager {
  static async getAllArtworks(): Promise<Artwork[]> {
    console.warn('Portfolio2Manager.getAllArtworks() is deprecated. Use artwork-fetcher instead.');
    return [];
  }

  static async getPortfolioStats(): Promise<PortfolioStats> {
    console.warn('Portfolio2Manager.getPortfolioStats() is deprecated.');
    return {
      total: 0,
      uploaded: 0,
      lastSync: new Date().toISOString(),
    };
  }

  static getSourceConfig(): SourceConfig {
    console.warn('Portfolio2Manager.getSourceConfig() is deprecated.');
    return {
      includeUploaded: true,
    };
  }

  static async addArtworks(_artworks: Artwork[]): Promise<void> {
    console.warn('Portfolio2Manager.addArtworks() is deprecated. Use upload-service instead.');
  }

  static async updateArtwork(_id: string, _artwork: Artwork): Promise<void> {
    console.warn('Portfolio2Manager.updateArtwork() is deprecated.');
  }

  static async removeArtwork(_id: string): Promise<void> {
    console.warn('Portfolio2Manager.removeArtwork() is deprecated.');
  }

  static async listUploadedArtworks(): Promise<Artwork[]> {
    console.warn('Portfolio2Manager.listUploadedArtworks() is deprecated.');
    return [];
  }

  static async refreshArtworks(): Promise<void> {
    console.warn('Portfolio2Manager.refreshArtworks() is deprecated.');
  }

  static exportPortfolioData(): void {
    console.warn('Portfolio2Manager.exportPortfolioData() is deprecated.');
  }
}
