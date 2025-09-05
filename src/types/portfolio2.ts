// Extended artwork interface to support multiple sources
export interface Artwork {
  id: string;                // unikalne
  title: string;             // tytuł do wyświetlenia w lightbox
  dimensions: string;        // „60 × 75 cm, olej na płótnie"
  thumbnail: {
    avif?: string;
    webp?: string;
    jpg: string;
    width: number;           // natural width (proporcja 4:5)
    height: number;          // natural height (proporcja 4:5)
  };
  full: {
    avif?: string;
    webp?: string;
    jpg: string;
    width: number;           // ratio 4:5
    height: number;          // ratio 4:5
  };
  alt?: string;              // krótkie alt; domyślnie title
  medium?: string;
  tags?: string[];           // e.g. kolekcja/seria, tematy
  
  // NEW: Source tracking and product integration
  source?: {
    type: 'static' | 'uploaded' | 'shopify';
    id?: string | number;    // Original source ID (e.g. Shopify product ID)
    url?: string;            // Link to product page or source
    metadata?: {
      price?: string;        // Display price for products
      vendor?: string;       // Artist/vendor name
      status?: string;       // Product status
      shopifyId?: string;    // Original Shopify ID
      lastUpdated?: string;  // When product was last synced
    };
  };
}

export interface Portfolio2PageProps {
  artworks: Artwork[];
  // New: Configuration for product integration
  enableShopifyProducts?: boolean;
  showSourceBadges?: boolean;
}

export interface GalleryGridProps {
  artworks: Artwork[];
  columns?: Partial<Record<"xl"|"lg"|"md"|"sm"|"xs", number>>; // override kolumn
  gap?: number; // w px, domyślnie 16
  // New: Display configuration
  showSourceBadges?: boolean;
  showPrices?: boolean;
  onProductClick?: (artwork: Artwork) => void; // Handle product clicks differently
}

export interface GalleryItemProps {
  artwork: Artwork;
  index: number;
  onOpen: (index: number) => void;
  // New: Enhanced display options
  showSourceBadge?: boolean;
  showPrice?: boolean;
  onProductClick?: (artwork: Artwork) => void;
}

export interface LightboxModalProps {
  artworks: Artwork[];
  index: number;                 // aktualnie otwarty
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (nextIndex: number) => void; // wrap-around
  // New: Product-specific lightbox features
  showProductInfo?: boolean;
  onViewProduct?: (artwork: Artwork) => void; // Link to product page
}

// New: Portfolio statistics with source breakdown
export interface PortfolioStats {
  total: number;
  uploaded: number;
  static: number;
  shopify: number;
  lastSync?: string;
}

// New: Source configuration for Portfolio2Manager
export interface SourceConfig {
  includeUploaded?: boolean;
  includeStatic?: boolean;
  includeShopify?: boolean;
  shopifyFilters?: {
    publishedOnly?: boolean;
    tags?: string[];
    categories?: string[];
    vendor?: string;
  };
}
