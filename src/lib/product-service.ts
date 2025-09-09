import { prisma } from '@/lib/db';
import type {
  ProductWithRelations,
  ProductFilters,
  ProductSortOptions,
  PaginationOptions,
  ProductListResult,
  ProductSearchResult,
  ProductCategory,
  ProductTag,
  ProductStats,
  ProductServiceError,
} from '@/types/product';

export class ProductService {
  private prisma = prisma;

  constructor() {
    // Use singleton PrismaClient instance
  }

  /**
   * Get products with filtering, sorting, and pagination
   */
  async getProducts(
    filters: ProductFilters = {},
    sort: ProductSortOptions = { field: 'updatedAt', direction: 'desc' },
    pagination: PaginationOptions = { take: 20 }
  ): Promise<ProductListResult> {
    try {
      const where = this.buildWhereClause(filters);
      const orderBy = this.buildOrderByClause(sort);

      const products = await this.prisma.product.findMany({
        where,
        orderBy,
        take: pagination.take ? pagination.take + 1 : 21, // Take one extra to check if there are more
        cursor: pagination.cursor
          ? { id: parseInt(pagination.cursor) }
          : undefined,
        skip: pagination.cursor ? 1 : 0,
        include: {
          variants: true,
          media: {
            orderBy: { position: 'asc' },
          },
          productTags: {
            include: {
              tag: true,
            },
          },
          productCollections: {
            include: {
              collection: true,
            },
          },
        },
      });

      const take = pagination.take || 20;
      const hasMore = products.length > take;
      const resultProducts = hasMore ? products.slice(0, -1) : products;

      return {
        products: resultProducts as ProductWithRelations[],
        hasMore,
        nextCursor:
          hasMore && resultProducts.length > 0
            ? resultProducts[resultProducts.length - 1].id.toString()
            : undefined,
      };
    } catch (error) {
      this.handleError('Failed to get products', error);
      throw error;
    }
  }

