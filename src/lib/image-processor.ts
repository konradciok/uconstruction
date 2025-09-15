export interface ImageDimensions {
  width: number;
  height: number;
}

export interface ProcessedImageResult {
  thumbnail: {
    jpg: Blob;
    webp?: Blob;
    avif?: Blob;
    dimensions: ImageDimensions;
  };
  full: {
    jpg: Blob;
    webp?: Blob;
    avif?: Blob;
    dimensions: ImageDimensions;
  };
}

export class ImageProcessor {
  private static readonly THUMBNAIL_SIZE = { width: 800, height: 1000 };
  private static readonly FULL_SIZE = { width: 1600, height: 2000 };
  private static readonly QUALITY = 0.9;

  /**
   * Process an image file to create thumbnails and full-size versions
   */
  static async processImage(file: File): Promise<ProcessedImageResult> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      const img = new Image();
      img.onload = async () => {
        try {
          const result = await this.processLoadedImage(img);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Process a loaded image to create different sizes and formats
   */
  private static async processLoadedImage(
    img: HTMLImageElement
  ): Promise<ProcessedImageResult> {
    const result: ProcessedImageResult = {
      thumbnail: {
        jpg: new Blob(),
        dimensions: { width: 0, height: 0 },
      },
      full: {
        jpg: new Blob(),
        dimensions: { width: 0, height: 0 },
      },
    };

    // Process thumbnail
    const thumbnailCanvas = document.createElement('canvas');
    const thumbnailCtx = thumbnailCanvas.getContext('2d')!;
    thumbnailCanvas.width = this.THUMBNAIL_SIZE.width;
    thumbnailCanvas.height = this.THUMBNAIL_SIZE.height;

    // Draw thumbnail with 4:5 aspect ratio
    this.drawImageWithAspectRatio(img, thumbnailCtx, this.THUMBNAIL_SIZE);

    // Generate thumbnail formats
    result.thumbnail.jpg = await this.canvasToBlob(
      thumbnailCanvas,
      'image/jpeg',
      this.QUALITY
    );
    result.thumbnail.dimensions = { ...this.THUMBNAIL_SIZE };

    // Try to generate WebP and AVIF for thumbnail
    try {
      result.thumbnail.webp = await this.canvasToBlob(
        thumbnailCanvas,
        'image/webp',
        this.QUALITY
      );
    } catch {
      console.warn('WebP not supported for thumbnail');
    }

    try {
      result.thumbnail.avif = await this.canvasToBlob(
        thumbnailCanvas,
        'image/avif',
        this.QUALITY
      );
    } catch {
      console.warn('AVIF not supported for thumbnail');
    }

    // Process full size
    const fullCanvas = document.createElement('canvas');
    const fullCtx = fullCanvas.getContext('2d')!;
    fullCanvas.width = this.FULL_SIZE.width;
    fullCanvas.height = this.FULL_SIZE.height;

    // Draw full size with 4:5 aspect ratio
    this.drawImageWithAspectRatio(img, fullCtx, this.FULL_SIZE);

    // Generate full size formats
    result.full.jpg = await this.canvasToBlob(
      fullCanvas,
      'image/jpeg',
      this.QUALITY
    );
    result.full.dimensions = { ...this.FULL_SIZE };

    // Try to generate WebP and AVIF for full size
    try {
      result.full.webp = await this.canvasToBlob(
        fullCanvas,
        'image/webp',
        this.QUALITY
      );
    } catch {
      console.warn('WebP not supported for full size');
    }

    try {
      result.full.avif = await this.canvasToBlob(
        fullCanvas,
        'image/avif',
        this.QUALITY
      );
    } catch {
      console.warn('AVIF not supported for full size');
    }

    return result;
  }

  /**
   * Draw image maintaining 4:5 aspect ratio with white background
   */
  private static drawImageWithAspectRatio(
    img: HTMLImageElement,
    ctx: CanvasRenderingContext2D,
    targetSize: ImageDimensions
  ): void {
    const { width, height } = targetSize;

    // Fill with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Calculate scaling to fit 4:5 aspect ratio
    const imgAspect = img.width / img.height;
    const targetAspect = width / height;

    let drawWidth, drawHeight, offsetX, offsetY;

    if (imgAspect > targetAspect) {
      // Image is wider than target aspect ratio
      drawHeight = height;
      drawWidth = height * imgAspect;
      offsetX = (width - drawWidth) / 2;
      offsetY = 0;
    } else {
      // Image is taller than target aspect ratio
      drawWidth = width;
      drawHeight = width / imgAspect;
      offsetX = 0;
      offsetY = (height - drawHeight) / 2;
    }

    // Draw the image
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  }

  /**
   * Convert canvas to blob
   */
  private static canvasToBlob(
    canvas: HTMLCanvasElement,
    type: string,
    quality: number
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error(`Failed to create ${type} blob`));
          }
        },
        type,
        quality
      );
    });
  }

  /**
   * Generate unique ID for image files
   */
  static generateImageId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `a-${timestamp}-${random}`;
  }

  /**
   * Validate image file
   */
  static validateImageFile(file: File): { valid: boolean; error?: string } {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Please upload JPEG, PNG, or WebP images.',
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File too large. Please upload images smaller than 10MB.',
      };
    }

    return { valid: true };
  }
}
