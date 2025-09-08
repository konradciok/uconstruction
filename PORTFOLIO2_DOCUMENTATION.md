# Portfolio 2 Module - Dokumentacja

## Przegląd

Moduł Portfolio 2 to kompletne rozwiązanie galerii obrazów dla strony artystki malarki, zaprojektowane do eksponowania prac w formacie 4:5 z zaawansowanym lightboxem. Moduł jest w pełni responsywny, dostępny i zoptymalizowany pod kątem wydajności.

## Architektura

### Struktura plików

```
src/
├── types/
│   └── portfolio2.ts              # Definicje typów TypeScript
├── lib/
│   └── portfolio2-data.ts         # Przykładowe dane
├── components/
│   └── Portfolio2/
│       ├── Portfolio2Page.tsx     # Główny komponent strony
│       ├── GalleryGrid.tsx        # Siatka galerii
│       ├── GalleryItem.tsx        # Pojedyncza miniatura
│       ├── LightboxModal.tsx      # Modal z powiększeniem
│       ├── index.ts              # Eksporty komponentów
│       ├── README.md             # Dokumentacja modułu
│       └── __tests__/            # Testy komponentów
├── hooks/
│   └── usePortfolio2Lightbox.ts  # Hook do zarządzania lightboxem
└── app/
    └── portfolio2/
        ├── page.tsx              # Strona Portfolio 2
        └── page.module.css       # Style strony
```

### Komponenty

#### 1. Portfolio2Page

Główny komponent strony, który renderuje nagłówek i siatkę galerii.

**Props:**

```typescript
interface Portfolio2PageProps {
  artworks: Artwork[];
}
```

**Funkcjonalności:**

- Renderowanie nagłówka strony
- Obsługa stanu pustej galerii
- Integracja z GalleryGrid

#### 2. GalleryGrid

Komponent odpowiedzialny za siatkę galerii, zarządzanie stanem lightboxa i nawigację.

**Props:**

```typescript
interface GalleryGridProps {
  artworks: Artwork[];
  columns?: Partial<Record<'xl' | 'lg' | 'md' | 'sm' | 'xs', number>>;
  gap?: number; // domyślnie 16
}
```

**Funkcjonalności:**

- Responsywna siatka CSS Grid
- Zarządzanie stanem lightboxa
- Konfigurowalne kolumny i odstępy
- Integracja z LightboxModal

#### 3. GalleryItem

Pojedyncza miniatura obrazu z obsługą kliknięć i klawiatury.

**Props:**

```typescript
interface GalleryItemProps {
  artwork: Artwork;
  index: number;
  onOpen: (index: number) => void;
}
```

**Funkcjonalności:**

- Renderowanie obrazu w proporcji 4:5
- Biała ramka 3px
- Obsługa kliknięć i klawiatury
- Lazy loading z priority dla pierwszych 4 obrazów
- Dostępność (aria-label, focus management)

#### 4. LightboxModal

Modal z powiększeniem obrazu, nawigacją i informacjami.

**Props:**

```typescript
interface LightboxModalProps {
  artworks: Artwork[];
  index: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (nextIndex: number) => void;
}
```

**Funkcjonalności:**

- Modal z portalem React
- Obraz w proporcji 4:5
- Nawigacja klawiaturą (←/→, Esc)
- Gesty swipe na mobile
- Preload sąsiadujących obrazów
- Focus trap i dostępność
- Informacje o obrazie (tytuł, wymiary)

## Typy danych

### Artwork

```typescript
interface Artwork {
  id: string; // Unikalny identyfikator
  title: string; // Tytuł do wyświetlenia w lightbox
  dimensions: string; // Wymiary i technika
  thumbnail: {
    avif?: string; // Obraz AVIF (opcjonalny)
    webp?: string; // Obraz WebP (opcjonalny)
    jpg: string; // Obraz JPG (wymagany)
    width: number; // Szerokość (proporcja 4:5)
    height: number; // Wysokość (proporcja 4:5)
  };
  full: {
    avif?: string; // Pełny obraz AVIF (opcjonalny)
    webp?: string; // Pełny obraz WebP (opcjonalny)
    jpg: string; // Pełny obraz JPG (wymagany)
    width: number; // Szerokość (proporcja 4:5)
    height: number; // Wysokość (proporcja 4:5)
  };
  alt?: string; // Tekst alternatywny (domyślnie title)
}
```

## Responsywność

### Breakpointy

- **≥1280px (xl)**: 5 kolumn
- **1024–1279px (lg)**: 4 kolumny
- **768–1023px (md)**: 3 kolumny
- **480–767px (sm)**: 2 kolumny
- **<480px (xs)**: 1 kolumna

### Odstępy

- **Desktop**: 16px
- **Tablet**: 12px (75% z 16px)
- **Mobile**: 8px (50% z 16px)

## Dostępność (a11y)

### Miniatury

- Przyciski z `aria-label="Powiększ: {title}"`
- Obsługa klawiatury (Enter/Space)
- Focus management
- Kontrast kolorów

### Lightbox

- Modal dialog z `role="dialog"`
- `aria-modal="true"`
- `aria-labelledby` wskazujące tytuł
- Focus trap w modalu
- Return focus po zamknięciu
- Obsługa klawiatury (Esc, strzałki)

### Wsparcie dla preferencji użytkownika

