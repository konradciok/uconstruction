import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/lib/product-service';

/**
 * GET /api/products/categories - Get all product categories with counts
 */
export async function GET(request: NextRequest) {
  const productService = new ProductService();

  try {
    // Fetch categories with product counts
    const categories = await productService.getCategories();

    return NextResponse.json(
      {
        success: true,
        data: {
          categories,
        },
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error('[API] Error fetching categories:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch categories',
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  } finally {
    await productService.disconnect();
  }
}
