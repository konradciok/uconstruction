import { NextRequest } from 'next/server';
import { ProductService } from '@/lib/product-service';
import { createSuccessResponse, ApiErrors } from '@/lib/api-response';

/**
 * GET /api/products/categories - Get all product categories with counts
 */
export async function GET(_request: NextRequest) {
  const productService = new ProductService();

  try {
    // Fetch categories with product counts
    const categories = await productService.getCategories();

    return createSuccessResponse(
      { categories },
      200,
      {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      }
    );
  } catch (error) {
    console.error('[API] Error fetching categories:', error);
    return ApiErrors.serverError(
      'Failed to fetch categories',
      error instanceof Error ? error.message : String(error)
    );
  }
}
