# Portfolio 2 Module

Moduł galerii dla podstrony Portfolio 2, zaprojektowany do eksponowania obrazów w formacie 4:5 z funkcjonalnym lightboxem.

## Funkcjonalności

### Siatka galerii (thumbnails)

- **Stała proporcja 4:5** dla wszystkich miniatur i obrazów w powiększeniu
- **Biała ramka 3px** wokół każdej miniatury
- **Siatka symetryczna** z równymi kolumnami i odstępami
- **Responsywność**:
  - ≥1280px: 5 kolumn
  - 1024–1279px: 4 kolumny
  - 768–1023px: 3 kolumny
  - 480–767px: 2 kolumny
  - <480px: 1 kolumna
- **Lazy loading** miniatur
- **Optymalizacja obrazów** z obsługą AVIF/WebP + fallback JPG

### Lightbox (powiększenie)

- **Otwierany po kliknięciu/tapnięciu** w miniaturę
- **Obraz w proporcji 4:5** wpasowany maksymalnie w viewport
- **Tytuł i wymiary** wyświetlone na dole powiększenia
- **Nawigacja**:
  - Kliknięcie poza obrazem lub przycisk Close zamyka
  - Strzałki klawiatury (←/→) do nawigacji
  - Esc zamyka
  - Gesty swipe na mobile
  - Preload sąsiadujących obrazów (±1)

## Struktura komponentów

```
Portfolio2/
├── Portfolio2Page.tsx          # Główny komponent strony
├── GalleryGrid.tsx             # Siatka galerii
├── GalleryItem.tsx             # Pojedyncza miniatura
├── LightboxModal.tsx           # Modal z powiększeniem
├── README.md                   # Ta dokumentacja
└── *.module.css               # Style CSS
```

## Typy danych

### Artwork

```typescript
interface Artwork {
  id: string; // unikalne
  title: string; // tytuł do wyświetlenia w lightbox
  dimensions: string; // „60 × 75 cm, olej na płótnie"
  thumbnail: {
    avif?: string;
    webp?: string;
    jpg: string;
    width: number; // natural width (proporcja 4:5)
    height: number; // natural height (proporcja 4:5)
  };
  full: {
    avif?: string;
    webp?: string;
    jpg: string;
    width: number; // ratio 4:5
    height: number; // ratio 4:5
  };
  alt?: string; // krótkie alt; domyślnie title
}
```

## Użycie

### Podstawowe użycie

```tsx
import Portfolio2Page from '@/components/Portfolio2/Portfolio2Page';
import { ARTWORKS } from '@/lib/portfolio2-data';

function MyPage() {
  return <Portfolio2Page artworks={ARTWORKS} />;
}
```

### Z konfiguracją kolumn

```tsx
import GalleryGrid from '@/components/Portfolio2/GalleryGrid';

function CustomGallery() {
  return (
    <GalleryGrid
      artworks={ARTWORKS}
      columns={{
        xl: 6, // 6 kolumn na bardzo dużych ekranach
        lg: 4, // 4 kolumny na dużych ekranach
        md: 3, // 3 kolumny na średnich ekranach
        sm: 2, // 2 kolumny na małych ekranach
        xs: 1, // 1 kolumna na bardzo małych ekranach
      }}
      gap={20} // 20px odstęp między elementami
    />
  );
}
```

## Konfiguracja danych obrazów

### Struktura katalogów

```
public/
└── img/
    └── portfolio2/
        ├── thumbs/          # Miniatury (800x1000px)
        │   ├── a-001.jpg
        │   ├── a-001.webp
        │   ├── a-001.avif
        │   └── ...
        └── full/            # Pełne obrazy (1600x2000px)
            ├── a-001.jpg
            ├── a-001.webp
            ├── a-001.avif
            └── ...
```

### Przykład danych

```typescript
export const ARTWORKS: Artwork[] = [
  {
    id: 'a-001',
    title: 'Cisza poranka',
    dimensions: '60 × 75 cm, olej na płótnie',
    thumbnail: {
      avif: '/img/portfolio2/thumbs/a-001.avif',
      webp: '/img/portfolio2/thumbs/a-001.webp',
      jpg: '/img/portfolio2/thumbs/a-001.jpg',
      width: 800,
      height: 1000,
    },
    full: {
      avif: '/img/portfolio2/full/a-001.avif',
      webp: '/img/portfolio2/full/a-001.webp',
      jpg: '/img/portfolio2/full/a-001.jpg',
      width: 1600,
      height: 2000,
    },
    alt: 'Obraz olejny: Cisza poranka',
  },
];
```

## Dostępność (a11y)

### Miniatury

- Przyciski z `aria-label="Powiększ: {title}"`
- Obsługa klawiatury (Enter/Space otwiera)
- Focus management

### Lightbox

- Modal dialog z `role="dialog"`, `aria-modal="true"`
- `aria-labelledby` wskazujące tytuł w overlayu
- Trap focus w modalu
- Return focus do ostatniej miniatury po zamknięciu
- Obsługa klawiatury (Esc zamyka, strzałki nawigują)

## Wydajność

### Optymalizacje

- **Lazy loading** miniatur z `loading="lazy"`
- **Priority loading** pierwszych 4 obrazów
- **Preload** sąsiadujących obrazów w lightboxie
- **CSS containment** dla lepszej wydajności renderowania
- **Aspect-ratio** CSS zamiast JavaScript dla uniknięcia reflow

### Responsive images

```tsx
<Image
  src={artwork.thumbnail.jpg}
  alt={altText}
  width={artwork.thumbnail.width}
  height={artwork.thumbnail.height}
  loading="lazy"
  sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
  priority={index < 4}
/>
```

## Style i motywy

### Kolory

- **Tło strony**: neutralne (#f8f9fa)
- **Ramka miniatury**: biała 3px z delikatnym cieniem
- **Lightbox overlay**: półprzezroczysty czarny
- **Przyciski**: półprzezroczyste z backdrop-filter

### Responsywność

- **Desktop**: 16px odstępy
- **Tablet**: 12px odstępy
- **Mobile**: 8px odstępy

### Dark mode

Moduł automatycznie obsługuje tryb ciemny poprzez `prefers-color-scheme: dark`.

## Testy

### Testy manualne

1. **Siatka**: Sprawdź 5 kolumn przy 1440px, wszystkie miniatury 4:5 z ramką 3px
2. **Lightbox**: Klik na miniaturę otwiera modal, obraz 4:5 bez zniekształceń
3. **Nawigacja**: Esc zamyka, ←/→ przechodzą między obrazami, swipe działa na mobile
4. **Dostępność**: Tabem można dojść do wszystkich przycisków, fokus nie wychodzi poza modal
5. **Wydajność**: Miniatury ładują się leniwie, brak reflow podczas przewijania

### Testy automatyczne

```bash
# Uruchom testy
npm test -- --testPathPattern=Portfolio2

# Lub z verbose
npm test -- --testPathPattern=Portfolio2 --verbose
```

## Rozszerzenia

### Dodanie filtrów

```tsx
// Można dodać filtry kategorii, wyszukiwanie, etc.
const [filteredArtworks, setFilteredArtworks] = useState(artworks);

<GalleryGrid artworks={filteredArtworks} />;
```

### Dodanie animacji

```tsx
// Można dodać framer-motion dla animacji
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  <GalleryGrid artworks={artworks} />
</motion.div>;
```

## Wymagania techniczne

- **React 18+**
- **Next.js 13+** (dla Image component)
- **TypeScript 4.9+**
- **CSS Modules** (dla stylowania)

## Licencja

MIT License - zobacz plik LICENSE w głównym katalogu projektu.
