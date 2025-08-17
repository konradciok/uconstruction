export interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  blurDataURL?: string; // Base64 encoded tiny thumbnail for blur placeholder
  category: string;
  dimensions?: string;
  medium?: string;
  year?: number;
}

export interface GalleryFilter {
  category: string;
  label: string;
}

export interface LightboxState {
  isOpen: boolean;
  currentItem: GalleryItem | null;
  currentIndex: number;
}
