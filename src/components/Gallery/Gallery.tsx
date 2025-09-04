'use client';

import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GalleryItem } from '@/types/gallery';
import GalleryItemComponent from './GalleryItem';
import VirtualizedGrid from './VirtualizedGrid';
import Lightbox from './Lightbox';
import SearchInput from '@/components/ui/SearchInput';
import MultiSelectFilter from '@/components/ui/MultiSelectFilter';
import { usePerformanceMonitor } from './usePerformanceMonitor';
import { useGalleryFilters } from '@/hooks/useGalleryFilters';
import { useLightboxNavigation } from '@/hooks/useLightboxNavigation';
import styles from './Gallery.module.css';

interface GalleryProps {
  items: GalleryItem[];
  title?: string;
  description?: string;
  enableVirtualization?: boolean;
  virtualizationThreshold?: number;
}

export default function Gallery({ 
  items, 
  title, 
  description, 
  enableVirtualization = false,
  virtualizationThreshold = 50
}: GalleryProps) {
  const isDev = process.env.NODE_ENV === 'development';
  // Filters via hook
  const {
    searchQuery,
    setSearchQuery,
    selectedCategories,
    setSelectedCategories,
    filterLogic,
    setFilterLogic,
    categoryOptions,
    filteredItems,
    hasActiveFilters,
    clearFilters,
  } = useGalleryFilters(items);
  
  // Reference to track the triggering element for focus restoration
  const triggerRef = useRef<HTMLElement | null>(null);

  // Loading state (placeholder for future async fetches)
  const isLoading = false;

  // Determine if virtualization should be used
  const shouldUseVirtualization = enableVirtualization && filteredItems.length > virtualizationThreshold;

  // Calculate responsive columns
  const getColumns = useCallback(() => {
    if (typeof window === 'undefined') return 3;
    
    const width = window.innerWidth;
    if (width < 480) return 1;
    if (width < 768) return 2;
    if (width < 1200) return 3;
    return 4;
  }, []);

  const handleSearchChange = useCallback((query: string) => setSearchQuery(query), [setSearchQuery]);
  const handleCategoryChange = useCallback((categories: string[]) => setSelectedCategories(categories), [setSelectedCategories]);
  const handleLogicChange = useCallback((logic: 'AND' | 'OR') => setFilterLogic(logic), [setFilterLogic]);
  const handleClearFilters = useCallback(() => clearFilters(), [clearFilters]);

  // Performance monitoring (dev only): FPS budget and render timing
  const { startRenderMeasure, endRenderMeasure } = usePerformanceMonitor(filteredItems.length, {
    enabled: isDev,
    onMetricsUpdate: (metrics) => {
      if (metrics.fps < 50) {
        // eslint-disable-next-line no-console
        console.warn('[Gallery] FPS below budget', metrics);
      }
    },
  });

  // Measure render phases for the gallery grid in dev
  useEffect(() => {
    if (!isDev) return;
    startRenderMeasure();
    // End on next animation frame to approximate render completion
    const rafId = requestAnimationFrame(() => {
      endRenderMeasure();
    });
    return () => cancelAnimationFrame(rafId);
  }, [isDev, startRenderMeasure, endRenderMeasure, filteredItems.length, enableVirtualization]);

  // CLS budget monitoring (dev only)
  useEffect(() => {
    if (!isDev || typeof PerformanceObserver === 'undefined') return;

    let cumulativeLayoutShift = 0;
    interface LayoutShiftEntry extends PerformanceEntry {
      value: number;
      hadRecentInput: boolean;
    }

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as LayoutShiftEntry[]) {
        if (!entry.hadRecentInput) {
          cumulativeLayoutShift += entry.value;
          if (cumulativeLayoutShift > 0.05) {
            // eslint-disable-next-line no-console
            console.warn('[Gallery] CLS above budget', cumulativeLayoutShift.toFixed(3));
          }
        }
      }
    });
    try {
      observer.observe({ type: 'layout-shift', buffered: true } as PerformanceObserverInit);
    } catch {
      // ignore if not supported
    }
    return () => observer.disconnect();
  }, [isDev]);

  const { isOpen, currentItem, currentIndex, openWithItem, close, next, previous, jumpTo } = useLightboxNavigation({ items: filteredItems });

  const handleItemClick = useCallback((item: GalleryItem, element?: HTMLElement) => {
    if (element) {
      triggerRef.current = element;
    }
    openWithItem(item);
  }, [openWithItem]);

  const handleLightboxClose = useCallback(() => close(), [close]);
  const handleLightboxNext = useCallback(() => next(), [next]);
  const handleLightboxPrevious = useCallback(() => previous(), [previous]);
  const handleLightboxJumpToIndex = useCallback((index: number) => jumpTo(index), [jumpTo]);

  // Animation variants for grid
  const gridVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    }
  };

  // Check if any filters are active (from hook)

  if (!items || items.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No gallery items available.</p>
      </div>
    );
  }

  const renderGrid = () => {
    if (isLoading) {
      return (
        <motion.div 
          className={styles.loadingState}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className={styles.loadingSpinner}></div>
          <p>Loading...</p>
        </motion.div>
      );
    }

    if (shouldUseVirtualization) {
      // Use virtualized grid for large datasets
      return (
        <VirtualizedGrid
          items={filteredItems}
          onItemClick={handleItemClick}
          columns={getColumns()}
          itemHeight={400}
          containerHeight="80vh"
          enablePreloading={true}
        />
      );
    }

    // Regular grid for smaller datasets
    return (
      <motion.div 
        className={styles.grid}
        variants={gridVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        key={`${selectedCategories.join(',')}-${searchQuery}-${filterLogic}`} // Re-animate when filters change
      >
        {filteredItems.map((item, index) => (
          <GalleryItemComponent
            key={item.id}
            item={item}
            onClick={handleItemClick}
            index={index}
          />
        ))}
      </motion.div>
    );
  };

  return (
    <div className={styles.gallery}>
      {/* Gallery Header */}
      {(title || description) && (
        <motion.div 
          className={styles.header}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {title && <h2 className={styles.title}>{title}</h2>}
          {description && <p className={styles.description}>{description}</p>}
        </motion.div>
      )}

      {/* Enhanced Filter Controls */}
      <motion.div 
        className={styles.filterControls}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
      >
        {/* Search Input */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut", delay: 0.3 }}
        >
          <SearchInput
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by title, description, medium..."
            className={styles.searchInput}
            onClear={handleClearFilters}
          />
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut", delay: 0.4 }}
        >
          <MultiSelectFilter
            options={categoryOptions}
            selectedValues={selectedCategories}
            onSelectionChange={handleCategoryChange}
            logic={filterLogic}
            onLogicChange={handleLogicChange}
            placeholder="Filter by category..."
            className={styles.categoryFilter}
          />
        </motion.div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <motion.button
            type="button"
            onClick={handleClearFilters}
            className={styles.clearFiltersButton}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            Clear All Filters
          </motion.button>
        )}
      </motion.div>

      {/* Gallery Grid */}
      <div className={styles.gridContainer}>
        <AnimatePresence mode="wait">
          {renderGrid()}
        </AnimatePresence>
      </div>

      {/* Enhanced Results Count */}
      <motion.div 
        className={styles.resultsCount}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <p>
          {hasActiveFilters ? (
            <>
              Showing {filteredItems.length} of {items.length} items
              {searchQuery.trim() && (
                <span className={styles.filterInfo}>
                  {' '}matching &ldquo;{searchQuery}&rdquo;
                </span>
              )}
              {selectedCategories.length > 0 && (
                <span className={styles.filterInfo}>
                  {' '}in {selectedCategories.length} selected {selectedCategories.length === 1 ? 'category' : 'categories'} ({filterLogic})
                </span>
              )}
            </>
          ) : (
            `Showing all ${items.length} items`
          )}
          {shouldUseVirtualization && (
            <span className={styles.virtualizationNote}>
              {' '}(Virtualized for performance)
            </span>
          )}
        </p>
      </motion.div>

      {/* Lightbox */}
      <Lightbox
        isOpen={isOpen}
        currentItem={currentItem}
        currentIndex={currentIndex}
        totalItems={filteredItems.length}
        filteredItems={filteredItems}
        onClose={handleLightboxClose}
        onNext={handleLightboxNext}
        onPrevious={handleLightboxPrevious}
        onJumpToIndex={handleLightboxJumpToIndex}
        triggerRef={triggerRef}
      />
    </div>
  );
}
