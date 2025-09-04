'use client';

import { useCallback, useMemo, useState } from 'react';
import { GalleryItem } from '@/types/gallery';

interface UseLightboxNavigationArgs {
  items: GalleryItem[];
}

interface UseLightboxNavigationResult {
  isOpen: boolean;
  currentIndex: number;
  currentItem: GalleryItem | null;
  openAt: (index: number) => void;
  openWithItem: (item: GalleryItem) => void;
  close: () => void;
  next: () => void;
  previous: () => void;
  jumpTo: (index: number) => void;
}

export function useLightboxNavigation(
  { items }: UseLightboxNavigationArgs
): UseLightboxNavigationResult {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const total = items.length;
  const currentItem = useMemo(() => (total > 0 ? items[currentIndex] ?? null : null), [items, currentIndex, total]);

  const openAt = useCallback((index: number) => {
    if (index < 0 || index >= total) return;
    setCurrentIndex(index);
    setIsOpen(true);
  }, [total]);

  const openWithItem = useCallback((item: GalleryItem) => {
    const index = items.findIndex(i => i.id === item.id);
    if (index >= 0) {
      setCurrentIndex(index);
      setIsOpen(true);
    }
  }, [items]);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const next = useCallback(() => {
    if (total === 0) return;
    setCurrentIndex(prev => (prev + 1) % total);
  }, [total]);

  const previous = useCallback(() => {
    if (total === 0) return;
    setCurrentIndex(prev => (prev - 1 + total) % total);
  }, [total]);

  const jumpTo = useCallback((index: number) => {
    if (index < 0 || index >= total) return;
    setCurrentIndex(index);
    setIsOpen(true);
  }, [total]);

  return {
    isOpen,
    currentIndex,
    currentItem,
    openAt,
    openWithItem,
    close,
    next,
    previous,
    jumpTo,
  };
}


