import { useEffect, useRef, useCallback } from 'react';

interface UseIntersectionPreloaderOptions {
  rootMargin?: string;
  threshold?: number;
  preloadDistance?: number;
}

export function useIntersectionPreloader(
  items: Array<{ id: string; imageUrl: string }>,
  options: UseIntersectionPreloaderOptions = {}
) {
  const {
    rootMargin = '100px',
    threshold = 0.1,
    preloadDistance = 5
  } = options;

  const observerRef = useRef<IntersectionObserver | null>(null);
  const preloadedRef = useRef<Set<string>>(new Set());

  const preloadImage = useCallback((url: string) => {
    if (preloadedRef.current.has(url)) return;
    
    const img = new Image();
    img.src = url;
    preloadedRef.current.add(url);
  }, []);

  const preloadNearbyImages = useCallback((currentIndex: number) => {
    const start = Math.max(0, currentIndex - preloadDistance);
    const end = Math.min(items.length, currentIndex + preloadDistance + 1);
    
    for (let i = start; i < end; i++) {
      const item = items[i];
      if (item && !preloadedRef.current.has(item.imageUrl)) {
        preloadImage(item.imageUrl);
      }
    }
  }, [items, preloadDistance, preloadImage]);

  useEffect(() => {
    if (typeof window === 'undefined' || !items.length) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            const index = parseInt(element.dataset.index || '0', 10);
            preloadNearbyImages(index);
          }
        });
      },
      {
        rootMargin,
        threshold,
      }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [items, rootMargin, threshold, preloadNearbyImages]);

  const observeElement = useCallback((element: HTMLElement | null, index: number) => {
    if (!element || !observerRef.current) return;
    
    element.dataset.index = index.toString();
    observerRef.current.observe(element);
  }, []);

  const unobserveElement = useCallback((element: HTMLElement | null) => {
    if (!element || !observerRef.current) return;
    
    observerRef.current.unobserve(element);
  }, []);

  return {
    observeElement,
    unobserveElement,
    isPreloaded: (url: string) => preloadedRef.current.has(url),
  };
}
