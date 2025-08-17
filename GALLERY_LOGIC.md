# Gallery System Logic Documentation

## Overview

The gallery system consists of three main components working together to create a responsive, interactive art gallery with filtering capabilities and a full-screen lightbox viewer.

## Component Architecture

### 1. Gallery Component (`Gallery.tsx`)
**Main orchestrator** that manages the overall gallery state and coordinates between gallery items and the lightbox.

#### Key Responsibilities:
- Manages filter state and filtering logic
- Handles lightbox state management
- Coordinates navigation between gallery items
- Provides loading states and empty states

#### State Management:
```typescript
// Filter state
const [activeFilter, setActiveFilter] = useState<string>('all');

// Loading state for smooth transitions
const [isLoading, setIsLoading] = useState(false);

// Lightbox state
const [lightboxState, setLightboxState] = useState({
  isOpen: boolean,
  currentItem: GalleryItem | null,
  currentIndex: number
});
```

### 2. GalleryItem Component (`GalleryItem.tsx`)
**Individual gallery card** that displays artwork with hover effects and metadata.

#### Key Features:
- Image loading states with placeholders
- Error handling for failed image loads
- Hover overlay with artwork information
- Responsive image sizing
- Click handler to open lightbox

#### Props Interface:
```typescript
interface GalleryItemProps {
  item: GalleryItemType;        // The artwork data
  onClick?: (item: GalleryItemType) => void;  // Click handler
}
```

### 3. Lightbox Component (`Lightbox.tsx`)
**Full-screen viewer** with navigation, touch gestures, and detailed artwork information.

#### Key Features:
- Full-screen overlay with backdrop
- Keyboard navigation (Arrow keys, Escape)
- Touch/swipe gestures for mobile
- Image metadata display
- Navigation controls
- Counter display
- Swipe indicators

#### Props Interface:
```typescript
interface LightboxProps {
  isOpen: boolean;              // Controls visibility
  currentItem: GalleryItem | null;  // Currently displayed artwork
  currentIndex: number;         // Position in filtered array
  totalItems: number;           // Total items in current filter
  onClose: () => void;          // Close handler
  onNext: () => void;           // Next item handler
  onPrevious: () => void;       // Previous item handler
}
```

## Data Structure

### GalleryItem Interface
```typescript
export interface GalleryItem {
  id: string;                   // Unique identifier
  title: string;                // Artwork title
  description?: string;         // Optional description
  imageUrl: string;             // Image source URL
  category: string;             // Artwork category (for filtering)
  dimensions?: string;          // Physical dimensions
  medium?: string;              // Art medium/material
  year?: number;                // Creation year
}
```

### GalleryFilter Interface
```typescript
export interface GalleryFilter {
  category: string;             // Filter category value
  label: string;                // Display label
}
```

### LightboxState Interface
```typescript
export interface LightboxState {
  isOpen: boolean;              // Lightbox visibility
  currentItem: GalleryItem | null;  // Current artwork
  currentIndex: number;         // Current position
}
```

## Lightbox Construction Logic

### 1. Opening the Lightbox
```typescript
const handleItemClick = (item: GalleryItem) => {
  const currentIndex = filteredItems.findIndex(
    filteredItem => filteredItem.id === item.id
  );
  setLightboxState({
    isOpen: true,
    currentItem: item,
    currentIndex: currentIndex >= 0 ? currentIndex : 0
  });
};
```

### 2. Navigation Logic
**Next Item:**
```typescript
const handleLightboxNext = () => {
  const nextIndex = (lightboxState.currentIndex + 1) % filteredItems.length;
  setLightboxState({
    isOpen: true,
    currentItem: filteredItems[nextIndex],
    currentIndex: nextIndex
  });
};
```

**Previous Item:**
```typescript
const handleLightboxPrevious = () => {
  const prevIndex = lightboxState.currentIndex === 0 
    ? filteredItems.length - 1 
    : lightboxState.currentIndex - 1;
  setLightboxState({
    isOpen: true,
    currentItem: filteredItems[prevIndex],
    currentIndex: prevIndex
  });
};
```

### 3. Touch Gesture Handling
The lightbox implements sophisticated touch gesture handling:

```typescript
// Minimum swipe distance (in px)
const minSwipeDistance = 50;

// Touch state management
const [touchStart, setTouchStart] = useState<number | null>(null);
const [touchEnd, setTouchEnd] = useState<number | null>(null);
const [isDragging, setIsDragging] = useState(false);
const [dragOffset, setDragOffset] = useState(0);
```

