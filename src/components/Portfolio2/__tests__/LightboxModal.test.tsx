import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import LightboxModal from '../LightboxModal';
import { Artwork } from '@/types/portfolio2';

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} {...props} data-testid="lightbox-image" />;
  };
});

// Mock createPortal
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (node: React.ReactNode) => node,
}));

describe('LightboxModal', () => {
  const mockArtworks: Artwork[] = [
    {
      id: 'test-1',
      title: 'Test Artwork 1',
      dimensions: '60 × 75 cm, olej na płótnie',
      thumbnail: {
        jpg: '/test-thumb-1.jpg',
        width: 800,
        height: 1000,
      },
      full: {
        jpg: '/test-full-1.jpg',
        width: 1600,
        height: 2000,
      },
      alt: 'Test artwork 1 description',
    },
    {
      id: 'test-2',
      title: 'Test Artwork 2',
      dimensions: '80 × 100 cm, akryl na płótnie',
      thumbnail: {
        jpg: '/test-thumb-2.jpg',
        width: 800,
        height: 1000,
      },
      full: {
        jpg: '/test-full-2.jpg',
        width: 1600,
        height: 2000,
      },
      alt: 'Test artwork 2 description',
    },
  ];

  const mockOnClose = jest.fn();
  const mockOnNavigate = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnNavigate.mockClear();
  });

  it('renders when open with correct artwork', () => {
    render(
      <LightboxModal
        artworks={mockArtworks}
        index={0}
        isOpen={true}
        onClose={mockOnClose}
        onNavigate={mockOnNavigate}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Artwork 1')).toBeInTheDocument();
    expect(screen.getByText('60 × 75 cm, olej na płótnie')).toBeInTheDocument();
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
    expect(screen.getByTestId('lightbox-image')).toHaveAttribute(
      'src',
      '/test-full-1.jpg'
    );
  });

  it('does not render when closed', () => {
    render(
      <LightboxModal
        artworks={mockArtworks}
        index={0}
        isOpen={false}
        onClose={mockOnClose}
        onNavigate={mockOnNavigate}
      />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <LightboxModal
        artworks={mockArtworks}
        index={0}
        isOpen={true}
        onClose={mockOnClose}
        onNavigate={mockOnNavigate}
      />
    );

    const closeButton = screen.getByLabelText('Zamknij galerię');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onNavigate with next index when next button is clicked', () => {
    render(
      <LightboxModal
        artworks={mockArtworks}
        index={0}
        isOpen={true}
        onClose={mockOnClose}
        onNavigate={mockOnNavigate}
      />
    );

    const nextButton = screen.getByLabelText('Następny obraz: Test Artwork 2');
    fireEvent.click(nextButton);

    expect(mockOnNavigate).toHaveBeenCalledWith(1);
  });

  it('calls onNavigate with previous index when previous button is clicked', () => {
    render(
      <LightboxModal
        artworks={mockArtworks}
        index={1}
        isOpen={true}
        onClose={mockOnClose}
        onNavigate={mockOnNavigate}
      />
    );

    const prevButton = screen.getByLabelText('Poprzedni obraz: Test Artwork 1');
    fireEvent.click(prevButton);

    expect(mockOnNavigate).toHaveBeenCalledWith(0);
  });

  it('handles wrap-around navigation for next button', () => {
    render(
      <LightboxModal
        artworks={mockArtworks}
        index={1}
        isOpen={true}
        onClose={mockOnClose}
        onNavigate={mockOnNavigate}
      />
    );

    const nextButton = screen.getByLabelText('Następny obraz: Test Artwork 1');
    fireEvent.click(nextButton);

    expect(mockOnNavigate).toHaveBeenCalledWith(0);
  });

  it('handles wrap-around navigation for previous button', () => {
    render(
      <LightboxModal
        artworks={mockArtworks}
        index={0}
        isOpen={true}
        onClose={mockOnClose}
        onNavigate={mockOnNavigate}
      />
    );

    const prevButton = screen.getByLabelText('Poprzedni obraz: Test Artwork 2');
    fireEvent.click(prevButton);

    expect(mockOnNavigate).toHaveBeenCalledWith(1);
  });

  it('calls onClose when backdrop is clicked', () => {
    render(
      <LightboxModal
        artworks={mockArtworks}
        index={0}
        isOpen={true}
        onClose={mockOnClose}
        onNavigate={mockOnNavigate}
      />
    );

    const overlay = screen.getByRole('dialog');
    fireEvent.click(overlay);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('does not call onClose when image container is clicked', () => {
    render(
      <LightboxModal
        artworks={mockArtworks}
        index={0}
        isOpen={true}
        onClose={mockOnClose}
        onNavigate={mockOnNavigate}
      />
    );

    const imageContainer = screen.getByTestId('lightbox-image').parentElement;
    if (imageContainer) {
      fireEvent.click(imageContainer);
    }

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('uses title as alt text when alt is not provided', () => {
    const artworkWithoutAlt = { ...mockArtworks[0], alt: undefined };
    render(
      <LightboxModal
        artworks={[artworkWithoutAlt]}
        index={0}
        isOpen={true}
        onClose={mockOnClose}
        onNavigate={mockOnNavigate}
      />
    );

    const image = screen.getByTestId('lightbox-image');
    expect(image).toHaveAttribute('alt', 'Test Artwork 1');
  });

  it('has correct accessibility attributes', () => {
    render(
      <LightboxModal
        artworks={mockArtworks}
        index={0}
        isOpen={true}
        onClose={mockOnClose}
        onNavigate={mockOnNavigate}
      />
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'lightbox-title');
  });

  it('displays correct counter', () => {
    render(
      <LightboxModal
        artworks={mockArtworks}
        index={1}
        isOpen={true}
        onClose={mockOnClose}
        onNavigate={mockOnNavigate}
      />
    );

    expect(screen.getByText('2 / 2')).toBeInTheDocument();
  });
});
