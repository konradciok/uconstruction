import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/lib/product-service';

/**
 * GET /api/products/tags - Get all product tags with counts
 */
export async function GET(request: NextRequest) {
  const productService = new ProductService();

  try {
    // Fetch tags with product counts
    const tags = await productService.getTags();

    return NextResponse.json(
      {
        success: true,
        data: {
          tags,
        },
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error('[API] Error fetching tags:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch tags',
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  } finally {
    await productService.disconnect();
  }
}
