export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  preview?: string;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
}

export interface ProcessedImage {
  id: string;
  originalName: string;
  thumbnail: {
    jpg: string;
    webp?: string;
    avif?: string;
    width: number;
    height: number;
  };
  full: {
    jpg: string;
    webp?: string;
    avif?: string;
    width: number;
    height: number;
  };
  title: string;
  dimensions: string;
  alt?: string;
  medium?: string;
  tags?: string[];
}

export interface UploadState {
  files: UploadedFile[];
  isUploading: boolean;
  isProcessing: boolean;
  processedImages: ProcessedImage[];
  error?: string;
}

export interface UploadFormData {
  title: string;
  dimensions: string;
  medium: string;
  alt?: string;
  tags?: string[];
}
