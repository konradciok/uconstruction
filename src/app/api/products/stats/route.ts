import { NextRequest } from 'next/server';
import { ProductService } from '@/lib/product-service';
import { createSuccessResponse, ApiErrors } from '@/lib/api-response';

/**
 * GET /api/products/stats - Get product statistics
 */
export async function GET(_request: NextRequest) {
  const productService = new ProductService();

  try {
    // Fetch comprehensive product statistics
    const stats = await productService.getStats();

    return createSuccessResponse(
      stats,
      200,
      {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      }
    );
  } catch (error) {
    console.error('[API] Error fetching product stats:', error);
    return ApiErrors.serverError(
      'Failed to fetch product statistics',
      error instanceof Error ? error.message : String(error)
    );
  }
}
