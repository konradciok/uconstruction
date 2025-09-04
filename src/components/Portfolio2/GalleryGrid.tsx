'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { GalleryGridProps } from '@/types/portfolio2';
import GalleryItem from './GalleryItem';
import LightboxModal from './LightboxModal';
import styles from './GalleryGrid.module.css';

export default function GalleryGrid({
  artworks,
  columns,
  gap = 16
}: GalleryGridProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentArtworks, setCurrentArtworks] = useState(artworks);

  // Update artworks when props change (e.g., new uploads)
  useEffect(() => {
    setCurrentArtworks(artworks);
  }, [artworks]);

  // Listen for portfolio updates
  useEffect(() => {
    const handlePortfolioUpdate = () => {
      console.log('GalleryGrid: Portfolio update detected');
      // The parent component will handle the refresh
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('portfolio2-update', handlePortfolioUpdate);
      
      return () => {
        window.removeEventListener('portfolio2-update', handlePortfolioUpdate);
      };
    }
  }, []);

  const handleOpenLightbox = useCallback((index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  }, []);

  const handleCloseLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const handleNavigate = useCallback((nextIndex: number) => {
    setCurrentIndex(nextIndex);
  }, []);

  const defaultColumns = { xl: 5, lg: 4, md: 3, sm: 2, xs: 1 };
  const responsiveColumns = { ...defaultColumns, ...(columns || {}) };

  if (!currentArtworks || currentArtworks.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>Brak prac do wyświetlenia.</p>
      </div>
    );
  }

  return (
    <div className={styles.galleryContainer}>
      <div
        className={styles.grid}
        style={{
          '--gap': `${gap}px`,
          '--columns-xl': responsiveColumns.xl,
          '--columns-lg': responsiveColumns.lg,
          '--columns-md': responsiveColumns.md,
          '--columns-sm': responsiveColumns.sm,
          '--columns-xs': responsiveColumns.xs,
        } as React.CSSProperties}
      >
        {currentArtworks.map((artwork, index) => (
          <GalleryItem
            key={artwork.id}
            artwork={artwork}
            index={index}
            onOpen={handleOpenLightbox}
          />
        ))}
      </div>

      <LightboxModal
        artworks={currentArtworks}
        index={currentIndex}
        isOpen={lightboxOpen}
        onClose={handleCloseLightbox}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
