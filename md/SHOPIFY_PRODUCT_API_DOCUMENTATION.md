# Shopify Product API Documentation

## Overview

Complete REST API for the Shopify Product Base system, providing access to product data, search functionality, filtering, and metadata.

**Base URL:** `/api/products`  
**Response Format:** JSON  
**Authentication:** None required (public endpoints)

## API Endpoints

### 1. List Products

Get a paginated list of products with filtering and sorting options.

**Endpoint:** `GET /api/products`

**Query Parameters:**

| Parameter       | Type    | Description                  | Example                                          |
| --------------- | ------- | ---------------------------- | ------------------------------------------------ |
| `category`      | string  | Filter by category handle    | `paintings`                                      |
| `status`        | string  | Filter by product status     | `active`, `draft`, `archived`                    |
| `vendor`        | string  | Filter by vendor/artist name | `UConstruction Artist`                           |
| `productType`   | string  | Filter by product type       | `Painting`, `Drawing`                            |
| `publishedOnly` | boolean | Show only published products | `true`                                           |
| `tags`          | string  | Comma-separated list of tags | `landscape,oil,watercolor`                       |
| `minPrice`      | number  | Minimum price filter         | `100`                                            |
| `maxPrice`      | number  | Maximum price filter         | `500`                                            |
| `sortBy`        | string  | Sort field                   | `title`, `createdAt`, `updatedAt`, `publishedAt` |
| `sortOrder`     | string  | Sort direction               | `asc`, `desc`                                    |
| `limit`         | number  | Results per page (1-100)     | `20`                                             |
| `cursor`        | string  | Pagination cursor            | `123`                                            |

**Example Request:**

```
GET /api/products?category=paintings&tags=landscape,oil&minPrice=100&maxPrice=500&limit=10
```

**Response:**

```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 1,
        "shopifyId": "gid://shopify/Product/1",
        "handle": "watercolor-landscape-sunset",
        "title": "Watercolor Landscape - Golden Sunset",
        "vendor": "UConstruction Artist",
        "status": "active",
        "variants": [
          {
            "id": 1,
            "title": "Original Size",
            "priceAmount": "450.00",
            "priceCurrency": "USD"
          }
        ],
        "media": [
          {
            "id": 1,
            "url": "https://example.com/image.jpg",
            "altText": "Watercolor painting of golden sunset"
          }
        ],
        "productTags": [
          {
            "tag": {
              "name": "landscape"
            }
          }
        ]
      }
    ],
    "hasMore": true,
    "nextCursor": "123",
    "filters": {
      "category": "paintings",
      "tags": ["landscape", "oil"],
      "priceRange": {
        "min": 100,
        "max": 500
      }
    }
  }
}
```

### 2. Get Single Product by ID

Retrieve a single product by its numeric ID.

**Endpoint:** `GET /api/products/[id]`

**Parameters:**

- `id` (required): Numeric product ID

**Example Request:**

```
GET /api/products/123
```

**Response:**

```json
{
  "success": true,
  "data": {
    "product": {
      "id": 123,
      "shopifyId": "gid://shopify/Product/123",
      "title": "Abstract Blue Composition",
      "vendor": "UConstruction Artist",
      "variants": [...],
      "media": [...],
      "productTags": [...],
      "productCollections": [...]
    }
  }
}
```

### 3. Get Single Product by Handle

Retrieve a single product by its URL handle.

**Endpoint:** `GET /api/products/handle/[handle]`

**Parameters:**

- `handle` (required): Product URL handle

**Example Request:**

```
GET /api/products/handle/watercolor-landscape-sunset
```

**Response:** Same as single product by ID

### 4. Search Products

Full-text search across product fields with optional filtering.

**Endpoint:** `GET /api/products/search`

**Query Parameters:**

| Parameter  | Type   | Required | Description                     |
| ---------- | ------ | -------- | ------------------------------- |
| `q`        | string | Yes      | Search query (2-100 characters) |
| `category` | string | No       | Filter by category              |
| `status`   | string | No       | Filter by status                |
| `tags`     | string | No       | Filter by tags                  |
| `minPrice` | number | No       | Minimum price                   |
| `maxPrice` | number | No       | Maximum price                   |
| `limit`    | number | No       | Results limit (1-100)           |
| `cursor`   | string | No       | Pagination cursor               |

**Example Request:**

```
GET /api/products/search?q=landscape&category=paintings&limit=5
```

**Response:**

```json
{
  "success": true,
  "data": {
    "products": [...],
    "query": "landscape",
    "totalResults": 42,
    "searchTime": 156,
    "filters": {
      "category": "paintings"
    }
  }
}
```

### 5. Get Product Categories

List all product categories with product counts.

**Endpoint:** `GET /api/products/categories`

**Response:**

```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": 1,
        "name": "Paintings",
        "handle": "paintings",
        "productCount": 25,
        "description": "Original paintings and artworks"
      },
      {
        "id": 2,
        "name": "Drawings",
        "handle": "drawings",
        "productCount": 12,
        "description": "Sketches and drawings"
      }
    ]
  }
}
```

