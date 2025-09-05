import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/lib/product-service';
import type { ProductFilters, ProductSortOptions } from '@/types/product';

/**
 * GET /api/products - List products with filtering and pagination
 */
export async function GET(request: NextRequest) {
  const productService = new ProductService();

  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    
    // Build filters from query parameters
    const filters: ProductFilters = {};
    
    if (searchParams.get('category')) {
      filters.category = searchParams.get('category') as string;
    }
    
    if (searchParams.get('status')) {
      filters.status = searchParams.get('status') as string;
    }
    
    if (searchParams.get('vendor')) {
      filters.vendor = searchParams.get('vendor') as string;
    }
    
    if (searchParams.get('productType')) {
      filters.productType = searchParams.get('productType') as string;
    }
    
    if (searchParams.get('publishedOnly') === 'true') {
      filters.publishedOnly = true;
    }
    
    // Handle tags (comma-separated)
    const tagsParam = searchParams.get('tags');
    if (tagsParam) {
      filters.tags = tagsParam.split(',').map(tag => tag.trim()).filter(Boolean);
    }
    
    // Handle price range
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    if (minPrice && maxPrice) {
      const min = parseFloat(minPrice);
      const max = parseFloat(maxPrice);
      if (!isNaN(min) && !isNaN(max) && min >= 0 && max >= min) {
        filters.priceRange = { min, max };
      }
    }
    
    // Build sort options
    const sortField = searchParams.get('sortBy') || 'updatedAt';
    const sortDirection = searchParams.get('sortOrder') || 'desc';
    
    const sort: ProductSortOptions = {
      field: ['title', 'createdAt', 'updatedAt', 'publishedAt'].includes(sortField) 
        ? sortField as ProductSortOptions['field']
        : 'updatedAt',
      direction: ['asc', 'desc'].includes(sortDirection) 
        ? sortDirection as 'asc' | 'desc' 
        : 'desc'
    };
    
    // Build pagination options
    const cursor = searchParams.get('cursor') || undefined;
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? Math.min(Math.max(parseInt(limitParam), 1), 100) : 20;
    
    const pagination = {
      cursor,
      take: limit,
    };

    // Fetch products
    const result = await productService.getProducts(filters, sort, pagination);

    return NextResponse.json({
      success: true,
      data: {
        products: result.products,
        hasMore: result.hasMore,
        nextCursor: result.nextCursor,
        filters: filters,
        sort: sort,
        pagination: {
          limit,
          cursor: cursor || null,
        },
      },
    });

  } catch (error) {
    console.error('[API] Error fetching products:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch products',
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  } finally {
    await productService.disconnect();
  }
}