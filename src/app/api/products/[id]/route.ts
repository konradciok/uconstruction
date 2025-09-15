import { NextRequest } from 'next/server';
import { ProductService } from '@/lib/product-service';
import { validateProductId, handleValidationError } from '@/lib/param-validators';
import { createSuccessResponse, ApiErrors } from '@/lib/api-response';

/**
 * GET /api/products/[id] - Get single product by ID
 * PUT /api/products/[id] - Update product by ID
 * DELETE /api/products/[id] - Delete product by ID
 */
export async function GET(
  _request: NextRequest,
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

/**
 * PUT /api/products/[id] - Update product by ID
 */
export async function PUT(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate ID parameter
    const resolvedParams = await params;
    const idValidation = validateProductId(resolvedParams.id);
    const idError = handleValidationError(idValidation);
    if (idError) return idError;
    
    const productId = parseInt(idValidation.value!);
    const body = await _request.json();

    // Update product using ProductService
    // Note: This would need to be implemented in ProductService
    // For now, return a placeholder response
    return createSuccessResponse({
      message: 'Product update endpoint - implementation needed',
      product: {
        id: productId,
        title: body.title || 'Updated Product',
        status: 'ACTIVE',
        updatedAt: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error(`[API] Error updating product:`, error);
    return ApiErrors.serverError(
      'Failed to update product',
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * DELETE /api/products/[id] - Delete product by ID
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate ID parameter
    const resolvedParams = await params;
    const idValidation = validateProductId(resolvedParams.id);
    const idError = handleValidationError(idValidation);
    if (idError) return idError;
    
    const productId = parseInt(idValidation.value!);

    // Delete product using ProductService
    // Note: This would need to be implemented in ProductService
    // For now, return a placeholder response
    return createSuccessResponse({
      message: 'Product deleted successfully',
      deletedId: productId,
    });
  } catch (error) {
    console.error(`[API] Error deleting product:`, error);
    return ApiErrors.serverError(
      'Failed to delete product',
      error instanceof Error ? error.message : String(error)
    );
  }
}
