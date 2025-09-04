import { useState, useCallback, useRef } from 'react';
import { Artwork } from '@/types/portfolio2';

interface UsePortfolio2LightboxProps {
  artworks: Artwork[];
}

interface UsePortfolio2LightboxReturn {
  isOpen: boolean;
  currentIndex: number;
  currentArtwork: Artwork | null;
  openWithIndex: (index: number) => void;
  close: () => void;
  next: () => void;
  previous: () => void;
  jumpTo: (index: number) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
}

export function usePortfolio2Lightbox({ artworks }: UsePortfolio2LightboxProps): UsePortfolio2LightboxReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const triggerRef = useRef<HTMLElement | null>(null);

  const currentArtwork = artworks[currentIndex] || null;

  const openWithIndex = useCallback((index: number) => {
    if (index >= 0 && index < artworks.length) {
      setCurrentIndex(index);
      setIsOpen(true);
    }
  }, [artworks.length]);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const next = useCallback(() => {
    const nextIndex = currentIndex === artworks.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(nextIndex);
  }, [currentIndex, artworks.length]);

  const previous = useCallback(() => {
    const prevIndex = currentIndex === 0 ? artworks.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);
  }, [currentIndex, artworks.length]);

  const jumpTo = useCallback((index: number) => {
    if (index >= 0 && index < artworks.length) {
      setCurrentIndex(index);
    }
  }, [artworks.length]);

  return {
    isOpen,
    currentIndex,
    currentArtwork,
    openWithIndex,
    close,
    next,
    previous,
    jumpTo,
    triggerRef,
  };
}
