import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/lib/product-service';

/**
 * GET /api/products/[id] - Get single product by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const productService = new ProductService();

  try {
    // Validate ID parameter
    const productId = parseInt(params.id);
    
    if (isNaN(productId) || productId <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Product ID must be a positive integer',
          },
        },
        { status: 400 }
      );
    }

    // Fetch product
    const product = await productService.getProductById(productId);

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Product not found',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        product,
      },
    });

  } catch (error) {
    console.error(`[API] Error fetching product ${params.id}:`, error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch product',
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  } finally {
    await productService.disconnect();
  }
}