import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/lib/product-service';
import type { ProductFilters } from '@/types/product';

/**
 * GET /api/products/search - Search products by query
 */
export async function GET(request: NextRequest) {
  const productService = new ProductService();

  try {
    const { searchParams } = new URL(request.url);
    
    // Get and validate search query
    const query = searchParams.get('q')?.trim();
    
    if (!query) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Search query parameter "q" is required',
          },
        },
        { status: 400 }
      );
    }

    if (query.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Search query must be at least 2 characters long',
          },
        },
        { status: 400 }
      );
    }

    if (query.length > 100) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Search query must not exceed 100 characters',
          },
        },
        { status: 400 }
      );
    }

    // Build optional filters (same as main products endpoint)
    const filters: ProductFilters = {};
    
    if (searchParams.get('category')) {
      filters.category = searchParams.get('category') as string;
    }
    
    if (searchParams.get('status')) {
      filters.status = searchParams.get('status') as string;
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

    // Handle pagination
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? Math.min(Math.max(parseInt(limitParam), 1), 100) : 20;
    const cursor = searchParams.get('cursor') || undefined;
    
    const pagination = {
      cursor,
      take: limit,
    };

    // Perform search
    const result = await productService.searchProducts(query, filters, pagination);

    return NextResponse.json({
      success: true,
      data: {
        products: result.products,
        query,
        totalResults: result.totalResults,
        searchTime: result.searchTime,
        filters: filters,
        pagination: {
          limit,
          cursor: cursor || null,
        },
      },
    });

  } catch (error) {
    console.error('[API] Error searching products:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to search products',
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  } finally {
    await productService.disconnect();
  }
}