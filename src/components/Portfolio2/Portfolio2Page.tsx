'use client';

import React from 'react';
import { Portfolio2PageProps } from '@/types/portfolio2';
import { usePortfolio2Data } from '@/hooks/usePortfolio2Data';
import GalleryGrid from './GalleryGrid';
import Portfolio2Manager from './Portfolio2Manager';
import styles from './Portfolio2Page.module.css';

export default function Portfolio2Page({ artworks: staticArtworks }: Portfolio2PageProps) {
  const { artworks, isLoading, error, refresh, stats } = usePortfolio2Data();

  // Use dynamic artworks if available, otherwise fall back to static props
  const displayArtworks = artworks.length > 0 ? artworks : staticArtworks;

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <h2>Error Loading Portfolio</h2>
          <p>{error}</p>
          <button onClick={refresh} className={styles.retryButton}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!displayArtworks || displayArtworks.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <h1>Portfolio 2</h1>
          <p>Brak prac do wyświetlenia.</p>
          {stats.uploaded > 0 && (
            <div className={styles.stats}>
              <p>Uploaded artworks: {stats.uploaded}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Portfolio 2</h1>
        <p className={styles.description}>
          Kolekcja prac artystycznych w formacie 4:5
        </p>
        
        {/* Portfolio Stats */}
        <div className={styles.statsContainer}>
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{stats.total}</span>
              <span className={styles.statLabel}>Total Works</span>
            </div>
            {stats.uploaded > 0 && (
              <div className={styles.statItem}>
                <span className={styles.statNumber}>{stats.uploaded}</span>
                <span className={styles.statLabel}>Recently Added</span>
              </div>
            )}
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{stats.static}</span>
              <span className={styles.statLabel}>Original Collection</span>
            </div>
          </div>
          
          {/* Refresh Button */}
          <button 
            onClick={refresh} 
            className={styles.refreshButton}
            title="Refresh portfolio data"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
            Refresh
          </button>
        </div>
      </header>

      <main className={styles.main}>
        {/* Portfolio Management */}
        <Portfolio2Manager onRefresh={refresh} />
        
        {/* Gallery Grid */}
        <GalleryGrid 
          artworks={displayArtworks}
          gap={16}
        />
      </main>
    </div>
  );
}
