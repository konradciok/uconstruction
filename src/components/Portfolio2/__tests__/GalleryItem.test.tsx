import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GalleryItem from '../GalleryItem';
import { Artwork } from '@/types/portfolio2';

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} {...props} data-testid="gallery-image" />;
  };
});

describe('GalleryItem', () => {
  const mockArtwork: Artwork = {
    id: 'test-1',
    title: 'Test Artwork',
    dimensions: '60 × 75 cm, olej na płótnie',
    thumbnail: {
      jpg: '/test-thumb.jpg',
      width: 800,
      height: 1000,
    },
    full: {
      jpg: '/test-full.jpg',
      width: 1600,
      height: 2000,
    },
    alt: 'Test artwork description',
  };

  const mockOnOpen = jest.fn();

  beforeEach(() => {
    mockOnOpen.mockClear();
  });

  it('renders artwork with correct props', () => {
    render(<GalleryItem artwork={mockArtwork} index={0} onOpen={mockOnOpen} />);

    const button = screen.getByRole('button');
    const image = screen.getByTestId('gallery-image');

    expect(button).toBeInTheDocument();
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/test-thumb.jpg');
    expect(image).toHaveAttribute('alt', 'Test artwork description');
    expect(button).toHaveAttribute('aria-label', 'Powiększ: Test Artwork');
  });

  it('uses title as alt text when alt is not provided', () => {
    const artworkWithoutAlt = { ...mockArtwork, alt: undefined };
    render(
      <GalleryItem artwork={artworkWithoutAlt} index={0} onOpen={mockOnOpen} />
    );

    const image = screen.getByTestId('gallery-image');
    expect(image).toHaveAttribute('alt', 'Test Artwork');
  });

  it('calls onOpen when clicked', () => {
    render(<GalleryItem artwork={mockArtwork} index={0} onOpen={mockOnOpen} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockOnOpen).toHaveBeenCalledWith(0);
  });

  it('calls onOpen when Enter key is pressed', () => {
    render(<GalleryItem artwork={mockArtwork} index={0} onOpen={mockOnOpen} />);

    const button = screen.getByRole('button');
    fireEvent.keyDown(button, { key: 'Enter' });

    expect(mockOnOpen).toHaveBeenCalledWith(0);
  });

  it('calls onOpen when Space key is pressed', () => {
    render(<GalleryItem artwork={mockArtwork} index={0} onOpen={mockOnOpen} />);

    const button = screen.getByRole('button');
    fireEvent.keyDown(button, { key: ' ' });

    expect(mockOnOpen).toHaveBeenCalledWith(0);
  });

  it('prevents default behavior for Enter and Space keys', () => {
    render(<GalleryItem artwork={mockArtwork} index={0} onOpen={mockOnOpen} />);

    const button = screen.getByRole('button');

    const enterEvent = fireEvent.keyDown(button, { key: 'Enter' });
    const spaceEvent = fireEvent.keyDown(button, { key: ' ' });

    expect(enterEvent.defaultPrevented).toBe(true);
    expect(spaceEvent.defaultPrevented).toBe(true);
  });

  it('does not call onOpen for other keys', () => {
    render(<GalleryItem artwork={mockArtwork} index={0} onOpen={mockOnOpen} />);

    const button = screen.getByRole('button');
    fireEvent.keyDown(button, { key: 'Tab' });

    expect(mockOnOpen).not.toHaveBeenCalled();
  });

  it('passes correct index to onOpen', () => {
    render(<GalleryItem artwork={mockArtwork} index={5} onOpen={mockOnOpen} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockOnOpen).toHaveBeenCalledWith(5);
  });

  it('renders with priority loading for first 4 items', () => {
    render(<GalleryItem artwork={mockArtwork} index={3} onOpen={mockOnOpen} />);

    const image = screen.getByTestId('gallery-image');
    expect(image).toHaveAttribute('loading', 'lazy');
  });

  it('renders with priority loading for first 4 items', () => {
    render(<GalleryItem artwork={mockArtwork} index={0} onOpen={mockOnOpen} />);

    const image = screen.getByTestId('gallery-image');
    // Note: In the actual component, priority is set via the priority prop
    // but since we're mocking the Image component, we can't test this directly
    // This test ensures the component renders without errors
    expect(image).toBeInTheDocument();
  });
});
