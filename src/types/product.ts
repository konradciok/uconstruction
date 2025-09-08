import type {
  Product as PrismaProduct,
  Variant,
  ProductMedia,
  Tag,
  Collection,
} from '@/generated/prisma';

export interface ProductWithRelations extends PrismaProduct {
  variants: Variant[];
  media: ProductMedia[];
  productTags: Array<{
    tag: Tag;
  }>;
  productCollections: Array<{
    collection: Collection;
  }>;
}

export interface ProductFilters {
  category?: string;
  tags?: string[];
  status?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  vendor?: string;
  productType?: string;
  publishedOnly?: boolean;
  search?: string;
}

export interface ProductSortOptions {
  field: 'title' | 'createdAt' | 'updatedAt' | 'publishedAt';
  direction: 'asc' | 'desc';
}

export interface PaginationOptions {
  cursor?: string;
  take?: number;
}

export interface ProductListResult {
  products: ProductWithRelations[];
  hasMore: boolean;
  nextCursor?: string;
  totalCount?: number;
}

export interface ProductSearchResult {
  products: ProductWithRelations[];
  searchTime: number;
  totalResults: number;
}

export interface ProductCategory {
  id: number;
  name: string;
  handle: string;
  productCount: number;
  description?: string;
}

export interface ProductTag {
  id: number;
  name: string;
  productCount: number;
}

export interface ProductStats {
  totalProducts: number;
  publishedProducts: number;
  draftProducts: number;
  archivedProducts: number;
  totalVariants: number;
  totalMedia: number;
}

export interface ProductServiceError {
  code: 'NOT_FOUND' | 'INVALID_INPUT' | 'DATABASE_ERROR' | 'UNKNOWN_ERROR';
  message: string;
  details?: unknown;
}
