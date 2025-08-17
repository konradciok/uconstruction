'use client';

import React, { useState, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GalleryItem } from '@/types/gallery';
import { galleryFilters } from '@/lib/gallery-data';
import GalleryItemComponent from './GalleryItem';
import VirtualizedGrid from './VirtualizedGrid';
import Lightbox from './Lightbox';
import Button from '@/components/ui/Button';
import SearchInput from '@/components/ui/SearchInput';
import MultiSelectFilter, { FilterOption } from '@/components/ui/MultiSelectFilter';
import { useDebounce } from '@/hooks/useDebounce';
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
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [filterLogic, setFilterLogic] = useState<'AND' | 'OR'>('OR');
  const [isLoading, setIsLoading] = useState(false);
  
  // Lightbox state
  const [lightboxState, setLightboxState] = useState({
    isOpen: false,
    currentItem: null as GalleryItem | null,
    currentIndex: 0
  });
  
  // Reference to track the triggering element for focus restoration
  const triggerRef = useRef<HTMLElement | null>(null);

  // Debounce search query for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Get unique categories with counts
  const categoryOptions = useMemo((): FilterOption[] => {
    const categoryCounts = items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return galleryFilters
      .filter(filter => filter.category !== 'all')
      .map(filter => ({
        value: filter.category,
        label: filter.label,
        count: categoryCounts[filter.category] || 0
      }));
  }, [items]);

  // Enhanced filtering logic
  const filteredItems = useMemo(() => {
    let result = items;

    // Category filtering with AND/OR logic
    if (selectedCategories.length > 0) {
      if (filterLogic === 'AND') {
        // Show items that match ALL selected categories
        result = result.filter(item => 
          selectedCategories.every(category => item.category === category)
        );
      } else {
        // Show items that match ANY selected category (OR logic)
        result = result.filter(item => 
          selectedCategories.includes(item.category)
        );
      }
    }

    // Search filtering
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase().trim();
      result = result.filter(item => {
        const searchableFields = [
          item.title,
          item.description,
          item.medium,
          item.category,
          item.year?.toString()
        ].filter(Boolean);

        return searchableFields.some(field => 
          field.toLowerCase().includes(query)
        );
      });
    }

    return result;
  }, [items, selectedCategories, filterLogic, debouncedSearchQuery]);

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

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleCategoryChange = useCallback((categories: string[]) => {
    setSelectedCategories(categories);
  }, []);

  const handleLogicChange = useCallback((logic: 'AND' | 'OR') => {
    setFilterLogic(logic);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategories([]);
  }, []);

  const handleItemClick = useCallback((item: GalleryItem, element?: HTMLElement) => {
    const currentIndex = filteredItems.findIndex(filteredItem => filteredItem.id === item.id);
    
    // Store reference to the triggering element
    if (element) {
      triggerRef.current = element;
    }
    
    setLightboxState({
      isOpen: true,
      currentItem: item,
      currentIndex: currentIndex >= 0 ? currentIndex : 0
    });
  }, [filteredItems]);

  const handleLightboxClose = useCallback(() => {
    setLightboxState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const handleLightboxNext = useCallback(() => {
    const nextIndex = (lightboxState.currentIndex + 1) % filteredItems.length;
    setLightboxState({
      isOpen: true,
      currentItem: filteredItems[nextIndex],
      currentIndex: nextIndex
    });
  }, [lightboxState.currentIndex, filteredItems]);

  const handleLightboxPrevious = useCallback(() => {
    const prevIndex = lightboxState.currentIndex === 0 
      ? filteredItems.length - 1 
      : lightboxState.currentIndex - 1;
    setLightboxState({
      isOpen: true,
      currentItem: filteredItems[prevIndex],
      currentIndex: prevIndex
    });
  }, [lightboxState.currentIndex, filteredItems]);

  const handleLightboxJumpToIndex = useCallback((index: number) => {
    if (index >= 0 && index < filteredItems.length) {
      setLightboxState({
        isOpen: true,
        currentItem: filteredItems[index],
        currentIndex: index
      });
    }
  }, [filteredItems]);

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

  // Check if any filters are active
  const hasActiveFilters = searchQuery.trim() || selectedCategories.length > 0;

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
        key={`${selectedCategories.join(',')}-${debouncedSearchQuery}-${filterLogic}`} // Re-animate when filters change
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
                  {' '}matching "{searchQuery}"
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
        isOpen={lightboxState.isOpen}
        currentItem={lightboxState.currentItem}
        currentIndex={lightboxState.currentIndex}
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
