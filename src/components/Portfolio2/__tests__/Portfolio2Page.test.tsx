import React from 'react';
import { render, screen } from '@testing-library/react';
import Portfolio2Page from '../Portfolio2Page';
import { Artwork } from '@/types/portfolio2';

// Mock the GalleryGrid component
jest.mock('../GalleryGrid', () => {
  return function MockGalleryGrid({ artworks }: { artworks: Artwork[] }) {
    return <div data-testid="gallery-grid">Gallery Grid with {artworks.length} artworks</div>;
  };
});

describe('Portfolio2Page', () => {
  const mockArtworks: Artwork[] = [
    {
      id: 'test-1',
      title: 'Test Artwork 1',
      dimensions: '60 × 75 cm, olej na płótnie',
      thumbnail: {
        jpg: '/test-thumb-1.jpg',
        width: 800,
        height: 1000
      },
      full: {
        jpg: '/test-full-1.jpg',
        width: 1600,
        height: 2000
      }
    },
    {
      id: 'test-2',
      title: 'Test Artwork 2',
      dimensions: '80 × 100 cm, akryl na płótnie',
      thumbnail: {
        jpg: '/test-thumb-2.jpg',
        width: 800,
        height: 1000
      },
      full: {
        jpg: '/test-full-2.jpg',
        width: 1600,
        height: 2000
      }
    }
  ];

  it('renders with artworks', () => {
    render(<Portfolio2Page artworks={mockArtworks} />);
    
    expect(screen.getByText('Portfolio 2')).toBeInTheDocument();
    expect(screen.getByText('Kolekcja prac artystycznych w formacie 4:5')).toBeInTheDocument();
    expect(screen.getByTestId('gallery-grid')).toBeInTheDocument();
    expect(screen.getByText('Gallery Grid with 2 artworks')).toBeInTheDocument();
  });

  it('renders empty state when no artworks', () => {
    render(<Portfolio2Page artworks={[]} />);
    
    expect(screen.getByText('Portfolio 2')).toBeInTheDocument();
    expect(screen.getByText('Brak prac do wyświetlenia.')).toBeInTheDocument();
    expect(screen.queryByTestId('gallery-grid')).not.toBeInTheDocument();
  });

  it('renders empty state when artworks is null', () => {
    render(<Portfolio2Page artworks={null as any} />);
    
    expect(screen.getByText('Portfolio 2')).toBeInTheDocument();
    expect(screen.getByText('Brak prac do wyświetlenia.')).toBeInTheDocument();
  });

  it('renders empty state when artworks is undefined', () => {
    render(<Portfolio2Page artworks={undefined as any} />);
    
    expect(screen.getByText('Portfolio 2')).toBeInTheDocument();
    expect(screen.getByText('Brak prac do wyświetlenia.')).toBeInTheDocument();
  });
});
