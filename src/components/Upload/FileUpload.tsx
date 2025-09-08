'use client';

import React, { useCallback, useRef, useState } from 'react';
import { UploadedFile } from '@/types/upload';
import { UploadService } from '@/lib/upload-service';
import styles from './FileUpload.module.css';

interface FileUploadProps {
  onFilesSelected: (files: UploadedFile[]) => void;
  disabled?: boolean;
}

export default function FileUpload({
  onFilesSelected,
  disabled = false,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      setIsProcessing(true);
      const uploadedFiles: UploadedFile[] = [];

      try {
        for (const file of Array.from(files)) {
          const fileId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

          // Create preview
          const preview = await UploadService.getFilePreview(file);

          const uploadedFile: UploadedFile = {
            id: fileId,
            name: file.name,
            size: file.size,
            type: file.type,
            preview,
            status: 'pending',
            progress: 0,
          };

          uploadedFiles.push(uploadedFile);
        }

        onFilesSelected(uploadedFiles);
      } catch (error) {
        console.error('Error processing files:', error);
      } finally {
        setIsProcessing(false);
      }
    },
    [onFilesSelected]
  );

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files && files.length > 0) {
        processFiles(files);
      }
    },
    [processFiles]
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragOver(false);

      if (disabled) return;

      const files = event.dataTransfer.files;
      if (files && files.length > 0) {
        processFiles(files);
      }
    },
    [disabled, processFiles]
  );

  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleClick();
      }
    },
    [handleClick]
  );

  return (
    <div className={styles.container}>
      <div
        className={`${styles.uploadArea} ${isDragOver ? styles.dragOver : ''} ${disabled ? styles.disabled : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-label="Upload images"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className={styles.fileInput}
          disabled={disabled}
        />

        <div className={styles.content}>
          {isProcessing ? (
            <div className={styles.processing}>
              <div className={styles.spinner}></div>
              <p>Processing files...</p>
            </div>
          ) : (
            <>
              <div className={styles.icon}>
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7,10 12,15 17,10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </div>
              <h3>Upload Images</h3>
              <p>Drag and drop images here, or click to select files</p>
              <p className={styles.supportedFormats}>
                Supported formats: JPEG, PNG, WebP (max 10MB each)
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
