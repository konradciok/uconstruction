import { ProductService } from '../product-service';
import type { PrismaClient } from '@/generated/prisma';

// Mock Prisma Client
const mockPrisma = {
  product: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
  },
  collection: {
    findMany: jest.fn(),
  },
  tag: {
    findMany: jest.fn(),
  },
  variant: {
    count: jest.fn(),
  },
  productMedia: {
    count: jest.fn(),
  },
  $disconnect: jest.fn(),
} as unknown as PrismaClient;

// Mock PrismaClient constructor
jest.mock('@/generated/prisma', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

describe('ProductService', () => {
  let productService: ProductService;

  beforeEach(() => {
    productService = new ProductService();
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await productService.disconnect();
  });

  describe('getProducts', () => {
    const mockProducts = [
      {
        id: 1,
        shopifyId: 'gid://shopify/Product/1',
        handle: 'test-product',
        title: 'Test Product',
        variants: [],
        media: [],
        productTags: [],
        productCollections: [],
      },
    ];

    it('should return products with default pagination', async () => {
      (mockPrisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts);

      const result = await productService.getProducts();

      expect(result.products).toEqual(mockProducts);
      expect(result.hasMore).toBe(false);
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        orderBy: { updatedAt: 'desc' },
        take: 21,
        cursor: undefined,
        skip: 0,
        include: expect.objectContaining({
          variants: true,
          media: { orderBy: { position: 'asc' } },
          productTags: { include: { tag: true } },
          productCollections: { include: { collection: true } },
        }),
      });
    });

    it('should handle pagination with cursor', async () => {
      (mockPrisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts);

      await productService.getProducts({}, undefined, { cursor: '10', take: 5 });

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 6,
          cursor: { id: 10 },
          skip: 1,
        })
      );
    });

    it('should apply filters correctly', async () => {
      (mockPrisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts);

      const filters = {
        status: 'active',
        category: 'paintings',
        tags: ['landscape', 'oil'],
        vendor: 'Artist Name',
        publishedOnly: true,
      };

      await productService.getProducts(filters);

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deletedAt: null,
            status: 'active',
            publishedAt: { not: null },
            vendor: 'Artist Name',
            productCollections: {
              some: { collection: { handle: 'paintings' } },
            },
            productTags: {
              some: { tag: { name: { in: ['landscape', 'oil'] } } },
            },
          }),
        })
      );
    });

    it('should handle price range filters', async () => {
      (mockPrisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts);

      const filters = {
        priceRange: { min: 100, max: 500 },
      };

      await productService.getProducts(filters);

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            variants: {
              some: {
                priceAmount: {
                  gte: '100',
                  lte: '500',
                },
              },
            },
          }),
        })
      );
    });

    it('should handle database errors', async () => {
      const error = new Error('Database connection failed');
      (mockPrisma.product.findMany as jest.Mock).mockRejectedValue(error);

      await expect(productService.getProducts()).rejects.toThrow(error);
    });
  });

  describe('getProductById', () => {
    const mockProduct = {
      id: 1,
      shopifyId: 'gid://shopify/Product/1',
      handle: 'test-product',
      title: 'Test Product',
      variants: [],
      media: [],
      productTags: [],
      productCollections: [],
    };

    it('should return product by ID', async () => {
      (mockPrisma.product.findUnique as jest.Mock).mockResolvedValue(mockProduct);

      const result = await productService.getProductById(1);

      expect(result).toEqual(mockProduct);
      expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: expect.objectContaining({
          variants: true,
          media: { orderBy: { position: 'asc' } },
          productTags: { include: { tag: true } },
          productCollections: { include: { collection: true } },
        }),
      });
    });

    it('should return null for non-existent product', async () => {
      (mockPrisma.product.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await productService.getProductById(999);

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      const error = new Error('Database connection failed');
      (mockPrisma.product.findUnique as jest.Mock).mockRejectedValue(error);

      await expect(productService.getProductById(1)).rejects.toThrow(error);
    });
  });

  describe('getProductByHandle', () => {
    const mockProduct = {
      id: 1,
      shopifyId: 'gid://shopify/Product/1',
      handle: 'test-product',
      title: 'Test Product',
      variants: [],
      media: [],
      productTags: [],
      productCollections: [],
    };

    it('should return product by handle', async () => {
      (mockPrisma.product.findUnique as jest.Mock).mockResolvedValue(mockProduct);

      const result = await productService.getProductByHandle('test-product');

      expect(result).toEqual(mockProduct);
      expect(mockPrisma.product.findUnique).toHaveBeenCalledWith({
        where: { handle: 'test-product' },
        include: expect.any(Object),
      });
    });
  });

  describe('searchProducts', () => {
    const mockProducts = [
      {
        id: 1,
        shopifyId: 'gid://shopify/Product/1',
        handle: 'landscape-painting',
        title: 'Beautiful Landscape',
        variants: [],
        media: [],
        productTags: [],
        productCollections: [],
      },
    ];

    it('should search products by query', async () => {
      (mockPrisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts);
      (mockPrisma.product.count as jest.Mock).mockResolvedValue(1);

      const result = await productService.searchProducts('landscape');

      expect(result.products).toEqual(mockProducts);
      expect(result.totalResults).toBe(1);
      expect(result.searchTime).toBeGreaterThan(0);
      
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deletedAt: null,
            OR: expect.arrayContaining([
              { title: { contains: 'landscape', mode: 'insensitive' } },
              { bodyHtml: { contains: 'landscape', mode: 'insensitive' } },
              { handle: { contains: 'landscape', mode: 'insensitive' } },
            ]),
          }),
        })
      );
    });

    it('should return empty results for empty query', async () => {
      const result = await productService.searchProducts('');

      expect(result.products).toEqual([]);
      expect(result.totalResults).toBe(0);
      expect(mockPrisma.product.findMany).not.toHaveBeenCalled();
    });

    it('should handle search with filters', async () => {
      (mockPrisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts);
      (mockPrisma.product.count as jest.Mock).mockResolvedValue(1);

      await productService.searchProducts('landscape', { status: 'active' });

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deletedAt: null,
            status: 'active',
            OR: expect.any(Array),
          }),
        })
      );
    });
  });

  describe('getCategories', () => {
    const mockCollections = [
      {
        id: 1,
        title: 'Paintings',
        handle: 'paintings',
        bodyHtml: '<p>Beautiful paintings</p>',
        _count: { productCollections: 5 },
      },
    ];

    it('should return categories with product counts', async () => {
      (mockPrisma.collection.findMany as jest.Mock).mockResolvedValue(mockCollections);

      const result = await productService.getCategories();

      expect(result).toEqual([
        {
          id: 1,
          name: 'Paintings',
          handle: 'paintings',
          productCount: 5,
          description: '<p>Beautiful paintings</p>',
        },
      ]);
    });
  });

  describe('getTags', () => {
    const mockTags = [
      {
        id: 1,
        name: 'landscape',
        _count: { productTags: 3 },
      },
    ];

    it('should return tags with product counts', async () => {
      (mockPrisma.tag.findMany as jest.Mock).mockResolvedValue(mockTags);

      const result = await productService.getTags();

      expect(result).toEqual([
        {
          id: 1,
          name: 'landscape',
          productCount: 3,
        },
      ]);
    });
  });

  describe('getStats', () => {
    it('should return product statistics', async () => {
      (mockPrisma.product.count as jest.Mock)
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(8)  // published
        .mockResolvedValueOnce(1)  // draft
        .mockResolvedValueOnce(1); // archived
      
      (mockPrisma.variant.count as jest.Mock).mockResolvedValue(15);
      (mockPrisma.productMedia.count as jest.Mock).mockResolvedValue(25);

      const result = await productService.getStats();

      expect(result).toEqual({
        totalProducts: 10,
        publishedProducts: 8,
        draftProducts: 1,
        archivedProducts: 1,
        totalVariants: 15,
        totalMedia: 25,
      });
    });
  });

  describe('error handling', () => {
    it('should handle and log errors consistently', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Test error');
      
      (mockPrisma.product.findMany as jest.Mock).mockRejectedValue(error);

      await expect(productService.getProducts()).rejects.toThrow(error);
      expect(consoleSpy).toHaveBeenCalledWith(
        '[ProductService] Failed to get products:',
        error
      );

      consoleSpy.mockRestore();
    });
  });

  describe('disconnect', () => {
    it('should disconnect from database', async () => {
      await productService.disconnect();
      expect(mockPrisma.$disconnect).toHaveBeenCalled();
    });
  });
});