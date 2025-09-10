import { NextRequest } from 'next/server';
import { ProductService } from '@/lib/product-service';
import { parseProductParams } from '@/lib/product-filter-parser';
import { apiLogger } from '@/lib/logger';
import { 
  createSuccessResponse, 
  ApiErrors 
} from '@/lib/api-response';

/**
 * GET /api/products - List products with filtering and pagination
 * POST /api/products - Create a new product
 */
export async function GET(request: NextRequest) {
  const productService = new ProductService();

  try {
    // Parse and validate all parameters
    const { params, error } = parseProductParams(request);
    if (error) return error;

    // Fetch products
    const result = await productService.getProducts(
      params.filters, 
      params.sort, 
      params.pagination
    );

    return createSuccessResponse({
      products: result.products,
      hasMore: result.hasMore,
      nextCursor: result.nextCursor,
      filters: params.filters,
      sort: params.sort,
      pagination: params.paginationMeta,
    });
  } catch (error) {
    apiLogger.error('Error fetching products', error);
    return ApiErrors.serverError(
      'Failed to fetch products',
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * POST /api/products - Create a new product
 */
export async function POST(request: NextRequest) {
  const productService = new ProductService();

  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.handle) {
      return ApiErrors.invalidInput('Title and handle are required');
    }

    // Create product using ProductService
    // Note: This would need to be implemented in ProductService
    // For now, return a placeholder response
    return createSuccessResponse({
      message: 'Product creation endpoint - implementation needed',
      product: {
        id: Date.now(), // Temporary ID
        title: body.title,
        handle: body.handle,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      }
    }, 201);
  } catch (error) {
    apiLogger.error('Error creating product', error);
    return ApiErrors.serverError(
      'Failed to create product',
      error instanceof Error ? error.message : String(error)
    );
  }
}
