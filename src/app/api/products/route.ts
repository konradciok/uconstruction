import { NextRequest } from 'next/server';
import { ProductService } from '@/lib/product-service';
import { parseProductParams } from '@/lib/product-filter-parser';
import { apiLogger } from '@/lib/logger';
import { 
  createSuccessResponse, 
  ApiErrors 
} from '@/lib/api-response';

/**
 * GET /api/products - List products with filtering and pagination
 */
export async function GET(request: NextRequest) {
  const productService = new ProductService();

  try {
    // Parse and validate all parameters
    const { params, error } = parseProductParams(request);
    if (error) return error;

    // Fetch products
    const result = await productService.getProducts(
      params.filters, 
      params.sort, 
      params.pagination
    );

    return createSuccessResponse({
      products: result.products,
      hasMore: result.hasMore,
      nextCursor: result.nextCursor,
      filters: params.filters,
      sort: params.sort,
      pagination: params.paginationMeta,
    });
  } catch (error) {
    apiLogger.error('Error fetching products', error);
    return ApiErrors.serverError(
      'Failed to fetch products',
      error instanceof Error ? error.message : String(error)
    );
  }
}