- `prefers-reduced-motion`: wyłączenie animacji
- `prefers-contrast: high`: zwiększony kontrast
- `prefers-color-scheme: dark`: tryb ciemny

## Wydajność

### Optymalizacje obrazów

- **Lazy loading** dla wszystkich miniatur
- **Priority loading** dla pierwszych 4 obrazów
- **Preload** sąsiadujących obrazów w lightboxie
- **Responsive images** z `sizes` attribute
- **Formaty AVIF/WebP** z fallback JPG

### CSS Optymalizacje

- **Aspect-ratio** CSS zamiast JavaScript
- **CSS containment** dla lepszego renderowania
- **Will-change** tylko gdy potrzebne
- **Smooth scrolling** z obsługą preferencji

### React Optymalizacje

- **useCallback** dla funkcji event handlers
- **useMemo** dla obliczeń
- **React.memo** dla komponentów (gdy potrzebne)
- **Portal** dla modala (lepsze z-index management)

## Użycie

### Podstawowe użycie

```tsx
import { Portfolio2Page } from '@/components/Portfolio2';
import { ARTWORKS } from '@/lib/portfolio2-data';

function MyPage() {
  return <Portfolio2Page artworks={ARTWORKS} />;
}
```

### Z konfiguracją

```tsx
import { GalleryGrid } from '@/components/Portfolio2';

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

### Z własnymi danymi

```tsx
const myArtworks: Artwork[] = [
  {
    id: 'my-artwork-1',
    title: 'Moja praca',
    dimensions: '50 × 62.5 cm, akryl na płótnie',
    thumbnail: {
      jpg: '/my-images/thumb-1.jpg',
      width: 800,
      height: 1000,
    },
    full: {
      jpg: '/my-images/full-1.jpg',
      width: 1600,
      height: 2000,
    },
  },
];

<Portfolio2Page artworks={myArtworks} />;
```

## Konfiguracja obrazów

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

### Wymagania obrazów

- **Proporcja**: 4:5 (szerokość:wysokość)
- **Miniatury**: 800x1000px (zalecane)
- **Pełne obrazy**: 1600x2000px (zalecane)
- **Formaty**: JPG (wymagany), WebP, AVIF (opcjonalne)
- **Optymalizacja**: Kompresja bez utraty jakości

## Testy

### Uruchomienie testów

```bash
# Wszystkie testy Portfolio 2
python run_portfolio2_tests.py

# Lub bezpośrednio przez npm
npm test -- --testPathPattern=Portfolio2 --verbose
```

### Pokrycie testów

- **Portfolio2Page**: Renderowanie, stany puste
- **GalleryItem**: Kliknięcia, klawiatura, dostępność
- **LightboxModal**: Nawigacja, klawiatura, dostępność
- **GalleryGrid**: Integracja komponentów

### Testy manualne

1. **Siatka**: 5 kolumn przy 1440px, wszystkie miniatury 4:5
2. **Lightbox**: Klik otwiera modal, obraz 4:5 bez zniekształceń
3. **Nawigacja**: Esc zamyka, ←/→ przechodzą między obrazami
4. **Mobile**: Swipe działa, responsywność
5. **Dostępność**: Tabem można dojść do wszystkich przycisków

## Rozszerzenia

### Dodanie filtrów

```tsx
const [filteredArtworks, setFilteredArtworks] = useState(artworks);

// Dodaj komponenty filtrów
<GalleryGrid artworks={filteredArtworks} />;
```

### Dodanie animacji

```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  <GalleryGrid artworks={artworks} />
</motion.div>;
```

### Dodanie kategorii

```tsx
interface Artwork {
  // ... istniejące pola
  category?: string;
}

// Filtrowanie po kategoriach
const filteredArtworks = artworks.filter(
  (art) => art.category === selectedCategory
);
```

## Rozwiązywanie problemów

### Częste problemy

#### Obrazy nie ładują się

- Sprawdź ścieżki w danych
- Upewnij się, że obrazy są w katalogu `public`
- Sprawdź formaty obrazów

#### Lightbox nie otwiera się

- Sprawdź, czy `onOpen` jest przekazywane
- Sprawdź, czy `artworks` nie jest puste
- Sprawdź konsolę przeglądarki

#### Responsywność nie działa

- Sprawdź CSS Grid breakpointy
- Upewnij się, że `aspect-ratio` jest ustawione
- Sprawdź, czy nie ma konfliktów CSS

#### Problemy z dostępnością

- Sprawdź `aria-label` i `aria-labelledby`
- Upewnij się, że focus trap działa
- Sprawdź obsługę klawiatury

### Debugowanie

```tsx
// Dodaj console.log do debugowania
const handleOpenLightbox = useCallback((index: number) => {
  console.log('Opening lightbox for index:', index);
  setCurrentIndex(index);
  setLightboxOpen(true);
}, []);
```

## Wymagania techniczne

- **React**: 18+
- **Next.js**: 13+ (dla Image component)
- **TypeScript**: 4.9+
- **CSS Modules**: Dla stylowania
- **Node.js**: 16+

## Licencja

MIT License - zobacz plik LICENSE w głównym katalogu projektu.

## Wsparcie

W przypadku problemów lub pytań:

1. Sprawdź dokumentację w `src/components/Portfolio2/README.md`
2. Uruchom testy: `python run_portfolio2_tests.py`
3. Sprawdź konsolę przeglądarki
4. Sprawdź Network tab w DevTools
