// Utility functions for image optimization

/**
 * Generate a simple blur data URL for placeholder images
 * This creates a tiny base64 encoded image that can be used as a blur placeholder
 */
export function generateBlurDataURL(width: number = 8, height: number = 6): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  // Create a simple gradient pattern
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#f0f0f0');
  gradient.addColorStop(0.5, '#e0e0e0');
  gradient.addColorStop(1, '#f0f0f0');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL('image/jpeg', 0.1);
}

/**
 * Preload an image and return a promise
 */
export function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Preload multiple images
 */
export function preloadImages(urls: string[]): Promise<HTMLImageElement[]> {
  return Promise.all(urls.map(url => preloadImage(url)));
}

/**
 * Get responsive image sizes based on container width
 */
export function getResponsiveSizes(containerWidth: number, columns: number): string {
  const itemWidth = containerWidth / columns;
  
  if (itemWidth <= 480) {
    return '100vw';
  } else if (itemWidth <= 768) {
    return '50vw';
  } else if (itemWidth <= 1200) {
    return '33vw';
  } else {
    return '25vw';
  }
}

/**
 * Calculate aspect ratio from dimensions string
 */
export function parseAspectRatio(dimensions?: string): number {
  if (!dimensions) return 4 / 3; // Default aspect ratio
  
  // Parse dimensions like "24" x 36"" or "1920 x 1080"
  const matches = dimensions.match(/(\d+)\s*[x×]\s*(\d+)/i);
  if (matches) {
    const width = parseInt(matches[1]);
    const height = parseInt(matches[2]);
    return width / height;
  }
  
  return 4 / 3; // Default fallback
}

/**
 * Generate optimized image URL with format and quality parameters
 */
export function getOptimizedImageUrl(
  originalUrl: string, 
  width: number, 
  height: number,
  format: 'webp' | 'avif' | 'jpeg' = 'webp',
  quality: number = 80
): string {
  // This is a placeholder - in a real implementation, you'd use a CDN or image service
  // like Cloudinary, ImageKit, or Next.js Image Optimization
  const params = new URLSearchParams({
    w: width.toString(),
    h: height.toString(),
    f: format,
    q: quality.toString(),
  });
  
  return `${originalUrl}?${params.toString()}`;
}
