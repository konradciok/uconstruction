import { NextRequest } from 'next/server';
import { ProductService } from '@/lib/product-service';
import { 
  validatePriceRange, 
  validatePagination, 
  validateSort,
  handleValidationError 
} from '@/lib/param-validators';
import { 
  createSuccessResponse, 
  ApiErrors 
} from '@/lib/api-response';
import type { ProductFilters, ProductSortOptions } from '@/types/product';

/**
 * GET /api/products - List products with filtering and pagination
 */
export async function GET(request: NextRequest) {
  const productService = new ProductService();

  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);

    // Build filters from query parameters
    const filters: ProductFilters = {};

    if (searchParams.get('category')) {
      filters.category = searchParams.get('category') as string;
    }

    if (searchParams.get('status')) {
      filters.status = searchParams.get('status') as string;
    }

    if (searchParams.get('vendor')) {
      filters.vendor = searchParams.get('vendor') as string;
    }

    if (searchParams.get('productType')) {
      filters.productType = searchParams.get('productType') as string;
    }

    if (searchParams.get('publishedOnly') === 'true') {
      filters.publishedOnly = true;
    }

    // Handle tags (comma-separated)
    const tagsParam = searchParams.get('tags');
    if (tagsParam) {
      filters.tags = tagsParam
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);
    }

    // Validate price range
    const priceRangeValidation = validatePriceRange(
      searchParams.get('minPrice') || null,
      searchParams.get('maxPrice') || null
    );
    const priceRangeError = handleValidationError(priceRangeValidation);
    if (priceRangeError) return priceRangeError;
    
    if (priceRangeValidation.value) {
      filters.priceRange = priceRangeValidation.value;
    }

    // Validate sort options
    const sortValidation = validateSort(
      searchParams.get('sortBy') || null,
      searchParams.get('sortOrder') || null
    );
    const sortError = handleValidationError(sortValidation);
    if (sortError) return sortError;
    
    const sort: ProductSortOptions = sortValidation.value!;

    // Validate pagination options
    const paginationValidation = validatePagination(
      searchParams.get('limit') || null,
      searchParams.get('cursor') || null
    );
    const paginationError = handleValidationError(paginationValidation);
    if (paginationError) return paginationError;
    
    const pagination = {
      cursor: paginationValidation.value!.cursor,
      take: paginationValidation.value!.limit,
    };

    // Fetch products
    const result = await productService.getProducts(filters, sort, pagination);

    return createSuccessResponse({
      products: result.products,
      hasMore: result.hasMore,
      nextCursor: result.nextCursor,
      filters: filters,
      sort: sort,
      pagination: {
        limit: paginationValidation.value!.limit,
        cursor: paginationValidation.value!.cursor || null,
      },
    });
  } catch (error) {
    console.error('[API] Error fetching products:', error);
    return ApiErrors.serverError(
      'Failed to fetch products',
      error instanceof Error ? error.message : String(error)
    );
  }
}
