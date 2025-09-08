'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { createPortal } from 'react-dom';
import { LightboxModalProps } from '@/types/portfolio2';
import styles from './LightboxModal.module.css';

export default function LightboxModal({
  artworks,
  index,
  isOpen,
  onClose,
  onNavigate,
}: LightboxModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const currentArtwork = artworks[index];
  const [touchStart, setTouchStart] = React.useState<number | null>(null);
  const [touchEnd, setTouchEnd] = React.useState<number | null>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          onNavigate(index === 0 ? artworks.length - 1 : index - 1);
          break;
        case 'ArrowRight':
          event.preventDefault();
          onNavigate(index === artworks.length - 1 ? 0 : index + 1);
          break;
      }
    },
    [isOpen, index, artworks.length, onClose, onNavigate]
  );

  const handleBackdropClick = useCallback(
    (event: React.MouseEvent) => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  const handlePrevious = useCallback(() => {
    onNavigate(index === 0 ? artworks.length - 1 : index - 1);
  }, [index, artworks.length, onNavigate]);

  const handleNext = useCallback(() => {
    onNavigate(index === artworks.length - 1 ? 0 : index + 1);
  }, [index, artworks.length, onNavigate]);

  // Touch handlers for mobile swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext();
    }
    if (isRightSwipe) {
      handlePrevious();
    }
  };

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements && focusableElements.length > 0) {
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

      firstElement.focus();

      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      };

      document.addEventListener('keydown', handleTabKey);
      return () => document.removeEventListener('keydown', handleTabKey);
    }
  }, [isOpen]);

  // Keyboard event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !currentArtwork) return null;

  // Preload adjacent images
  const prevIndex = index === 0 ? artworks.length - 1 : index - 1;
  const nextIndex = index === artworks.length - 1 ? 0 : index + 1;
  const prevArtwork = artworks[prevIndex];
  const nextArtwork = artworks[nextIndex];

  return createPortal(
    <div
      className={styles.overlay}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lightbox-title"
      ref={modalRef}
    >
      {/* Close button */}
      <button
        className={styles.closeButton}
        onClick={onClose}
        aria-label="Zamknij galerię"
        type="button"
      >
        ×
      </button>

      {/* Navigation buttons */}
      <button
        className={`${styles.navButton} ${styles.prevButton}`}
        onClick={handlePrevious}
        aria-label={`Poprzedni obraz: ${prevArtwork.title}`}
        type="button"
      >
        ‹
      </button>

      <button
        className={`${styles.navButton} ${styles.nextButton}`}
        onClick={handleNext}
        aria-label={`Następny obraz: ${nextArtwork.title}`}
        type="button"
      >
        ›
      </button>

      {/* Main image container */}
      <div
        className={styles.imageContainer}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <Image
          ref={imageRef}
          src={currentArtwork.full.jpg}
          alt={currentArtwork.alt || currentArtwork.title}
          width={currentArtwork.full.width}
          height={currentArtwork.full.height}
          className={styles.image}
          priority
          sizes="90vw"
        />

        {/* Image info overlay */}
        <div className={styles.imageInfo}>
          <h2 id="lightbox-title" className={styles.title}>
            {currentArtwork.title}
          </h2>
          <p className={styles.dimensions}>{currentArtwork.dimensions}</p>
        </div>
      </div>

      {/* Image counter */}
      <div className={styles.counter}>
        {index + 1} / {artworks.length}
      </div>

      {/* Preload adjacent images */}
      <div style={{ display: 'none' }}>
        {prevArtwork && (
          <Image
            src={prevArtwork.full.jpg}
            alt=""
            width={prevArtwork.full.width}
            height={prevArtwork.full.height}
          />
        )}
        {nextArtwork && (
          <Image
            src={nextArtwork.full.jpg}
            alt=""
            width={nextArtwork.full.width}
            height={nextArtwork.full.height}
          />
        )}
      </div>
    </div>,
    document.body
  );
}
