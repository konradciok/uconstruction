'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { TemplateProduct } from '@/lib/template-adapters'
import clsx from 'clsx'
import styles from './gallery.module.css'

interface ProductGalleryProps {
  product: TemplateProduct
}

export function ProductGallery({ product }: ProductGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const [initialTouchDistance, setInitialTouchDistance] = useState(0)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const lastFocusedElementRef = useRef<HTMLElement | null>(null)
  
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
    
    // Track thumbnail click for analytics
    if (typeof window !== 'undefined' && 'gtag' in window) {
      const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag
      if (typeof gtag === 'function') {
        gtag('event', 'thumbnail_click', {
          event_category: 'product_gallery',
          event_label: `thumbnail_${index + 1}`,
          value: 1
        })
      }
    }
  }

  // Hover zoom handlers
  const handleMouseEnter = () => {
    setIsZoomed(true)
    
    // Track hover zoom for analytics
    if (typeof window !== 'undefined' && 'gtag' in window) {
      const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag
      if (typeof gtag === 'function') {
        gtag('event', 'image_hover_zoom', {
          event_category: 'product_gallery',
          event_label: `image_${selectedImageIndex + 1}`,
          value: 1
        })
      }
    }
  }

  const handleMouseLeave = () => {
    setIsZoomed(false)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setMousePosition({ x, y })
  }

  // Lightbox handlers
  const openLightbox = () => {
    // store active element to restore focus later
    if (typeof document !== 'undefined') {
      lastFocusedElementRef.current = document.activeElement as HTMLElement
    }
    setIsLightboxOpen(true)
    // Track lightbox open event for analytics
    if (typeof window !== 'undefined' && 'gtag' in window) {
      const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag
      if (typeof gtag === 'function') {
        gtag('event', 'image_zoom_open', {
          event_category: 'product_gallery',
          event_label: `image_${selectedImageIndex + 1}`,
          value: 1
        })
      }
    }
  }

  const closeLightbox = () => {
    setIsLightboxOpen(false)
    // restore focus back to the trigger element for a11y
    if (lastFocusedElementRef.current) {
      lastFocusedElementRef.current.focus()
      lastFocusedElementRef.current = null
    }
  }

  // Touch gesture handlers
  const getTouchDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return 0
    const touch1 = touches[0]
    const touch2 = touches[1]
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    )
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      // Single touch for swipe
      setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY })
    } else if (e.touches.length === 2) {
      // Two finger pinch
      const distance = getTouchDistance(e.touches)
      setInitialTouchDistance(distance)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Handle pinch zoom
      const distance = getTouchDistance(e.touches)
      
      // If significant pinch detected, open lightbox
      if (initialTouchDistance > 0 && distance > initialTouchDistance * 1.5) {
        openLightbox()
        setInitialTouchDistance(0) // Reset to prevent multiple triggers
      }
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || !hasMultipleImages) return

    const touchEnd = e.changedTouches[0]
    const deltaX = touchEnd.clientX - touchStart.x
    const deltaY = touchEnd.clientY - touchStart.y

    // Check if it's a horizontal swipe (not vertical scroll)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        previousImage()
      } else {
        nextImage()
      }
      
      // Track swipe gesture for analytics
      if (typeof window !== 'undefined' && 'gtag' in window) {
        const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag
        if (typeof gtag === 'function') {
          gtag('event', 'gallery_swipe', {
            event_category: 'product_gallery',
            event_label: deltaX > 0 ? 'swipe_right' : 'swipe_left',
            value: 1
          })
        }
      }
    }

    // Reset touch state
    setTouchStart(null)
    setInitialTouchDistance(0)
  }

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden'
      // Move focus to close button when opening
      // Use rAF to wait for element to mount
      requestAnimationFrame(() => {
        closeButtonRef.current?.focus()
      })
      return () => {
        document.body.style.overflow = 'unset'
      }
    }
  }, [isLightboxOpen])

  if (images.length === 0) {
    // Show featured image fallback from product when media array is empty
    return (
      <div className={styles.container}>
        <div className={styles.mainImageContainer}>
          <Image
            src={product.featuredImage.url}
            alt={product.featuredImage.altText || product.title}
            fill
            className={styles.mainImage}
            sizes="(min-width:1536px) 60vw, (min-width:1280px) 60vw, (min-width:768px) 50vw, 100vw"
            priority
          />
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* Main Image */}
      <div 
        className={clsx(styles.mainImageContainer, {
          [styles.mainImageContainerZoomed]: isZoomed
        })}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onClick={openLightbox}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="button"
        tabIndex={0}
        aria-label="Click to view full size image"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            openLightbox()
          }
        }}
      >
        {images[selectedImageIndex] && (
          <Image
            src={images[selectedImageIndex].url}
            alt={images[selectedImageIndex].altText || product.title}
            fill
            className={clsx(styles.mainImage, {
              [styles.mainImageZoomed]: isZoomed
            })}
            style={isZoomed ? {
              transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`
            } : undefined}
            sizes="(min-width:1536px) 60vw, (min-width:1280px) 60vw, (min-width:768px) 50vw, 100vw"
            priority
          />
        )}

        {/* Zoom indicator */}
        {!isZoomed && (
          <div className={styles.zoomIndicator}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
              <path d="11 8v6M8 11h6" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
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
                width={120}
                height={120}
                className={styles.thumbnailImage}
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div 
          className={styles.lightboxOverlay}
          onClick={closeLightbox}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              closeLightbox()
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Full size image viewer"
          tabIndex={-1}
        >
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <button 
              className={styles.lightboxClose}
              onClick={closeLightbox}
              aria-label="Close full size image"
              ref={closeButtonRef}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
            
            {images[selectedImageIndex] && (
              <Image
                src={images[selectedImageIndex].url}
                alt={images[selectedImageIndex].altText || product.title}
                fill
                className={styles.lightboxImage}
                sizes="100vw"
              />
            )}

            {/* Lightbox Navigation */}
            {hasMultipleImages && (
              <>
                <button
                  className={`${styles.lightboxNav} ${styles.lightboxNavPrev}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    previousImage()
                  }}
                  aria-label="Previous image"
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" stroke="currentColor"/>
                  </svg>
                </button>
                <button
                  className={`${styles.lightboxNav} ${styles.lightboxNavNext}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    nextImage()
                  }}
                  aria-label="Next image"
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" stroke="currentColor"/>
                  </svg>
                </button>

                <div className={styles.lightboxCounter}>
                  {selectedImageIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
