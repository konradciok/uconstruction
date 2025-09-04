'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { GalleryItem } from '@/types/gallery';
import styles from './Lightbox.module.css';

interface LightboxProps {
  isOpen: boolean;
  currentItem: GalleryItem | null;
  currentIndex: number;
  totalItems: number;
  filteredItems: GalleryItem[]; // Add filtered items for preloading
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onJumpToIndex?: (index: number) => void; // Add callback for jumping to specific index
  triggerRef?: React.RefObject<HTMLElement | null>; // Reference to the triggering element
}

export default function Lightbox({
  isOpen,
  currentItem,
  currentIndex,
  totalItems,
  filteredItems,
  onClose,
  onNext,
  onPrevious,
  onJumpToIndex,
  triggerRef
}: LightboxProps) {
  // Pointer events state
  const start = useRef<{x: number; y: number; t: number} | null>(null);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [axisLock, setAxisLock] = useState<'undecided' | 'horizontal' | 'vertical'>('undecided');
  
  // Constants
  const THRESHOLD = 48; // Minimum distance for swipe
  const VELOCITY_THRESHOLD = 0.5; // Minimum velocity for quick flicks (px/ms)
  const AXIS_LOCK_THRESHOLD = 10; // Distance to determine axis lock
  
  const contentRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const prevButtonRef = useRef<HTMLButtonElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  
  // Focus trap refs
  const firstFocusableRef = useRef<HTMLButtonElement>(null);
  const lastFocusableRef = useRef<HTMLButtonElement>(null);

  // Animation variants for Framer Motion
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const contentVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.9,
      y: 20
    },
    visible: { 
      opacity: 1,
      scale: 1,
      y: 0
    },
    exit: { 
      opacity: 0,
      scale: 0.9,
      y: 20
    }
  };

  const swipeFeedbackVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.8
    },
    visible: { 
      opacity: 1,
      scale: 1
    },
    exit: { 
      opacity: 0,
      scale: 0.8
    }
  };

  // Preload neighboring images for faster navigation
  useEffect(() => {
    if (!isOpen || !currentItem || totalItems <= 1) return;

    const preloadImage = (url?: string) => {
      if (!url) return;
      const img = new window.Image();
      img.decoding = 'async';
      img.src = url;
    };

    // Preload next image
    const nextIndex = (currentIndex + 1) % totalItems;
    const nextItem = filteredItems[nextIndex];
    if (nextItem) {
      preloadImage(nextItem.imageUrl);
    }

    // Preload previous image
    const prevIndex = (currentIndex - 1 + totalItems) % totalItems;
    const prevItem = filteredItems[prevIndex];
    if (prevItem) {
      preloadImage(prevItem.imageUrl);
    }
  }, [isOpen, currentItem, currentIndex, totalItems, filteredItems]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isOpen) return;

    switch (event.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowRight':
        onNext();
        break;
      case 'ArrowLeft':
        onPrevious();
        break;
      case 'Home':
        // Jump to first image
        if (totalItems > 1 && onJumpToIndex) {
          onJumpToIndex(0);
        }
        break;
      case 'End':
        // Jump to last image
        if (totalItems > 1 && onJumpToIndex) {
          onJumpToIndex(totalItems - 1);
        }
        break;
    }
  }, [isOpen, onClose, onNext, onPrevious, currentIndex, totalItems, filteredItems, onJumpToIndex]);

  // Focus trap handler
  const handleFocusTrap = useCallback((event: KeyboardEvent) => {
    if (!isOpen) return;

    if (event.key === 'Tab') {
      const focusableElements = [
        closeButtonRef.current,
        prevButtonRef.current,
        nextButtonRef.current
      ].filter(Boolean) as HTMLElement[];

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  }, [isOpen]);

  // Pointer event handlers
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return; // Only handle left mouse button
    
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);
    
    start.current = { 
      x: e.clientX, 
      y: e.clientY, 
      t: performance.now() 
    };
    
    setAxisLock('undecided');
    setIsDragging(false);
    setDragX(0);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!start.current) return;

    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Determine axis lock if still undecided
    if (axisLock === 'undecided' && distance > AXIS_LOCK_THRESHOLD) {
      if (Math.abs(dx) > Math.abs(dy)) {
        setAxisLock('horizontal');
        setIsDragging(true);
      } else {
        setAxisLock('vertical');
        // Release pointer capture to allow page scroll
        const target = e.currentTarget as HTMLElement;
        target.releasePointerCapture(e.pointerId);
        start.current = null;
        return;
      }
    }

    // Only handle horizontal gestures
    if (axisLock === 'horizontal') {
      setDragX(dx);
    }
  }, [axisLock]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (!start.current) return;

    const dt = performance.now() - start.current.t;
    const dx = e.clientX - start.current.x;
    const velocity = Math.abs(dx) / dt;

    // Trigger navigation if threshold or velocity is met
    if (Math.abs(dx) > THRESHOLD || velocity > VELOCITY_THRESHOLD) {
      if (dx < 0) {
        onNext();
      } else {
        onPrevious();
      }
    }

    // Reset state
    setDragX(0);
    setIsDragging(false);
    setAxisLock('undecided');
    start.current = null;

    // Release pointer capture
    const target = e.currentTarget as HTMLElement;
    target.releasePointerCapture(e.pointerId);
  }, [onNext, onPrevious]);

  const onPointerCancel = useCallback(() => {
    // Reset state on pointer cancel
    setDragX(0);
    setIsDragging(false);
    setAxisLock('undecided');
    start.current = null;
  }, []);

  // Focus management
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      // Focus the close button when lightbox opens
      closeButtonRef.current.focus();
    }
  }, [isOpen]);

  // Handle escape key, body scroll lock, and focus trap
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('keydown', handleFocusTrap);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keydown', handleFocusTrap);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown, handleFocusTrap]);

  // Restore focus to trigger element when closing
  const handleClose = useCallback(() => {
    onClose();
    // Restore focus to the triggering element
    if (triggerRef?.current) {
      setTimeout(() => {
        triggerRef.current?.focus();
      }, 0);
    }
  }, [onClose, triggerRef]);

  return (
    <AnimatePresence>
      {isOpen && currentItem && (
        <motion.div 
          role="dialog"
          aria-modal="true"
          aria-labelledby="lightbox-title"
          aria-describedby="lightbox-description"
          className={styles.lightbox} 
          onClick={handleClose}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={overlayVariants}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* Screen reader only title */}
          <h2 id="lightbox-title" className="sr-only">
            {currentItem.title ? `${currentItem.title} - Artwork` : 'Artwork'}
          </h2>
          
          {/* Screen reader only description */}
          <div id="lightbox-description" className="sr-only">
            {totalItems > 1 
              ? `Image ${currentIndex + 1} of ${totalItems}. Use arrow keys to navigate, Escape to close, or Home/End to jump to first/last image.`
              : 'Use Escape key to close this image view.'
            }
          </div>
          
          <motion.div 
            className={styles.overlay}
            variants={overlayVariants}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
          
          <motion.div 
            ref={contentRef}
            className={styles.content} 
            onClick={(e) => e.stopPropagation()}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
            data-dragging={isDragging}
            data-axis-lock={axisLock}
            variants={contentVariants}
            transition={{ 
              duration: 0.3, 
              ease: "easeOut",
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
            style={{
              transform: isDragging ? `translateX(${-dragX * 0.3}px)` : undefined,
              transition: isDragging ? 'none' : undefined
            }}
          >
            {/* Close Button */}
            <motion.button 
              ref={closeButtonRef}
              className={styles.closeButton}
              onClick={handleClose}
              aria-label="Close lightbox"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </motion.button>

            {/* Navigation Buttons */}
            {totalItems > 1 && (
              <>
                <motion.button 
                  ref={prevButtonRef}
                  className={`${styles.navButton} ${styles.prevButton}`}
                  onClick={onPrevious}
                  aria-label={`Previous image: ${currentIndex > 0 ? filteredItems[currentIndex - 1]?.title || 'Artwork' : filteredItems[filteredItems.length - 1]?.title || 'Artwork'}`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15,18 9,12 15,6"></polyline>
                  </svg>
                </motion.button>
                
                <motion.button 
                  ref={nextButtonRef}
                  className={`${styles.navButton} ${styles.nextButton}`}
                  onClick={onNext}
                  aria-label={`Next image: ${currentIndex < filteredItems.length - 1 ? filteredItems[currentIndex + 1]?.title || 'Artwork' : filteredItems[0]?.title || 'Artwork'}`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9,18 15,12 9,6"></polyline>
                  </svg>
                </motion.button>
              </>
            )}

            {/* Image Container */}
            <div className={styles.imageContainer}>
              <Image
                src={currentItem.imageUrl}
                alt={currentItem.title || 'Artwork'}
                fill
                sizes="90vw"
                className={styles.image}
                priority
                placeholder={currentItem.blurDataURL ? "blur" : "empty"}
                blurDataURL={currentItem.blurDataURL}
              />
            </div>

            {/* Image Info */}
            <motion.div 
              className={styles.info}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3, ease: "easeOut" }}
            >
              <div className={styles.infoContent}>
                <h2 className={styles.title}>{currentItem.title}</h2>
                {currentItem.description && (
                  <p className={styles.description}>{currentItem.description}</p>
                )}
                <div className={styles.metadata}>
                  {currentItem.medium && (
                    <span className={styles.metaItem}>
                      <strong>Medium:</strong> {currentItem.medium}
                    </span>
                  )}
                  {currentItem.dimensions && (
                    <span className={styles.metaItem}>
                      <strong>Dimensions:</strong> {currentItem.dimensions}
                    </span>
                  )}
                  {currentItem.year && (
                    <span className={styles.metaItem}>
                      <strong>Year:</strong> {currentItem.year}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Counter with aria-live */}
            {totalItems > 1 && (
              <motion.div 
                className={styles.counter} 
                aria-live="polite" 
                aria-atomic="true"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.2, ease: "easeOut" }}
              >
                {currentIndex + 1} of {totalItems}
              </motion.div>
            )}

            {/* Swipe Indicator */}
            {totalItems > 1 && (
              <motion.div 
                className={styles.swipeIndicator}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 0.8, y: 0 }}
                transition={{ delay: 0.4, duration: 0.3, ease: "easeOut" }}
              >
                <div className={styles.swipeHint}>
                  <span>←</span> Swipe to navigate <span>→</span>
                </div>
              </motion.div>
            )}

            {/* Swipe Feedback */}
            <AnimatePresence>
              {isDragging && Math.abs(dragX) > 20 && (
                <motion.div 
                  className={styles.swipeFeedback}
                  variants={swipeFeedbackVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <div className={styles.swipeArrow}>
                    {dragX > 0 ? '→' : '←'}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
