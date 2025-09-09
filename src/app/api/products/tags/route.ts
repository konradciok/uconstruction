import { NextRequest } from 'next/server';
import { ProductService } from '@/lib/product-service';
import { createSuccessResponse, ApiErrors } from '@/lib/api-response';

/**
 * GET /api/products/tags - Get all product tags with counts
 */
export async function GET(_request: NextRequest) {
  const productService = new ProductService();

  try {
    // Fetch tags with product counts
    const tags = await productService.getTags();

    return createSuccessResponse(
      { tags },
      200,
      {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      }
    );
  } catch (error) {
    console.error('[API] Error fetching tags:', error);
    return ApiErrors.serverError(
      'Failed to fetch tags',
      error instanceof Error ? error.message : String(error)
    );
  }
}
