'use client';

import React from 'react';
import Image from 'next/image';
import { GalleryItemProps } from '@/types/portfolio2';
import styles from './GalleryItem.module.css';

export default function GalleryItem({ artwork, index, onOpen }: GalleryItemProps) {
  const handleClick = () => {
    onOpen(index);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpen(index);
    }
  };

  const altText = artwork.alt || artwork.title;

  return (
    <button
      className={styles.galleryItem}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-label={`Powiększ: ${artwork.title}`}
      type="button"
    >
      <div className={styles.imageContainer}>
        <Image
          src={artwork.thumbnail.jpg}
          alt={altText}
          width={artwork.thumbnail.width}
          height={artwork.thumbnail.height}
          className={styles.image}
          sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
          {...(index < 4 ? { priority: true } : { loading: 'lazy' })}
        />
      </div>
    </button>
  );
}