**Cache Headers:** `Cache-Control: public, s-maxage=300, stale-while-revalidate=600`

### 6. Get Product Tags

List all product tags with product counts.

**Endpoint:** `GET /api/products/tags`

**Response:**

```json
{
  "success": true,
  "data": {
    "tags": [
      {
        "id": 1,
        "name": "landscape",
        "productCount": 15
      },
      {
        "id": 2,
        "name": "watercolor",
        "productCount": 8
      }
    ]
  }
}
```

**Cache Headers:** `Cache-Control: public, s-maxage=300, stale-while-revalidate=600`

### 7. Get Product Statistics

Comprehensive product statistics for dashboard/admin use.

**Endpoint:** `GET /api/products/stats`

**Response:**

```json
{
  "success": true,
  "data": {
    "totalProducts": 45,
    "publishedProducts": 38,
    "draftProducts": 5,
    "archivedProducts": 2,
    "totalVariants": 67,
    "totalMedia": 156
  }
}
```

**Cache Headers:** `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`

## Error Responses

All endpoints follow a consistent error response format:

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Product not found",
    "details": "Additional error information (optional)"
  }
}
```

### Error Codes

| Code            | HTTP Status | Description                |
| --------------- | ----------- | -------------------------- |
| `NOT_FOUND`     | 404         | Resource not found         |
| `INVALID_INPUT` | 400         | Invalid request parameters |
| `SERVER_ERROR`  | 500         | Internal server error      |

### Validation Rules

**Search Query (`q` parameter):**

- Minimum 2 characters
- Maximum 100 characters
- Trimmed automatically

**Price Range:**

- Must be positive numbers
- `minPrice` must be <= `maxPrice`
- Invalid ranges are ignored

**Pagination:**

- `limit`: 1-100, default 20
- `cursor`: Numeric string for pagination

**Product Handle:**

- Must contain only alphanumeric characters, hyphens, and underscores
- Case-insensitive matching

## Response Times & Caching

| Endpoint       | Target Response Time | Cache Duration     |
| -------------- | -------------------- | ------------------ |
| List Products  | < 200ms              | No cache (dynamic) |
| Single Product | < 100ms              | No cache (dynamic) |
| Search         | < 200ms              | No cache (dynamic) |
| Categories     | < 100ms              | 5 minutes          |
| Tags           | < 100ms              | 5 minutes          |
| Stats          | < 150ms              | 1 minute           |

## Rate Limiting

Currently no rate limiting implemented. Consider implementing for production use:

- 1000 requests per hour per IP
- 100 requests per minute per IP
- Burst allowance of 20 requests

## Integration Examples

### Frontend Integration

```typescript
// Fetch products with filtering
const response = await fetch(
  '/api/products?' +
    new URLSearchParams({
      category: 'paintings',
      tags: 'landscape,oil',
      limit: '20',
    })
);
const data = await response.json();

if (data.success) {
  console.log(data.data.products);
} else {
  console.error(data.error.message);
}
```

### Search Integration

```typescript
// Debounced search implementation
const searchProducts = useMemo(
  () =>
    debounce(async (query: string) => {
      if (query.length < 2) return;

      const response = await fetch(
        `/api/products/search?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();

      if (data.success) {
        setSearchResults(data.data.products);
        setSearchTime(data.data.searchTime);
      }
    }, 300),
  []
);
```

### Filter Integration

```typescript
// Build filter URL from ProductFilters interface
const buildFilterUrl = (filters: ProductFilters) => {
  const params = new URLSearchParams();

  if (filters.search) params.set('q', filters.search);
  if (filters.category) params.set('category', filters.category);
  if (filters.tags) params.set('tags', filters.tags.join(','));
  if (filters.priceRange) {
    params.set('minPrice', filters.priceRange.min.toString());
    params.set('maxPrice', filters.priceRange.max.toString());
  }

  return `/api/products?${params.toString()}`;
};
```

## Performance Considerations

### Database Optimization

- All queries use proper indexing on `shopifyId`, `handle`, `status`
- Efficient joins minimize N+1 query problems
- Cursor-based pagination for large datasets

### Caching Strategy

- Static data (categories, tags) cached for 5 minutes
- Dynamic data (products, search) not cached due to frequent updates
- Response compression enabled
- CDN-friendly cache headers

### Monitoring

- Response time tracking for all endpoints
- Error rate monitoring
- Database query performance metrics
- Memory usage monitoring for large result sets

## Future Enhancements

### Planned Features

- GraphQL endpoint for advanced queries
- Real-time updates via WebSockets
- Advanced search with faceted filtering
- Bulk operations endpoints
- Export functionality (CSV, JSON)

### Performance Improvements

- Redis caching layer
- Database read replicas
- Response compression optimization
- CDN integration for static assets
