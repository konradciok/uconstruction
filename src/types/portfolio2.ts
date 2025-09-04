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
}

export interface Portfolio2PageProps {
  artworks: Artwork[];
}

export interface GalleryGridProps {
  artworks: Artwork[];
  columns?: Partial<Record<"xl"|"lg"|"md"|"sm"|"xs", number>>; // override kolumn
  gap?: number; // w px, domyślnie 16
}

export interface GalleryItemProps {
  artwork: Artwork;
  index: number;
  onOpen: (index: number) => void;
}

export interface LightboxModalProps {
  artworks: Artwork[];
  index: number;                 // aktualnie otwarty
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (nextIndex: number) => void; // wrap-around
}