  /**
   * Get a single product by ID
   */
  async getProductById(id: number): Promise<ProductWithRelations | null> {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id },
        include: {
          variants: true,
          media: {
            orderBy: { position: 'asc' },
          },
          productTags: {
            include: {
              tag: true,
            },
          },
          productCollections: {
            include: {
              collection: true,
            },
          },
        },
      });

      return product as ProductWithRelations | null;
    } catch (error) {
      this.handleError(`Failed to get product with ID ${id}`, error);
      throw error;
    }
  }

  /**
   * Get a single product by handle
   */
  async getProductByHandle(
    handle: string
  ): Promise<ProductWithRelations | null> {
    try {
      const product = await this.prisma.product.findUnique({
        where: { handle },
        include: {
          variants: true,
          media: {
            orderBy: { position: 'asc' },
          },
          productTags: {
            include: {
              tag: true,
            },
          },
          productCollections: {
            include: {
              collection: true,
            },
          },
        },
      });

      return product as ProductWithRelations | null;
    } catch (error) {
      this.handleError(`Failed to get product with handle ${handle}`, error);
      throw error;
    }
  }

  /**
   * Search products by text query
   */
  async searchProducts(
    query: string,
    filters: ProductFilters = {},
    pagination: PaginationOptions = { take: 20 }
  ): Promise<ProductSearchResult> {
    const startTime = Date.now();

    try {
      if (!query.trim()) {
        return {
          products: [],
          searchTime: Date.now() - startTime,
          totalResults: 0,
        };
      }

      const where = {
        ...this.buildWhereClause(filters),
        OR: [
          { title: { contains: query, mode: 'insensitive' as const } },
          { bodyHtml: { contains: query, mode: 'insensitive' as const } },
          { handle: { contains: query, mode: 'insensitive' as const } },
          { vendor: { contains: query, mode: 'insensitive' as const } },
          { productType: { contains: query, mode: 'insensitive' as const } },
          {
            productTags: {
              some: {
                tag: {
                  name: { contains: query, mode: 'insensitive' as const },
                },
              },
            },
          },
        ],
      };

      const products = await this.prisma.product.findMany({
        where,
        take: pagination.take || 20,
        cursor: pagination.cursor
          ? { id: parseInt(pagination.cursor) }
          : undefined,
        skip: pagination.cursor ? 1 : 0,
        include: {
          variants: true,
          media: {
            orderBy: { position: 'asc' },
          },
          productTags: {
            include: {
              tag: true,
            },
          },
          productCollections: {
            include: {
              collection: true,
            },
          },
        },
        orderBy: [{ title: 'asc' }, { updatedAt: 'desc' }],
      });

      const totalResults = await this.prisma.product.count({ where });

      return {
        products: products as ProductWithRelations[],
        searchTime: Date.now() - startTime,
        totalResults,
      };
    } catch (error) {
      this.handleError(`Failed to search products with query: ${query}`, error);
      throw error;
    }
  }

  /**
   * Get all product categories (collections)
   */
  async getCategories(): Promise<ProductCategory[]> {
    try {
      const collections = await this.prisma.collection.findMany({
        include: {
          _count: {
            select: {
              productCollections: true,
            },
          },
        },
        orderBy: { title: 'asc' },
      });

      return collections.map((collection) => ({
        id: collection.id,
        name: collection.title,
        handle: collection.handle,
        productCount: collection._count.productCollections,
        description: collection.bodyHtml || undefined,
      }));
    } catch (error) {
      this.handleError('Failed to get categories', error);
      throw error;
    }
  }

  /**
   * Get all product tags
   */
  async getTags(): Promise<ProductTag[]> {
    try {
      const tags = await this.prisma.tag.findMany({
        include: {
          _count: {
            select: {
              productTags: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      });

      return tags.map((tag) => ({
        id: tag.id,
        name: tag.name,
        productCount: tag._count.productTags,
      }));
    } catch (error) {
      this.handleError('Failed to get tags', error);
      throw error;
    }
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(
    categoryHandle: string,
    pagination: PaginationOptions = { take: 20 }
  ): Promise<ProductListResult> {
    try {
      const products = await this.prisma.product.findMany({
        where: {
          productCollections: {
            some: {
              collection: {
                handle: categoryHandle,
              },
            },
          },
          deletedAt: null,
        },
        take: pagination.take ? pagination.take + 1 : 21,
        cursor: pagination.cursor
          ? { id: parseInt(pagination.cursor) }
          : undefined,
        skip: pagination.cursor ? 1 : 0,
        include: {
          variants: true,
          media: {
            orderBy: { position: 'asc' },
          },
          productTags: {
            include: {
              tag: true,
            },
          },
          productCollections: {
            include: {
              collection: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });

      const take = pagination.take || 20;
      const hasMore = products.length > take;
      const resultProducts = hasMore ? products.slice(0, -1) : products;

      return {
        products: resultProducts as ProductWithRelations[],
        hasMore,
        nextCursor:
          hasMore && resultProducts.length > 0
            ? resultProducts[resultProducts.length - 1].id.toString()
            : undefined,
      };
    } catch (error) {
      this.handleError(
        `Failed to get products by category: ${categoryHandle}`,
        error
      );
      throw error;
    }
  }

  /**
   * Get product statistics
   */
  async getStats(): Promise<ProductStats> {
    try {
      const [
        totalProducts,
        publishedProducts,
        draftProducts,
        archivedProducts,
        totalVariants,
        totalMedia,
      ] = await Promise.all([
        this.prisma.product.count({ where: { deletedAt: null } }),
        this.prisma.product.count({
          where: { status: 'ACTIVE', deletedAt: null },
        }),
        this.prisma.product.count({
          where: { status: 'DRAFT', deletedAt: null },
        }),
        this.prisma.product.count({
          where: { status: 'ARCHIVED', deletedAt: null },
        }),
        this.prisma.variant.count(),
        this.prisma.productMedia.count(),
      ]);

      return {
        totalProducts,
        publishedProducts,
        draftProducts,
        archivedProducts,
        totalVariants,
        totalMedia,
      };
    } catch (error) {
      this.handleError('Failed to get product stats', error);
      throw error;
    }
  }

  /**
   * Build WHERE clause for database queries
   */
  private buildWhereClause(filters: ProductFilters) {
    const where: Record<string, unknown> = {
      deletedAt: null,
    };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.publishedOnly) {
      where.status = 'ACTIVE';
      where.publishedAt = { not: null };
    }

    if (filters.vendor) {
      where.vendor = filters.vendor;
    }

    if (filters.productType) {
      where.productType = filters.productType;
    }

    if (filters.category) {
      where.productCollections = {
        some: {
          collection: {
            handle: filters.category,
          },
        },
      };
    }

    if (filters.tags && filters.tags.length > 0) {
      where.productTags = {
        some: {
          tag: {
            name: { in: filters.tags },
          },
        },
      };
    }

    if (filters.priceRange) {
      where.variants = {
        some: {
          priceAmount: {
            gte: filters.priceRange.min.toString(),
            lte: filters.priceRange.max.toString(),
          },
        },
      };
    }

    return where;
  }

  /**
   * Build ORDER BY clause for database queries
   */
  private buildOrderByClause(sort: ProductSortOptions) {
    return {
      [sort.field]: sort.direction,
    };
  }

  /**
   * Get product count with filters (optimized for counting without fetching data)
   */
  async getProductCount(filters: ProductFilters = {}): Promise<number> {
    try {
      const where = this.buildWhereClause(filters);
      
      return await this.prisma.product.count({
        where
      });
    } catch (error) {
      this.handleError('Failed to get product count', error);
      return 0;
    }
  }

  /**
   * Handle and log errors consistently
   */
  private handleError(message: string, error: unknown): void {
    const errorDetails: ProductServiceError = {
      code: 'DATABASE_ERROR',
      message,
      details: error,
    };

    if (error instanceof Error) {
      if (error.message.includes('Record to update not found')) {
        errorDetails.code = 'NOT_FOUND';
      } else if (error.message.includes('Invalid')) {
        errorDetails.code = 'INVALID_INPUT';
      }
    }

    console.error(`[ProductService] ${message}:`, error);
  }

  /**
   * Note: No disconnect method needed when using singleton PrismaClient
   * The singleton instance is managed globally and cleaned up on process exit
   */
}
