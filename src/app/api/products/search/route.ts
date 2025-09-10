import { NextRequest } from 'next/server';
import { ProductService } from '@/lib/product-service';
import { parseSearchParams } from '@/lib/product-filter-parser';
import { apiLogger } from '@/lib/logger';
import { 
  createSuccessResponse, 
  ApiErrors 
} from '@/lib/api-response';

/**
 * GET /api/products/search - Search products by query
 */
export async function GET(request: NextRequest) {
  const productService = new ProductService();

  try {
    // Parse and validate all parameters including search query
    const { params, error } = parseSearchParams(request);
    if (error) return error;

    // Perform search
    const result = await productService.searchProducts(
      params.query,
      params.filters,
      params.pagination
    );

    return createSuccessResponse({
      products: result.products,
      query: params.query,
      totalResults: result.totalResults,
      searchTime: result.searchTime,
      filters: params.filters,
      pagination: params.paginationMeta,
    });
  } catch (error) {
    apiLogger.error('Error searching products', error);
    return ApiErrors.serverError(
      'Failed to search products',
      error instanceof Error ? error.message : String(error)
    );
  }
}
