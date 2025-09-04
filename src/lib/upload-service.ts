import { ImageProcessor, ProcessedImageResult } from './image-processor';
import { UploadedFile, ProcessedImage, UploadFormData } from '@/types/upload';

export class UploadService {
  private static readonly UPLOAD_ENDPOINT = '/api/upload';
  private static readonly MAX_CONCURRENT_UPLOADS = 3;

  /**
   * Upload and process multiple images
   */
  static async uploadImages(
    files: File[], 
    formData: UploadFormData,
    onProgress?: (fileId: string, progress: number) => void
  ): Promise<ProcessedImage[]> {
    const processedImages: ProcessedImage[] = [];
    const uploadPromises: Promise<ProcessedImage>[] = [];

    // Process files in batches to avoid overwhelming the system
    for (let i = 0; i < files.length; i += this.MAX_CONCURRENT_UPLOADS) {
      const batch = files.slice(i, i + this.MAX_CONCURRENT_UPLOADS);
      const batchPromises = batch.map(async (file, index) => {
        const fileId = ImageProcessor.generateImageId();
        
        // Update progress
        onProgress?.(fileId, 10);
        
        try {
          // Validate file
          const validation = ImageProcessor.validateImageFile(file);
          if (!validation.valid) {
            throw new Error(validation.error);
          }

          onProgress?.(fileId, 30);

          // Process image
          const processedResult = await ImageProcessor.processImage(file);
          
          onProgress?.(fileId, 60);

          // Upload processed images
          const uploadedImage = await this.uploadProcessedImage(
            fileId,
            file.name,
            processedResult,
            formData
          );

          onProgress?.(fileId, 100);
          
          return uploadedImage;
        } catch (error) {
          onProgress?.(fileId, 0);
          throw error;
        }
      });

      // Wait for current batch to complete
      const batchResults = await Promise.all(batchPromises);
      processedImages.push(...batchResults);
    }

    return processedImages;
  }

  /**
   * Upload a single processed image
   */
  private static async uploadProcessedImage(
    imageId: string,
    originalName: string,
    processedResult: ProcessedImageResult,
    formData: UploadFormData
  ): Promise<ProcessedImage> {
    const formDataToSend = new FormData();
    
    // Add metadata
    formDataToSend.append('imageId', imageId);
    formDataToSend.append('originalName', originalName);
    formDataToSend.append('title', formData.title);
    formDataToSend.append('dimensions', formData.dimensions);
    formDataToSend.append('medium', formData.medium);
    if (formData.alt) {
      formDataToSend.append('alt', formData.alt);
    }
    if (formData.tags) {
      formDataToSend.append('tags', JSON.stringify(formData.tags));
    }

    // Add thumbnail files
    formDataToSend.append('thumbnailJpg', processedResult.thumbnail.jpg, `${imageId}-thumb.jpg`);
    if (processedResult.thumbnail.webp) {
      formDataToSend.append('thumbnailWebp', processedResult.thumbnail.webp, `${imageId}-thumb.webp`);
    }
    if (processedResult.thumbnail.avif) {
      formDataToSend.append('thumbnailAvif', processedResult.thumbnail.avif, `${imageId}-thumb.avif`);
    }

    // Add full size files
    formDataToSend.append('fullJpg', processedResult.full.jpg, `${imageId}-full.jpg`);
    if (processedResult.full.webp) {
      formDataToSend.append('fullWebp', processedResult.full.webp, `${imageId}-full.webp`);
    }
    if (processedResult.full.avif) {
      formDataToSend.append('fullAvif', processedResult.full.avif, `${imageId}-full.avif`);
    }

    // Add dimensions
    formDataToSend.append('thumbnailWidth', processedResult.thumbnail.dimensions.width.toString());
    formDataToSend.append('thumbnailHeight', processedResult.thumbnail.dimensions.height.toString());
    formDataToSend.append('fullWidth', processedResult.full.dimensions.width.toString());
    formDataToSend.append('fullHeight', processedResult.full.dimensions.height.toString());

    const response = await fetch(this.UPLOAD_ENDPOINT, {
      method: 'POST',
      body: formDataToSend,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${errorText}`);
    }

    const result = await response.json();
    return result;
  }

  /**
   * Generate portfolio data entry for uploaded image
   */
  static generatePortfolioEntry(processedImage: ProcessedImage): string {
    const entry = `{
  id: "${processedImage.id}",
  title: "${processedImage.title}",
  dimensions: "${processedImage.dimensions}",
  thumbnail: {
    ${processedImage.thumbnail.webp ? `webp: "/img/portfolio2/thumbs/${processedImage.id}.webp",` : ''}
    ${processedImage.thumbnail.avif ? `avif: "/img/portfolio2/thumbs/${processedImage.id}.avif",` : ''}
    jpg: "/img/portfolio2/thumbs/${processedImage.id}.jpg",
    width: ${processedImage.thumbnail.width},
    height: ${processedImage.thumbnail.height}
  },
  full: {
    ${processedImage.full.webp ? `webp: "/img/portfolio2/full/${processedImage.id}.webp",` : ''}
    ${processedImage.full.avif ? `avif: "/img/portfolio2/full/${processedImage.id}.avif",` : ''}
    jpg: "/img/portfolio2/full/${processedImage.id}.jpg",
    width: ${processedImage.full.width},
    height: ${processedImage.full.height}
  }${processedImage.alt ? `,
  alt: "${processedImage.alt}"` : ''}
}`;

    return entry;
  }

  /**
   * Download portfolio data as file
   */
  static downloadPortfolioData(processedImages: ProcessedImage[]): void {
    const entries = processedImages.map(img => this.generatePortfolioEntry(img));
    const content = `export const UPLOADED_ARTWORKS = [
${entries.join(',\n')}
];`;

    const blob = new Blob([content], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'uploaded-artworks.ts';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Get file preview URL
   */
  static getFilePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Format file size
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
