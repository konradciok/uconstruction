'use client'

import { useState } from 'react'
import Image from 'next/image'
import { TemplateProduct } from '@/lib/template-adapters'
import clsx from 'clsx'
import styles from './gallery.module.css'

interface ProductGalleryProps {
  product: TemplateProduct
}

export function ProductGallery({ product }: ProductGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  
  const images = product.media || []
  const hasMultipleImages = images.length > 1

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length)
  }

  const previousImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const selectImage = (index: number) => {
    setSelectedImageIndex(index)
  }

  if (images.length === 0) {
    return (
      <div className={styles.placeholder}>
        <span className={styles.placeholderIcon}>🖼️</span>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* Main Image */}
      <div className={styles.mainImageContainer}>
        {images[selectedImageIndex] && (
          <Image
            src={images[selectedImageIndex].url}
            alt={images[selectedImageIndex].altText || product.title}
            fill
            className={styles.mainImage}
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
          />
        )}

        {/* Navigation Arrows */}
        {hasMultipleImages && (
          <div className={styles.navigationContainer}>
            <button
              onClick={previousImage}
              className={styles.navButton}
              aria-label="Previous image"
            >
              <svg className={styles.navIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextImage}
              className={styles.navButton}
              aria-label="Next image"
            >
              <svg className={styles.navIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* Image Counter */}
        {hasMultipleImages && (
          <div className={styles.imageCounter}>
            {selectedImageIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Images */}
      {hasMultipleImages && (
        <div className={styles.thumbnailsContainer}>
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => selectImage(index)}
              className={clsx(styles.thumbnailButton, {
                [styles.thumbnailButtonSelected]: index === selectedImageIndex
              })}
            >
              <Image
                src={image.url}
                alt={image.altText || `${product.title} ${index + 1}`}
                width={80}
                height={80}
                className={styles.thumbnailImage}
              />
            </button>
          ))}
        </div>
      )}

      {/* Image Actions */}
      <div className={styles.actionsContainer}>
        <button className={clsx(styles.actionButton, styles.primaryButton)}>
          View Full Size
        </button>
        <button className={clsx(styles.actionButton, styles.secondaryButton)}>
          Download
        </button>
      </div>
    </div>
  )
}
