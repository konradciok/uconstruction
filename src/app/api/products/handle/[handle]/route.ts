import { NextRequest } from 'next/server';
import { ProductService } from '@/lib/product-service';
import { validateProductHandle, handleValidationError } from '@/lib/param-validators';
import { createSuccessResponse, ApiErrors } from '@/lib/api-response';

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
    const handleValidation = validateProductHandle(resolvedParams.handle);
    const handleError = handleValidationError(handleValidation);
    if (handleError) return handleError;
    
    const handle = handleValidation.value!;

    // Fetch product
    const product = await productService.getProductByHandle(handle);

    if (!product) {
      return ApiErrors.notFound('Product not found');
    }

    return createSuccessResponse({
      product,
    });
  } catch (error) {
    console.error(`[API] Error fetching product by handle:`, error);
    return ApiErrors.serverError(
      'Failed to fetch product',
      error instanceof Error ? error.message : String(error)
    );
  }
}
