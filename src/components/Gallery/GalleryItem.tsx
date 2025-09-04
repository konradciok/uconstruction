'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { GalleryItem as GalleryItemType } from '@/types/gallery';
import Card from '@/components/ui/Card';
import styles from './GalleryItem.module.css';
import { deriveTitleFromUrl } from '@/lib/image-utils';

interface GalleryItemProps {
  item: GalleryItemType;
  onClick?: (item: GalleryItemType, element?: HTMLElement) => void;
  index?: number;
  onIntersection?: (element: HTMLElement | null, index: number) => void;
}

export default React.memo(function GalleryItem({ 
  item, 
  onClick, 
  index = 0,
  onIntersection 
}: GalleryItemProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const derivedTitle = useCallback(() => item.title || deriveTitleFromUrl(item.imageUrl), [item.title, item.imageUrl]);

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick(item, containerRef.current || undefined);
    }
  }, [onClick, item]);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  // Set up intersection observer for preloading
  useEffect(() => {
    if (onIntersection && containerRef.current) {
      onIntersection(containerRef.current, index);
    }
  }, [onIntersection, index]);

  // Determine if this image should be prioritized
  const isPriority = index < 6;

  // Animation variants
  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      transition={{
        duration: 0.4,
        ease: "easeOut",
        delay: index * 0.1 // Stagger animation
      }}
      whileHover={{ 
        y: -4,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      whileTap={{ 
        scale: 0.98,
        transition: { duration: 0.1, ease: "easeOut" }
      }}
    >
      <Card 
        ref={containerRef}
        className={styles.galleryItem} 
        onClick={handleClick}
        data-index={index}
      >
        <div className={styles.imageContainer}>
          <div className={styles.topTitle}>{derivedTitle()}</div>
          {!imageError ? (
            <>
              <Image
                src={item.imageUrl}
                alt={derivedTitle()}
                fill
                sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                className={`${styles.image} ${imageLoaded ? styles.loaded : ''}`}
                onLoad={handleImageLoad}
                onError={handleImageError}
                placeholder={item.blurDataURL ? "blur" : "empty"}
                blurDataURL={item.blurDataURL}
                {...(isPriority ? { priority: true } : { loading: 'lazy' })}
              />
              {!imageLoaded && !item.blurDataURL && (
                <div className={styles.imagePlaceholder}>
                  <div className={styles.placeholderSpinner}></div>
                </div>
              )}
            </>
          ) : (
            <div className={styles.imageError}>
              <div className={styles.errorIcon}>📷</div>
              <p>Image not available</p>
            </div>
          )}

        </div>
        
        <div className={styles.itemInfo}>
          <div className={styles.author}>Anna Ciok</div>
        </div>
      </Card>
    </motion.div>
  );
});
