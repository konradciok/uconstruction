# Upload Module - Dokumentacja

## Przegląd

Moduł Upload to kompletne rozwiązanie do przesyłania i przetwarzania obrazów dla galerii Portfolio 2. Automatycznie generuje miniatury, konwertuje formaty i organizuje pliki w odpowiedniej strukturze katalogów.

## Funkcjonalności

### 🚀 **Główne możliwości:**
- **Drag & Drop** - przeciągnij i upuść obrazy
- **Wielokrotne wybory** - wybierz wiele plików jednocześnie
- **Automatyczne przetwarzanie** - generowanie miniatur i pełnych obrazów
- **Konwersja formatów** - JPG, WebP, AVIF
- **Aspect ratio 4:5** - automatyczne dopasowanie proporcji
- **Progress tracking** - śledzenie postępu przetwarzania
- **Download danych** - pobieranie gotowych danych portfolio

### 📁 **Struktura plików:**
```
public/
└── img/
    └── portfolio2/
        ├── thumbs/          # Miniatury (800x1000px)
        │   ├── a-1234567890-abc123.jpg
        │   ├── a-1234567890-abc123.webp
        │   ├── a-1234567890-abc123.avif
        │   └── ...
        └── full/            # Pełne obrazy (1600x2000px)
            ├── a-1234567890-abc123.jpg
            ├── a-1234567890-abc123.webp
            ├── a-1234567890-abc123.avif
            └── ...
```

## Architektura

### Struktura komponentów:
```
src/
├── types/
│   └── upload.ts              # Definicje typów
├── lib/
│   ├── image-processor.ts     # Przetwarzanie obrazów
│   └── upload-service.ts      # Serwis upload
├── components/
│   └── Upload/
│       ├── UploadPage.tsx     # Główna strona
│       ├── FileUpload.tsx     # Komponent upload
│       ├── FileList.tsx       # Lista plików
│       ├── UploadForm.tsx     # Formularz metadanych
│       └── index.ts          # Eksporty
└── app/
    ├── upload/
    │   ├── page.tsx          # Strona upload
    │   └── page.module.css   # Style strony
    └── api/
        └── upload/
            └── route.ts      # API endpoint
```

## Użycie

### Podstawowe użycie:
1. Przejdź do `/upload`
2. Przeciągnij obrazy lub kliknij aby wybrać
3. Wypełnij formularz metadanych
4. Kliknij "Process & Upload Images"
5. Pobierz wygenerowane dane portfolio

### Programistyczne użycie:
```tsx
import { UploadPage } from '@/components/Upload';

function MyApp() {
  return <UploadPage />;
}
```

## Komponenty

### 1. UploadPage
Główny komponent orchestrujący cały proces upload.

**Funkcjonalności:**
- Zarządzanie stanem upload
- Obsługa błędów
- Wyświetlanie wyników
- Download danych portfolio

### 2. FileUpload
Komponent drag & drop do wyboru plików.

**Props:**
```typescript
interface FileUploadProps {
  onFilesSelected: (files: UploadedFile[]) => void;
  disabled?: boolean;
}
```

**Funkcjonalności:**
- Drag & drop
- Wybór plików
- Preview obrazów
- Walidacja typów plików

### 3. FileList
Lista wybranych plików z statusami.

**Props:**
```typescript
interface FileListProps {
  files: UploadedFile[];
  onRemoveFile: (fileId: string) => void;
  onUpdateProgress: (fileId: string, progress: number) => void;
}
```

**Funkcjonalności:**
- Wyświetlanie plików z preview
- Status upload (pending, uploading, completed, error)
- Progress bars
- Usuwanie plików

### 4. UploadForm
Formularz metadanych dla obrazów.

**Props:**
```typescript
interface UploadFormProps {
  onSubmit: (formData: UploadFormData) => void;
  disabled?: boolean;
  isLoading?: boolean;
}
```

**Funkcjonalności:**
- Wprowadzanie tytułu, wymiarów, medium
- Walidacja formularza
- Keyboard shortcuts (⌘+Enter)
- Loading states

## Typy danych

### UploadedFile
```typescript
interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  preview?: string;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
}
```

### ProcessedImage
```typescript
interface ProcessedImage {
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
}
```

### UploadFormData
```typescript
interface UploadFormData {
  title: string;
  dimensions: string;
  medium: string;
  alt?: string;
}
```

## Przetwarzanie obrazów

### ImageProcessor
Klasa odpowiedzialna za przetwarzanie obrazów.

**Główne metody:**
- `processImage(file: File)` - przetwarzanie pojedynczego obrazu
- `validateImageFile(file: File)` - walidacja pliku
- `generateImageId()` - generowanie unikalnego ID

**Specyfikacje:**
- **Miniatury**: 800x1000px (4:5)
- **Pełne obrazy**: 1600x2000px (4:5)
- **Formaty**: JPG (wymagany), WebP, AVIF (opcjonalne)
- **Jakość**: 90%
- **Maksymalny rozmiar**: 10MB

