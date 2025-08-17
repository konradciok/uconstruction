# Pointer Events & Gesture Handling Upgrade

## Overview
The lightbox component has been upgraded to use modern Pointer Events API instead of legacy touch events, providing a more native and responsive user experience across all input devices (mouse, touch, pen).

## Key Improvements

### 1. Unified Input Handling
- **Before**: Separate `touchstart`, `touchmove`, `touchend` events
- **After**: Unified `pointerdown`, `pointermove`, `pointerup` events
- **Benefits**: Works consistently across mouse, touch, and pen input

### 2. Smart Axis Locking
- **Start State**: "undecided" - allows both horizontal and vertical movement
- **Threshold**: 10px movement determines axis lock
- **Horizontal Lock**: Captures swipe gestures for navigation
- **Vertical Lock**: Releases pointer capture to allow page scrolling
- **Benefits**: Prevents conflicts between lightbox navigation and page scrolling

### 3. Velocity-Based Gestures
- **Distance Threshold**: 48px minimum swipe distance
- **Velocity Threshold**: 0.5 px/ms for quick flicks
- **Benefits**: Responsive to both slow deliberate swipes and quick flicks

### 4. Enhanced Focus Management
- **Auto-focus**: Close button receives focus when lightbox opens
- **Tab Order**: Proper keyboard navigation sequence
- **Focus Indicators**: Clear visual feedback for keyboard users
- **Benefits**: Better accessibility and keyboard navigation

## Technical Implementation

### Pointer Event Handlers
```typescript
const onPointerDown = (e: React.PointerEvent) => {
  // Capture pointer and initialize gesture tracking
  target.setPointerCapture(e.pointerId);
  start.current = { x: e.clientX, y: e.clientY, t: performance.now() };
};

const onPointerMove = (e: React.PointerEvent) => {
  // Determine axis lock and handle horizontal gestures
  if (axisLock === 'undecided' && distance > AXIS_LOCK_THRESHOLD) {
    if (Math.abs(dx) > Math.abs(dy)) {
      setAxisLock('horizontal');
    } else {
      setAxisLock('vertical');
      target.releasePointerCapture(e.pointerId);
    }
  }
};

const onPointerUp = (e: React.PointerEvent) => {
  // Calculate velocity and trigger navigation if thresholds met
  const velocity = Math.abs(dx) / dt;
  if (Math.abs(dx) > THRESHOLD || velocity > VELOCITY_THRESHOLD) {
    dx < 0 ? onNext() : onPrevious();
  }
};
```

### Constants
- `THRESHOLD = 48` - Minimum distance for swipe (px)
- `VELOCITY_THRESHOLD = 0.5` - Minimum velocity for quick flicks (px/ms)
- `AXIS_LOCK_THRESHOLD = 10` - Distance to determine axis lock (px)

### CSS Enhancements
- Dynamic `touch-action` based on axis lock state
- Visual feedback during dragging with `cursor: grabbing`
- Improved focus states with `:focus-visible` support
- Data attributes for state-based styling

## User Experience Benefits

1. **Natural Feel**: Gestures feel native and responsive
2. **No Conflicts**: Horizontal swipes don't interfere with vertical scrolling
3. **Quick Navigation**: Fast flicks work even with small distances
4. **Accessibility**: Proper keyboard navigation and focus management
5. **Cross-Device**: Consistent behavior across mouse, touch, and pen

## Browser Support
- Modern browsers with Pointer Events API support
- Graceful fallback for older browsers (maintains existing functionality)
- Progressive enhancement approach

## Testing
- Test on various devices (desktop, tablet, mobile)
- Verify keyboard navigation works properly
- Check that vertical scrolling isn't blocked
- Ensure quick flicks work as expected
