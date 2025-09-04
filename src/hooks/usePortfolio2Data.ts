import { useState, useEffect, useCallback } from 'react';
import { Artwork } from '@/types/portfolio2';
import { Portfolio2Manager } from '@/lib/portfolio2-manager';

interface UsePortfolio2DataReturn {
  artworks: Artwork[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  stats: {
    total: number;
    uploaded: number;
    static: number;
  };
}

export function usePortfolio2Data(): UsePortfolio2DataReturn {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, uploaded: 0, static: 0 });

  const loadArtworks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const allArtworks = await Portfolio2Manager.getAllArtworks();
      setArtworks(allArtworks);
      
      // Update stats
      const portfolioStats = Portfolio2Manager.getPortfolioStats();
      setStats(portfolioStats);
      
    } catch (err) {
      console.error('Error loading portfolio data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load portfolio data');
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

  return {
    artworks,
    isLoading,
    error,
    refresh,
    stats
  };
}