### Algorytm przetwarzania:
1. **Walidacja** - sprawdzenie typu i rozmiaru pliku
2. **Ładowanie** - wczytanie obrazu do Canvas
3. **Resize** - dopasowanie do proporcji 4:5 z białym tłem
4. **Konwersja** - generowanie różnych formatów
5. **Zapisywanie** - zapis do odpowiednich katalogów

## API Endpoint

### POST /api/upload
Endpoint do przetwarzania uploadów.

**Request:**
- `FormData` z plikami i metadanymi

**Response:**
```typescript
{
  id: string;
  originalName: string;
  title: string;
  dimensions: string;
  alt?: string;
  thumbnail: { /* ... */ };
  full: { /* ... */ };
}
```

**Funkcjonalności:**
- Tworzenie katalogów automatycznie
- Zapisywanie plików w odpowiednich lokalizacjach
- Zwracanie struktury danych portfolio

## Walidacja

### Obsługiwane formaty:
- **JPEG** (.jpg, .jpeg)
- **PNG** (.png)
- **WebP** (.webp)

### Limity:
- **Maksymalny rozmiar**: 10MB na plik
- **Maksymalna liczba**: nieograniczona (przetwarzanie w batchach po 3)

### Walidacja formularza:
- **Tytuł**: wymagany
- **Wymiary**: wymagane
- **Medium**: wymagane
- **Alt text**: opcjonalne

## Dostępność (a11y)

### Funkcjonalności:
- **Keyboard navigation** - pełna obsługa klawiatury
- **Screen reader support** - odpowiednie ARIA labels
- **Focus management** - prawidłowe zarządzanie focusem
- **Error handling** - czytelne komunikaty błędów

### Wsparcie dla preferencji:
- `prefers-reduced-motion` - wyłączenie animacji
- `prefers-contrast: high` - zwiększony kontrast
- `prefers-color-scheme: dark` - tryb ciemny

## Wydajność

### Optymalizacje:
- **Batch processing** - przetwarzanie w grupach po 3
- **Canvas API** - wydajne przetwarzanie obrazów
- **Lazy loading** - leniwe ładowanie preview
- **Progress tracking** - śledzenie postępu

### Limity:
- **Concurrent uploads**: 3 jednocześnie
- **File size**: 10MB max
- **Memory usage**: optymalizowane dla dużych plików

## Błędy i rozwiązywanie problemów

### Częste problemy:

#### "Invalid file type"
- Sprawdź czy plik to JPEG, PNG lub WebP
- Upewnij się że rozszerzenie pliku jest poprawne

#### "File too large"
- Zmniejsz rozmiar pliku (max 10MB)
- Użyj kompresji przed uploadem

#### "Upload failed"
- Sprawdź połączenie internetowe
- Sprawdź czy katalogi mają odpowiednie uprawnienia
- Sprawdź konsolę przeglądarki

#### "Canvas context not available"
- Sprawdź czy przeglądarka obsługuje Canvas API
- Spróbuj w innej przeglądarka

### Debugowanie:
```javascript
// Włącz debug mode
localStorage.setItem('upload-debug', 'true');

// Sprawdź logi w konsoli
console.log('Upload debug info:', {
  files: uploadedFiles,
  progress: progress,
  errors: errors
});
```

## Rozszerzenia

### Dodanie nowych formatów:
```typescript
// W ImageProcessor.validateImageFile()
const validTypes = [
  'image/jpeg', 
  'image/jpg', 
  'image/png', 
  'image/webp',
  'image/avif' // Dodaj nowy format
];
```

### Dodanie nowych rozmiarów:
```typescript
// W ImageProcessor
private static readonly CUSTOM_SIZE = { width: 1200, height: 1500 };
```

### Dodanie watermarków:
```typescript
// W ImageProcessor.drawImageWithAspectRatio()
ctx.fillText('Watermark', x, y);
```

## Testowanie

### Testy manualne:
1. **Drag & drop** - przeciągnij różne typy plików
2. **Wielokrotne wybory** - wybierz wiele plików
3. **Walidacja** - spróbuj upload nieprawidłowych plików
4. **Progress** - sprawdź paski postępu
5. **Download** - pobierz wygenerowane dane

### Testy automatyczne:
```bash
# Uruchom testy upload
npm test -- --testPathPattern=Upload

# Lub z verbose
npm test -- --testPathPattern=Upload --verbose
```

## Wymagania techniczne

- **React**: 18+
- **Next.js**: 13+
- **TypeScript**: 4.9+
- **Canvas API**: wymagane
- **File API**: wymagane
- **FormData**: wymagane

## Licencja

MIT License - zobacz plik LICENSE w głównym katalogu projektu.

## Wsparcie

W przypadku problemów:
1. Sprawdź konsolę przeglądarki
2. Sprawdź Network tab w DevTools
3. Sprawdź uprawnienia katalogów
4. Sprawdź logi serwera
