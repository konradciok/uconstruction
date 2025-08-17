import { GalleryItem, GalleryFilter } from '@/types/gallery';

// Simple blur data URLs for placeholder images
const BLUR_DATA_URLS = {
  default: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
  painting: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
  photo: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
  sculpture: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
  digital: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
};

export const galleryItems: GalleryItem[] = [
  {
    id: '1',
    title: 'Abstract Harmony',
    description: 'A vibrant exploration of color and form, inspired by natural landscapes.',
    imageUrl: '/assets/pics/main.png',
    blurDataURL: BLUR_DATA_URLS.painting,
    category: 'paintings',
    dimensions: '24" x 36"',
    medium: 'Acrylic on Canvas',
    year: 2023
  },
  {
    id: '2',
    title: 'Urban Reflections',
    description: 'Cityscape captured through the lens of contemporary urban life.',
    imageUrl: '/assets/pics/about.webp',
    blurDataURL: BLUR_DATA_URLS.photo,
    category: 'photography',
    dimensions: '16" x 20"',
    medium: 'Digital Photography',
    year: 2024
  },
  {
    id: '3',
    title: 'Sculptural Flow',
    description: 'Organic forms that seem to move and breathe with natural grace.',
    imageUrl: '/assets/pics/workshops.webp',
    blurDataURL: BLUR_DATA_URLS.sculpture,
    category: 'sculptures',
    dimensions: '18" x 12" x 8"',
    medium: 'Bronze',
    year: 2023
  },
  {
    id: '4',
    title: 'Digital Dreams',
    description: 'A journey through the intersection of technology and imagination.',
    imageUrl: '/assets/pics/workshops2.webp',
    blurDataURL: BLUR_DATA_URLS.digital,
    category: 'digital',
    dimensions: '1920 x 1080',
    medium: 'Digital Art',
    year: 2024
  },
  {
    id: '5',
    title: 'Watercolor Memories',
    description: 'Delicate brushstrokes capturing fleeting moments of beauty.',
    imageUrl: '/assets/pics/main.png',
    blurDataURL: BLUR_DATA_URLS.painting,
    category: 'paintings',
    dimensions: '11" x 14"',
    medium: 'Watercolor on Paper',
    year: 2023
  },
  {
    id: '6',
    title: 'Minimalist Composition',
    description: 'Less is more in this exploration of negative space and form.',
    imageUrl: '/assets/pics/about.webp',
    blurDataURL: BLUR_DATA_URLS.painting,
    category: 'paintings',
    dimensions: '30" x 40"',
    medium: 'Oil on Canvas',
    year: 2024
  },
  {
    id: '7',
    title: 'Ceramic Vessel',
    description: 'Traditional techniques meet contemporary design in functional art.',
    imageUrl: '/assets/pics/workshops.webp',
    blurDataURL: BLUR_DATA_URLS.sculpture,
    category: 'sculptures',
    dimensions: '12" x 8" x 8"',
    medium: 'Stoneware',
    year: 2023
  },
  {
    id: '8',
    title: 'Neon Nights',
    description: 'The electric energy of city nightlife captured in vivid detail.',
    imageUrl: '/assets/pics/workshops2.webp',
    blurDataURL: BLUR_DATA_URLS.photo,
    category: 'photography',
    dimensions: '20" x 16"',
    medium: 'Film Photography',
    year: 2024
  },
  {
    id: '9',
    title: 'Interactive Installation',
    description: 'Art that responds to viewer presence and movement.',
    imageUrl: '/assets/pics/main.png',
    blurDataURL: BLUR_DATA_URLS.digital,
    category: 'digital',
    dimensions: 'Variable',
    medium: 'Mixed Media',
    year: 2024
  },
  {
    id: '10',
    title: 'Textured Landscape',
    description: 'Layered textures create depth and dimension in this landscape study.',
    imageUrl: '/assets/pics/about.webp',
    blurDataURL: BLUR_DATA_URLS.painting,
    category: 'paintings',
    dimensions: '18" x 24"',
    medium: 'Mixed Media on Canvas',
    year: 2023
  },
  {
    id: '11',
    title: 'Metal Sculpture',
    description: 'Industrial materials transformed into flowing organic forms.',
    imageUrl: '/assets/pics/workshops.webp',
    blurDataURL: BLUR_DATA_URLS.sculpture,
    category: 'sculptures',
    dimensions: '24" x 18" x 12"',
    medium: 'Steel',
    year: 2024
  },
  {
    id: '12',
    title: 'Portrait Series',
    description: 'Intimate portraits revealing the human spirit through careful observation.',
    imageUrl: '/assets/pics/workshops2.webp',
    blurDataURL: BLUR_DATA_URLS.photo,
    category: 'photography',
    dimensions: '14" x 11"',
    medium: 'Black & White Photography',
    year: 2023
  }
];

export const galleryFilters: GalleryFilter[] = [
  { category: 'all', label: 'All Works' },
  { category: 'paintings', label: 'Paintings' },
  { category: 'sculptures', label: 'Sculptures' },
  { category: 'photography', label: 'Photography' },
  { category: 'digital', label: 'Digital Art' }
];

export const getFilteredItems = (category: string): GalleryItem[] => {
  if (category === 'all') {
    return galleryItems;
  }
  return galleryItems.filter(item => item.category === category);
};

export const getCategories = (): string[] => {
  return [...new Set(galleryItems.map(item => item.category))];
};