**Swipe Detection:**
```typescript
useEffect(() => {
  if (!touchStart || !touchEnd) return;

  const distance = touchStart - touchEnd;
  const isLeftSwipe = distance > minSwipeDistance;
  const isRightSwipe = distance < -minSwipeDistance;

  if (isLeftSwipe && totalItems > 1) {
    onNext();
  } else if (isRightSwipe && totalItems > 1) {
    onPrevious();
  }

  setTouchStart(null);
  setTouchEnd(null);
}, [touchStart, touchEnd, onNext, onPrevious, totalItems]);
```

## Filtering System

### 1. Filter Categories
Available filter categories are defined in `gallery-data.ts`:
```typescript
export const galleryFilters: GalleryFilter[] = [
  { category: 'all', label: 'All Works' },
  { category: 'paintings', label: 'Paintings' },
  { category: 'sculptures', label: 'Sculptures' },
  { category: 'photography', label: 'Photography' },
  { category: 'digital', label: 'Digital Art' }
];
```

### 2. Filtering Logic
```typescript
const filteredItems = useMemo(() => {
  if (activeFilter === 'all') {
    return items;
  }
  return items.filter(item => item.category === activeFilter);
}, [items, activeFilter]);
```

### 3. Filter Change Handling
```typescript
const handleFilterChange = (category: string) => {
  setIsLoading(true);
  setActiveFilter(category);
  // Simulate loading for smooth transitions
  setTimeout(() => setIsLoading(false), 300);
};
```

## Image Handling

### 1. Responsive Image Sizing
**Gallery Items:**
```typescript
sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
```

**Lightbox:**
```typescript
sizes="90vw"
```

### 2. Loading States
- **Placeholder spinner** while images load
- **Error handling** for failed image loads
- **Smooth transitions** when images become available

### 3. Image Optimization
- Uses Next.js `Image` component for optimization
- Lazy loading for gallery items
- Priority loading for lightbox images

## Accessibility Features

### 1. Keyboard Navigation
- **Escape**: Close lightbox
- **Arrow Right**: Next item
- **Arrow Left**: Previous item

### 2. ARIA Labels
- Close button: `aria-label="Close lightbox"`
- Navigation buttons: `aria-label="Previous image"` / `aria-label="Next image"`

### 3. Focus Management
- Body scroll is disabled when lightbox is open
- Event listeners are properly cleaned up

## CSS Classes and Styling

### Gallery Component Classes
- `.gallery` - Main container
- `.header` - Title and description section
- `.filters` - Filter button container
- `.gridContainer` - Grid wrapper
- `.grid` - Gallery items grid
- `.resultsCount` - Item count display

### GalleryItem Component Classes
- `.galleryItem` - Individual item card
- `.imageContainer` - Image wrapper
- `.image` - The artwork image
- `.overlay` - Hover overlay
- `.overlayContent` - Overlay content
- `.itemInfo` - Item metadata below image

### Lightbox Component Classes
- `.lightbox` - Main lightbox container
- `.overlay` - Backdrop overlay
- `.content` - Lightbox content area
- `.closeButton` - Close button
- `.navButton` - Navigation buttons
- `.imageContainer` - Image display area
- `.info` - Artwork information panel
- `.counter` - Item counter
- `.swipeIndicator` - Swipe hint
- `.swipeFeedback` - Visual swipe feedback

## Performance Optimizations

### 1. Memoization
- Filtered items are memoized to prevent unnecessary re-renders
- Event handlers are wrapped in `useCallback`

### 2. Image Optimization
- Next.js Image component handles optimization
- Responsive sizing reduces bandwidth
- Lazy loading for gallery items

### 3. State Management
- Efficient state updates
- Proper cleanup of event listeners
- Minimal re-renders through proper dependency arrays

## Usage Example

```typescript
import Gallery from '@/components/Gallery/Gallery';
import { galleryItems } from '@/lib/gallery-data';

function PortfolioPage() {
  return (
    <Gallery 
      items={galleryItems}
      title="My Artwork"
      description="A collection of my latest works"
    />
  );
}
```

## Data Flow

1. **Initial Load**: Gallery receives items array and renders grid
2. **Filter Selection**: User clicks filter → items are filtered → grid updates
3. **Item Click**: User clicks gallery item → lightbox opens with item data
4. **Navigation**: User navigates in lightbox → new item data loaded
5. **Close**: User closes lightbox → returns to gallery grid

This architecture provides a robust, accessible, and performant gallery system that handles various edge cases and provides a smooth user experience across different devices and screen sizes.
