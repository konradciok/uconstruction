'use client';

import React from 'react';
import Image from 'next/image';
import { UploadedFile } from '@/types/upload';
import { UploadService } from '@/lib/upload-service';
import styles from './FileList.module.css';

interface FileListProps {
  files: UploadedFile[];
  onRemoveFile: (fileId: string) => void;
  onUpdateProgress: (fileId: string, progress: number) => void;
}

export default function FileList({
  files,
  onRemoveFile,
  onUpdateProgress: _onUpdateProgress,
}: FileListProps) {
  if (files.length === 0) {
    return null;
  }

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'pending':
        return (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12,6 12,12 16,14" />
          </svg>
        );
      case 'uploading':
        return (
          <div className={styles.spinner}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
          </div>
        );
      case 'processing':
        return (
          <div className={styles.spinner}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
          </div>
        );
      case 'completed':
        return (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="20,6 9,17 4,12" />
          </svg>
        );
      case 'error':
        return (
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
        );
      default:
        return null;
    }
  };

  const getStatusText = (status: UploadedFile['status']) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'uploading':
        return 'Uploading...';
      case 'processing':
        return 'Processing...';
      case 'completed':
        return 'Completed';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  const getStatusClass = (status: UploadedFile['status']) => {
    switch (status) {
      case 'pending':
        return styles.pending;
      case 'uploading':
      case 'processing':
        return styles.processing;
      case 'completed':
        return styles.completed;
      case 'error':
        return styles.error;
      default:
        return '';
    }
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Selected Files ({files.length})</h3>
      <div className={styles.fileList}>
        {files.map((file) => (
          <div
            key={file.id}
            className={`${styles.fileItem} ${getStatusClass(file.status)}`}
          >
            <div className={styles.preview}>
              {file.preview && (
                <Image
                  src={file.preview}
                  alt={file.name}
                  width={100}
                  height={100}
                  className={styles.previewImage}
                />
              )}
            </div>

            <div className={styles.fileInfo}>
              <div className={styles.fileName}>{file.name}</div>
              <div className={styles.fileDetails}>
                <span>{UploadService.formatFileSize(file.size)}</span>
                <span className={styles.separator}>•</span>
                <span>{file.type}</span>
              </div>

              {file.error && (
                <div className={styles.errorMessage}>{file.error}</div>
              )}
            </div>

            <div className={styles.status}>
              <div className={styles.statusIcon}>
                {getStatusIcon(file.status)}
              </div>
              <div className={styles.statusText}>
                {getStatusText(file.status)}
              </div>
            </div>

            <div className={styles.progressContainer}>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${file.progress}%` }}
                />
              </div>
              <span className={styles.progressText}>{file.progress}%</span>
            </div>

            <button
              type="button"
              className={styles.removeButton}
              onClick={() => onRemoveFile(file.id)}
              aria-label={`Remove ${file.name}`}
              disabled={
                file.status === 'uploading' || file.status === 'processing'
              }
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
