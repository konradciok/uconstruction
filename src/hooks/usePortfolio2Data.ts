import { useState, useEffect, useCallback } from 'react';
import { Artwork, PortfolioStats, SourceConfig } from '@/types/portfolio2';
import { Portfolio2Manager } from '@/lib/portfolio2-manager';

interface UsePortfolio2DataReturn {
  artworks: Artwork[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  stats: PortfolioStats;
  refreshProducts: () => Promise<void>;
  sourceConfig: SourceConfig;
  updateSourceConfig: (config: SourceConfig) => void;
}

export function usePortfolio2Data(
  config?: SourceConfig
): UsePortfolio2DataReturn {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<PortfolioStats>({
    total: 0,
    uploaded: 0,
  });
  const [sourceConfig, setSourceConfig] = useState<SourceConfig>(
    config || Portfolio2Manager.getSourceConfig()
  );

  const loadArtworks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get artworks with current source configuration
      const allArtworks = await Portfolio2Manager.getAllArtworks();
      setArtworks(allArtworks);

      // Update stats (async now)
      const portfolioStats = await Portfolio2Manager.getPortfolioStats();
      setStats(portfolioStats);
    } catch (err) {
      console.error('Error loading portfolio data:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to load portfolio data'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load artworks on mount
  useEffect(() => {
    loadArtworks();
  }, [loadArtworks]);

  // Listen for portfolio updates
  useEffect(() => {
    const handlePortfolioUpdate = () => {
      console.log('Portfolio update detected, refreshing data...');
      loadArtworks();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('portfolio2-update', handlePortfolioUpdate);

      return () => {
        window.removeEventListener('portfolio2-update', handlePortfolioUpdate);
      };
    }
  }, [loadArtworks]);

  const refresh = useCallback(async () => {
    await loadArtworks();
  }, [loadArtworks]);

  // Refresh products specifically
  const refreshProducts = useCallback(async () => {
    try {
      await Portfolio2Manager.refreshArtworks();
      await loadArtworks();
    } catch (err) {
      console.error('Error refreshing artworks:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to refresh product data'
      );
    }
  }, [loadArtworks]);

  // Update source configuration
  const updateSourceConfig = useCallback((config: SourceConfig) => {
    setSourceConfig(config);
    // The loadArtworks will be triggered by the useEffect below
  }, []);

  // Reload artworks when source config changes
  useEffect(() => {
    loadArtworks();
  }, [loadArtworks]);

  return {
    artworks,
    isLoading,
    error,
    refresh,
    stats,
    refreshProducts,
    sourceConfig,
    updateSourceConfig,
  };
}
