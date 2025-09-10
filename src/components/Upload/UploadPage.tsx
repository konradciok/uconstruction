'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { UploadedFile, ProcessedImage, UploadFormData } from '@/types/upload';
import { UploadService } from '@/lib/upload-service';
import { uploadLogger } from '@/lib/logger';
import { parsePaintingMetaFromFilename } from '@/lib/image-utils';
import FileUpload from './FileUpload';
import FileList from './FileList';
import UploadForm from './UploadForm';
import styles from './UploadPage.module.css';

/**
 * Save processed images as products in the database
 */
async function saveProcessedImagesAsProducts(processedImages: ProcessedImage[]): Promise<void> {
  try {
    // Create products for each processed image
    const productPromises = processedImages.map(async (image) => {
      const productData = {
        title: image.title,
        handle: image.id, // Use image ID as handle
        bodyHtml: `<p>${image.medium || 'Digital Art'} - ${image.dimensions}</p>`,
        vendor: 'Artist',
        productType: image.medium || 'Digital Art',
        status: 'ACTIVE' as const,
        publishedAt: new Date().toISOString(),
        tags: image.tags || [],
        alt: image.alt || image.title,
        // Note: Media will be handled by the upload API
      };

      // Call the products API to create the product
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create product for ${image.title}`);
      }

      return response.json();
    });

    await Promise.all(productPromises);
    uploadLogger.info(`Successfully created ${processedImages.length} products`);
  } catch (error) {
    uploadLogger.error('Error saving processed images as products', error);
    throw error;
  }
}

export default function UploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [autoAddToPortfolio, setAutoAddToPortfolio] = useState(true);

  const handleFilesSelected = useCallback((files: UploadedFile[]) => {
    setUploadedFiles((prev) => [...prev, ...files]);
    setError(null);
  }, []);

  const handleRemoveFile = useCallback((fileId: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
  }, []);

  const handleUpdateProgress = useCallback(
    (fileId: string, progress: number) => {
      setUploadedFiles((prev) =>
        prev.map((file) =>
          file.id === fileId
            ? {
                ...file,
                progress,
                status: progress === 100 ? 'completed' : ('uploading' as const),
              }
            : file
        )
      );
    },
    []
  );

  const handleFormSubmit = useCallback(
    async (formData: UploadFormData) => {
      if (uploadedFiles.length === 0) {
        setError('Please select at least one image to upload.');
        return;
      }

      setIsUploading(true);
      setError(null);

      try {
        // Extract File objects directly from UploadedFile objects (no conversion needed)
        const files: File[] = [];
        for (const uploadedFile of uploadedFiles) {
          if (uploadedFile.file) {
            // Use stored original file (optimized path)
            files.push(uploadedFile.file);
          } else if (uploadedFile.preview) {
            // Fallback: convert from preview URL (legacy support)
            const response = await fetch(uploadedFile.preview);
            const blob = await response.blob();
            const file = new File([blob], uploadedFile.name, {
              type: uploadedFile.type,
            });
            files.push(file);
          } else {
            throw new Error(`No file data available for ${uploadedFile.name}`);
          }
        }

        // Process and upload images
        const results = await UploadService.uploadImages(
          files,
          formData,
          handleUpdateProgress
        );

        setProcessedImages(results);
        setShowResults(true);

        // Automatically add to portfolio if enabled
        if (autoAddToPortfolio) {
          try {
            // Convert processed images to products and save to database
            await saveProcessedImagesAsProducts(results);
            uploadLogger.info('Successfully added artworks to portfolio');
          } catch (portfolioError) {
            uploadLogger.error('Error adding to portfolio', portfolioError);
            // Don't fail the upload if portfolio update fails
          }
        }

        // Clear uploaded files after successful processing
        setUploadedFiles([]);
      } catch (err) {
        console.error('Upload error:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'An error occurred during upload.'
        );

        // Update file statuses to error
        setUploadedFiles((prev) =>
          prev.map((file) => ({
            ...file,
            status: 'error' as const,
            error: err instanceof Error ? err.message : 'Upload failed',
          }))
        );
      } finally {
        setIsUploading(false);
      }
    },
    [uploadedFiles, handleUpdateProgress, autoAddToPortfolio]
  );

  const handleDownloadPortfolioData = useCallback(() => {
    if (processedImages.length > 0) {
      UploadService.downloadPortfolioData(processedImages);
    }
  }, [processedImages]);

  const handleExportToPortfolio = useCallback(() => {
    if (processedImages.length > 0) {
      UploadService.downloadPortfolioData(processedImages);
    }
  }, [processedImages]);

  const handleReset = useCallback(() => {
    setUploadedFiles([]);
    setProcessedImages([]);
    setError(null);
    setShowResults(false);
  }, []);

  // Auto-fill defaults based on first selected file name
  useEffect(() => {
    if (uploadedFiles.length > 0) {
      const first = uploadedFiles[0];
      if (first?.name) {
        const { title, tag } = parsePaintingMetaFromFilename(first.name);
        // Fire a custom event that UploadForm can listen to and prefill values
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('upload-defaults', {
              detail: {
                title,
                dimensions: '56 × 76 cm',
                medium: 'Watercolor',
                tags: [tag],
              },
            })
          );
        }
      }
    }
  }, [uploadedFiles]);

  if (showResults && processedImages.length > 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Upload Complete!</h1>
          <p>Successfully processed {processedImages.length} image(s)</p>
          {autoAddToPortfolio && (
            <p className={styles.successMessage}>
              ✅ Images have been automatically added to your Portfolio 2
              gallery!
            </p>
          )}
        </div>

        <div className={styles.results}>
          <div className={styles.resultsHeader}>
            <h2>Processed Images</h2>
            <div className={styles.resultsActions}>
              <button
                type="button"
                onClick={handleDownloadPortfolioData}
                className={styles.downloadButton}
              >
                Download Portfolio Data
              </button>
              {!autoAddToPortfolio && (
                <button
                  type="button"
                  onClick={handleExportToPortfolio}
                  className={styles.exportButton}
                >
                  Export to Portfolio
                </button>
              )}
              <button
                type="button"
                onClick={handleReset}
                className={styles.resetButton}
              >
                Upload More Images
              </button>
              <a href="/cms" className={styles.exportButton}>
                Open CMS to Edit Metadata
              </a>
            </div>
          </div>

          <div className={styles.resultsList}>
            {processedImages.map((image) => (
              <div key={image.id} className={styles.resultItem}>
                <div className={styles.resultInfo}>
                  <h3>{image.title}</h3>
                  <p>{image.dimensions}</p>
                  <p className={styles.imageId}>ID: {image.id}</p>
                </div>
                <div className={styles.resultPaths}>
                  <div>
                    <strong>Thumbnail:</strong> /img/portfolio2/thumbs/
                    {image.id}.jpg
                  </div>
                  <div>
                    <strong>Full:</strong> /img/portfolio2/full/{image.id}.jpg
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.instructions}>
            <h3>Next Steps:</h3>
            <ol>
              {autoAddToPortfolio ? (
                <>
                  <li>
                    ✅ Images have been automatically added to your Portfolio 2
                    gallery
                  </li>
                  <li>
                    Visit{' '}
                    <Link href="/gallery" className={styles.link}>
                      Gallery
                    </Link>{' '}
                    to see your new images
                  </li>
                  <li>
                    Images are stored in the correct directories automatically
                  </li>
                </>
              ) : (
                <>
                  <li>
                    Click &quot;Export to Portfolio&quot; to add images to your gallery
                  </li>
                  <li>
                    Place the processed images in the correct directories:
                    <ul>
                      <li>
                        Thumbnails: <code>public/img/portfolio2/thumbs/</code>
                      </li>
                      <li>
                        Full images: <code>public/img/portfolio2/full/</code>
                      </li>
                    </ul>
                  </li>
                  <li>Import the downloaded data into your portfolio</li>
                </>
              )}
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Portfolio 2 Image Upload</h1>
        <p>Upload and process images for the Portfolio 2 gallery</p>
      </div>

      {error && (
        <div className={styles.error}>
          <div className={styles.errorIcon}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <div className={styles.errorContent}>
            <h3>Upload Error</h3>
            <p>{error}</p>
          </div>
        </div>
      )}

      <FileUpload
        onFilesSelected={handleFilesSelected}
        disabled={isUploading}
      />

      <FileList
        files={uploadedFiles}
        onRemoveFile={handleRemoveFile}
        onUpdateProgress={handleUpdateProgress}
      />

      <UploadForm
        onSubmit={handleFormSubmit}
        disabled={uploadedFiles.length === 0 || isUploading}
        isLoading={isUploading}
      />

      {/* Auto-add to portfolio toggle */}
      <div className={styles.autoAddToggle}>
        <label className={styles.toggleLabel}>
          <input
            type="checkbox"
            checked={autoAddToPortfolio}
            onChange={(e) => setAutoAddToPortfolio(e.target.checked)}
            className={styles.toggleInput}
          />
          <span className={styles.toggleSlider}></span>
          <span className={styles.toggleText}>
            Automatically add images to Portfolio 2 gallery
          </span>
        </label>
        <p className={styles.toggleDescription}>
          When enabled, uploaded images will be automatically added to your
          Portfolio 2 gallery and will appear immediately without manual import.
        </p>
      </div>

      <div className={styles.info}>
        <h3>How it works:</h3>
        <ol>
          <li>Select images to upload (JPEG, PNG, WebP, max 10MB each)</li>
          <li>Images will be automatically resized to 4:5 aspect ratio</li>
          <li>
            Thumbnails (800x1000px) and full images (1600x2000px) will be
            generated
          </li>
          <li>
            Multiple formats (JPG, WebP, AVIF) will be created for optimal
            performance
          </li>
          <li>Images can be automatically added to your Portfolio 2 gallery</li>
        </ol>
      </div>
    </div>
  );
}
