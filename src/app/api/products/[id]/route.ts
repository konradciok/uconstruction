import { NextRequest } from 'next/server';
import { ProductService } from '@/lib/product-service';
import { validateProductId, handleValidationError } from '@/lib/param-validators';
import { createSuccessResponse, ApiErrors } from '@/lib/api-response';

/**
 * GET /api/products/[id] - Get single product by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const productService = new ProductService();

  try {
    // Validate ID parameter
    const resolvedParams = await params;
    const idValidation = validateProductId(resolvedParams.id);
    const idError = handleValidationError(idValidation);
    if (idError) return idError;
    
    const productId = parseInt(idValidation.value!);

    // Fetch product
    const product = await productService.getProductById(productId);

    if (!product) {
      return ApiErrors.notFound('Product not found');
    }

    return createSuccessResponse({
      product,
    });
  } catch (error) {
    console.error(`[API] Error fetching product:`, error);
    return ApiErrors.serverError(
      'Failed to fetch product',
      error instanceof Error ? error.message : String(error)
    );
  }
}
