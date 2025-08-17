# Image UX Improvements

This document outlines the image UX improvements implemented to prevent layout shift and optimize lightbox performance.

## Overview

The gallery has been enhanced with several image UX improvements:

1. **Aspect Ratio Containers** - Prevent layout shift during image loading
2. **Blur Placeholders** - Smooth loading experience with blur placeholders
3. **Lightbox Preloading** - Faster next/previous navigation
4. **Responsive Image Sizes** - Optimized for different screen sizes
5. **Modern Image Formats** - Support for WebP/AVIF via Next.js

## Key Improvements

### 1. Aspect Ratio Containers

**Problem**: Images loading at different times caused layout shift (CLS)

**Solution**: Use CSS `aspect-ratio` property instead of padding-bottom

```css
.imageContainer {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3; /* 4:3 aspect ratio */
  overflow: hidden;
  border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
}

/* Responsive aspect ratios */
@media (max-width: 768px) {
  .imageContainer {
    aspect-ratio: 3 / 2; /* 3:2 for mobile */
  }
}

@media (max-width: 480px) {
  .imageContainer {
    aspect-ratio: 1 / 1; /* 1:1 for small mobile */
  }
}
```

**Benefits**:
- No layout shift during image loading
- Consistent grid layout
- Better Core Web Vitals scores
- Responsive design maintained

### 2. Blur Placeholders

**Problem**: Empty space while images load

**Solution**: Use Next.js blur placeholders with pre-computed blur data URLs

```tsx
<Image
  src={item.imageUrl}
  alt={item.title || 'Artwork'}
  fill
  sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
  placeholder={item.blurDataURL ? "blur" : "empty"}
  blurDataURL={item.blurDataURL}
  {...(isPriority ? { priority: true } : { loading: 'lazy' })}
/>
```

**Blur Data URL Structure**:
```tsx
const BLUR_DATA_URLS = {
  default: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...',
  painting: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...',
  photo: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...',
  // ... category-specific placeholders
};
```

**Benefits**:
- Smooth loading experience
- No empty spaces
- Category-specific placeholders
- Better perceived performance

### 3. Lightbox Image Preloading

**Problem**: Slow navigation between images in lightbox

**Solution**: Preload neighboring images when lightbox opens

```tsx
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
```

**Benefits**:
- Instant next/previous navigation
- Better user experience
- Reduced perceived loading time
- Smooth lightbox interactions

### 4. Responsive Image Sizes

**Problem**: Images not optimized for different screen sizes

**Solution**: Dynamic sizes based on grid columns and screen size

```tsx
sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
```

**Size Breakdown**:
- Mobile (< 480px): 100vw (full width)
- Tablet (< 768px): 50vw (half width)
- Desktop (< 1200px): 33vw (third width)
- Large screens (≥ 1200px): 25vw (quarter width)

**Benefits**:
- Optimized image delivery
- Reduced bandwidth usage
- Faster loading times
- Better performance on mobile

### 5. Modern Image Formats

**Problem**: Large image files slowing down loading

**Solution**: Let Next.js serve modern formats (WebP/AVIF)

```tsx
// Next.js automatically serves WebP/AVIF to supported browsers
<Image
  src={item.imageUrl}
  alt={item.title}
  fill
  sizes="90vw" // Lightbox uses larger sizes
  priority
  placeholder={currentItem.blurDataURL ? "blur" : "empty"}
  blurDataURL={currentItem.blurDataURL}
/>
```

**Benefits**:
- Smaller file sizes
- Faster loading
- Better compression
- Automatic format selection

## Implementation Details

### GalleryItem Component Updates

```tsx
export default React.memo(function GalleryItem({ 
  item, 
  onClick, 
  index = 0,
  onIntersection 
}: GalleryItemProps) {
  // Determine if this image should be prioritized
  const isPriority = index < 6;

  return (
    <Card className={styles.galleryItem}>
      <div className={styles.imageContainer}>
        <Image
          src={item.imageUrl}
          alt={item.title || 'Artwork'}
          fill
          sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          placeholder={item.blurDataURL ? "blur" : "empty"}
          blurDataURL={item.blurDataURL}
          {...(isPriority ? { priority: true } : { loading: 'lazy' })}
        />
      </div>
    </Card>
  );
});
```

### Lightbox Component Updates

```tsx
interface LightboxProps {
  isOpen: boolean;
  currentItem: GalleryItem | null;
  currentIndex: number;
  totalItems: number;
  filteredItems: GalleryItem[]; // Added for preloading
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}
```

### Type Updates

```tsx
export interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  blurDataURL?: string; // Added for blur placeholders
  category: string;
  dimensions?: string;
  medium?: string;
  year?: number;
}
```

## Performance Benefits

### Core Web Vitals

- **CLS (Cumulative Layout Shift)**: Reduced to near-zero
- **LCP (Largest Contentful Paint)**: Improved with priority loading
- **FID (First Input Delay)**: Better with optimized images

### User Experience

- **No Layout Shift**: Smooth loading experience
- **Faster Navigation**: Preloaded lightbox images
- **Better Perceived Performance**: Blur placeholders
- **Responsive Design**: Optimized for all screen sizes

### Technical Benefits

- **Reduced Bandwidth**: Modern image formats
- **Better Caching**: Optimized image sizes
- **Accessibility**: Proper alt text and loading states
- **SEO**: Better Core Web Vitals scores

## Browser Support

- **Aspect Ratio**: Chrome 88+, Firefox 89+, Safari 15+
- **Blur Placeholders**: All modern browsers via Next.js
- **WebP/AVIF**: Automatic fallback to JPEG/PNG
- **Intersection Observer**: Chrome 51+, Firefox 55+, Safari 12.1+

## Best Practices

### 1. Image Optimization

- Use WebP format when possible
- Implement proper `sizes` attribute
- Provide blur placeholders for all images
- Use appropriate aspect ratios

### 2. Performance Monitoring

- Monitor Core Web Vitals
- Track image loading times
- Measure lightbox navigation speed
- Test on various devices and connections

### 3. Accessibility

- Provide meaningful alt text
- Support keyboard navigation
- Maintain focus management
- Test with screen readers

### 4. Progressive Enhancement

- Graceful fallback for older browsers
- No JavaScript fallback for images
- Responsive design at all breakpoints
- Performance optimization for all users

## Future Enhancements

### 1. Advanced Preloading

- Implement predictive preloading based on user behavior
- Add preloading for filtered results
- Optimize preloading based on connection speed

### 2. Image Optimization

- Implement server-side image optimization
- Add support for multiple image formats
- Implement lazy loading with intersection observer

### 3. Performance Monitoring

- Add real user monitoring (RUM)
- Track image loading performance
- Monitor Core Web Vitals in production

### 4. Accessibility Improvements

- Add ARIA labels for better screen reader support
- Implement focus management for lightbox
- Add keyboard shortcuts for navigation
