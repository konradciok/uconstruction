# Gallery Performance Optimizations

This document outlines the performance optimizations implemented for the gallery component to handle large datasets efficiently.

## Overview

The gallery has been optimized to handle thousands of items without performance degradation through several key techniques:

1. **Virtualization** - Only render visible items
2. **Memoization** - Prevent unnecessary re-renders
3. **Intersection-based preloading** - Smart image loading
4. **Performance monitoring** - Track and optimize rendering

## Key Components

### 1. VirtualizedGrid Component

Located in `src/components/Gallery/VirtualizedGrid.tsx`

**Features:**

- Uses `@tanstack/react-virtual` for efficient rendering
- Only renders items currently visible in the viewport
- Supports responsive column layouts
- Configurable overscan for smooth scrolling

**Usage:**

```tsx
<VirtualizedGrid
  items={filteredItems}
  onItemClick={handleItemClick}
  columns={3}
  itemHeight={400}
  containerHeight="80vh"
  enablePreloading={true}
/>
```

### 2. Optimized GalleryItem Component

Located in `src/components/Gallery/GalleryItem.tsx`

**Optimizations:**

- `React.memo` to prevent unnecessary re-renders
- `useCallback` for stable event handlers
- Intersection Observer integration for preloading
- Priority loading for first 6 images
- Lazy loading for off-screen images

**Key Features:**

```tsx
export default React.memo(function GalleryItem({
  item,
  onClick,
  index = 0,
  onIntersection,
}: GalleryItemProps) {
  // Memoized handlers
  const handleClick = useCallback(() => {
    if (onClick) onClick(item);
  }, [onClick, item]);

  // Priority loading for first 6 images
  <Image
    priority={index < 6}
    loading="lazy"
    // ... other props
  />;
});
```

### 3. Intersection Preloader Hook

Located in `src/components/Gallery/useIntersectionPreloader.ts`

**Purpose:**

- Preload images that are about to enter the viewport
- Reduces perceived loading time
- Configurable preload distance and thresholds

**Features:**

- Tracks which images have been preloaded
- Uses Intersection Observer API
- Configurable root margin and threshold
- Preloads nearby images based on current viewport

### 4. Performance Monitor Hook

Located in `src/components/Gallery/usePerformanceMonitor.ts`

**Metrics Tracked:**

- Render time for operations
- FPS (Frames Per Second)
- Memory usage (if available)
- Item count being rendered

**Usage:**

```tsx
const { startRenderMeasure, endRenderMeasure } = usePerformanceMonitor(
  items.length,
  {
    enabled: process.env.NODE_ENV === 'development',
    onMetricsUpdate: (metrics) => {
      console.log('Performance metrics:', metrics);
    },
  }
);
```

## Performance Features

### Automatic Virtualization

The gallery automatically switches to virtualized rendering when:

- `enableVirtualization` prop is true
- Item count exceeds `virtualizationThreshold` (default: 50)

### Responsive Column Layout

Columns automatically adjust based on screen size:

- Mobile (< 480px): 1 column
- Tablet (< 768px): 2 columns
- Desktop (< 1200px): 3 columns
- Large screens (≥ 1200px): 4 columns

### Smart Image Loading

1. **Priority Loading**: First 6 images load with `priority={true}`
2. **Lazy Loading**: All other images use `loading="lazy"`
3. **Preloading**: Images near viewport are preloaded via Intersection Observer
4. **Error Handling**: Graceful fallback for failed image loads

### CSS Optimizations

Located in `src/components/Gallery/Gallery.module.css`

**Performance CSS Properties:**

```css
.grid,
.virtualizedGrid {
  contain: layout style paint;
  will-change: transform;
}

.grid > *,
.virtualizedGrid > div > div > * {
  contain: layout style paint;
  will-change: transform;
}
```

## Usage Examples

### Basic Gallery with Virtualization

```tsx
import Gallery from '@/components/Gallery/Gallery';

function PortfolioPage() {
  const galleryItems = [
    /* your items */
  ];

  return (
    <Gallery
      items={galleryItems}
      title="My Portfolio"
      description="A collection of my work"
      enableVirtualization={true}
      virtualizationThreshold={50}
    />
  );
}
```

### Custom Virtualized Grid

```tsx
import VirtualizedGrid from '@/components/Gallery/VirtualizedGrid';

function CustomGallery() {
  return (
    <VirtualizedGrid
      items={items}
      onItemClick={handleClick}
      columns={4}
      itemHeight={350}
      containerHeight="70vh"
      enablePreloading={true}
    />
  );
}
```

### Performance Monitoring

```tsx
import { usePerformanceMonitor } from '@/components/Gallery/usePerformanceMonitor';

function GalleryWithMonitoring() {
  const { startRenderMeasure, endRenderMeasure } = usePerformanceMonitor(
    items.length,
    {
      enabled: true,
      onMetricsUpdate: (metrics) => {
        if (metrics.fps < 30) {
          console.warn('Low FPS detected:', metrics.fps);
        }
      },
    }
  );

  // Use in your render cycle
  useEffect(() => {
    startRenderMeasure();
    // ... render logic
    endRenderMeasure();
  }, [items]);
}
```

## Performance Tips

### 1. Image Optimization

- Use WebP format when possible
- Implement proper `sizes` attribute for responsive images
- Consider using Next.js Image component's built-in optimizations

### 2. Data Management

- Implement pagination for very large datasets
- Use efficient data structures
- Consider implementing search/filter at the API level

### 3. Bundle Optimization

- The virtualization library is tree-shakeable
- Performance monitoring is only included in development builds
- Consider code splitting for large galleries

### 4. Memory Management

- Monitor memory usage in development
- Implement cleanup for large datasets
- Use `useCallback` and `useMemo` judiciously

## Troubleshooting

### Low FPS Issues

1. Check if virtualization is enabled for large datasets
2. Verify image sizes and formats
3. Monitor memory usage
4. Consider reducing overscan value

### Memory Leaks

1. Ensure proper cleanup in useEffect hooks
2. Check for circular references in data
3. Monitor intersection observer cleanup
4. Verify virtualized items are properly unmounted

### Image Loading Issues

1. Check network tab for failed requests
2. Verify image URLs are correct
3. Test preloading configuration
4. Check browser support for Intersection Observer

## Browser Support

- **Virtualization**: Modern browsers with ES6+ support
- **Intersection Observer**: Chrome 51+, Firefox 55+, Safari 12.1+
- **CSS Containment**: Chrome 52+, Firefox 69+, Safari 16.4+

For older browsers, the gallery falls back to regular grid rendering without virtualization.
