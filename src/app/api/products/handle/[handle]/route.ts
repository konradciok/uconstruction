import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/lib/product-service';

/**
 * GET /api/products/handle/[handle] - Get single product by handle
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const productService = new ProductService();

  try {
    // Await params and validate handle parameter
    const resolvedParams = await params;
    const handle = resolvedParams.handle?.trim();

    if (!handle) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Product handle is required',
          },
        },
        { status: 400 }
      );
    }

    // Basic handle validation (URL-safe characters)
    if (!/^[a-z0-9\-_]+$/i.test(handle)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Product handle contains invalid characters',
          },
        },
        { status: 400 }
      );
    }

    // Fetch product
    const product = await productService.getProductByHandle(handle);

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
    console.error(`[API] Error fetching product by handle:`, error);

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
