import { NextRequest } from 'next/server';
import { ProductService } from '@/lib/product-service';
import { 
  validateSearchQuery,
  validatePriceRange, 
  validatePagination,
  handleValidationError 
} from '@/lib/param-validators';
import { 
  createSuccessResponse, 
  ApiErrors 
} from '@/lib/api-response';
import type { ProductFilters } from '@/types/product';

/**
 * GET /api/products/search - Search products by query
 */
export async function GET(request: NextRequest) {
  const productService = new ProductService();

  try {
    const { searchParams } = new URL(request.url);

    // Validate search query
    const queryValidation = validateSearchQuery(searchParams.get('q') || undefined);
    const queryError = handleValidationError(queryValidation);
    if (queryError) return queryError;
    
    const query = queryValidation.value!;

    // Build optional filters (same as main products endpoint)
    const filters: ProductFilters = {};

    if (searchParams.get('category')) {
      filters.category = searchParams.get('category') as string;
    }

    if (searchParams.get('status')) {
      filters.status = searchParams.get('status') as string;
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

    // Validate pagination
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

    // Perform search
    const result = await productService.searchProducts(
      query,
      filters,
      pagination
    );

    return createSuccessResponse({
      products: result.products,
      query,
      totalResults: result.totalResults,
      searchTime: result.searchTime,
      filters: filters,
      pagination: {
        limit: paginationValidation.value!.limit,
        cursor: paginationValidation.value!.cursor || null,
      },
    });
  } catch (error) {
    console.error('[API] Error searching products:', error);
    return ApiErrors.serverError(
      'Failed to search products',
      error instanceof Error ? error.message : String(error)
    );
  }
}
