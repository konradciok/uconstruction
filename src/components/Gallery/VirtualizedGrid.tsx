'use client';

import React, { useRef, useCallback, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { GalleryItem } from '@/types/gallery';
import GalleryItemComponent from './GalleryItem';
import { useIntersectionPreloader } from './useIntersectionPreloader';
import styles from './Gallery.module.css';

interface VirtualizedGridProps {
  items: GalleryItem[];
  onItemClick: (item: GalleryItem, element?: HTMLElement) => void;
  columns?: number;
  itemHeight?: number;
  containerHeight?: string;
  enablePreloading?: boolean;
}

export default function VirtualizedGrid({
  items,
  onItemClick,
  columns = 3,
  itemHeight = 400,
  containerHeight = '80vh',
  enablePreloading = true
}: VirtualizedGridProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Calculate rows based on items and columns
  const rows = useMemo(() => {
    return Math.ceil(items.length / columns);
  }, [items.length, columns]);

  // Set up intersection preloader
  const { observeElement } = useIntersectionPreloader(
    items,
    {
      rootMargin: '200px',
      threshold: 0.1,
      preloadDistance: 10
    }
  );

  // Virtualization setup
  const rowVirtualizer = useVirtualizer({
    count: rows,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => itemHeight, [itemHeight]),
    overscan: 3, // Number of rows to render outside viewport
  });

  const getItemsForRow = useCallback((rowIndex: number) => {
    const startIndex = rowIndex * columns;
    const endIndex = Math.min(startIndex + columns, items.length);
    return items.slice(startIndex, endIndex);
  }, [items, columns]);

  const handleIntersection = useCallback((element: HTMLElement | null, index: number) => {
    if (enablePreloading) {
      observeElement(element, index);
    }
  }, [observeElement, enablePreloading]);

  return (
    <div
      ref={parentRef}
      className={styles.virtualizedGrid}
      style={{
        height: containerHeight,
        overflow: 'auto',
      }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const rowItems = getItemsForRow(virtualRow.index);
          
          return (
            <div
              key={virtualRow.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
                display: 'grid',
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gap: 'var(--spacing-lg)',
                padding: 'var(--spacing-lg)',
              }}
            >
              {rowItems.map((item, columnIndex) => {
                const globalIndex = virtualRow.index * columns + columnIndex;
                return (
                  <div
                    key={`${virtualRow.index}-${columnIndex}`}
                    style={{
                      height: '100%',
                      display: 'flex',
                    }}
                  >
                    <GalleryItemComponent
                      item={item}
                      onClick={onItemClick}
                      index={globalIndex}
                      onIntersection={handleIntersection}
                    />
                  </div>
                );
              })}
              {/* Fill empty slots to maintain grid structure */}
              {Array.from({ length: columns - rowItems.length }).map((_, index) => (
                <div
                  key={`empty-${virtualRow.index}-${index}`}
                  style={{ height: '100%' }}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
