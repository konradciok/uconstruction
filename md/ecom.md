# E-COMMERCE MODULE ARCHITECTURE

## Current Implementation Status

The ecommerce system is fully implemented and operational using a local database architecture with no external dependencies.

## System Architecture

### Data Layer

**Prisma Database Schema:**
- **Product**: Core product information (id, handle, title, status, vendor)
- **Variant**: Product variants with pricing and inventory (id, productId, price, sku, inventory)
- **Collection**: Product collections (id, handle, title, bodyHtml)
- **Tag**: Product categorization (id, name)
- **ProductMedia**: Product images and media (url, altText, position)
- **ProductOption**: Product options like size, color (name, position)
- **ProductCollection**: Many-to-many relationship between products and collections
- **ProductTag**: Many-to-many relationship between products and tags

### Service Layer

**ProductService** (`src/lib/product-service.ts`):
- `getProducts()` - List products with filtering, sorting, and pagination
- `getProduct()` - Get single product by ID
- `search()` - Search products by query
- `filter()` - Filter products by various criteria
- `getStats()` - Get product statistics

**TemplateAdapters** (`src/lib/template-adapters.ts`):
- `adaptProduct()` - Convert database models to template format
- `getFeatured()` - Get featured products
- `getShop()` - Get shop information
- `getByColl()` - Get products by collection

### API Layer

**Product API Routes** (`/api/products/`):
- `GET /` - List products with filtering and pagination
- `GET /[id]` - Get single product by ID
- `GET /search` - Search products
- `GET /stats` - Get product statistics
- `GET /categories` - Get product categories
- `GET /tags` - Get product tags
- `GET /handle/[handle]` - Get product by handle

**Template API Routes** (`/api/template/`):
- `GET /products` - Get template-formatted products
- `GET /collections` - Get collections
- `GET /tags` - Get tags
- `GET /collections/[handle]` - Get collection by handle

### Frontend Layer

**React Hooks:**
- `useProducts` - Product listing with filtering and pagination
- `useTemplateProducts` - Template-formatted product data
- `useSearchFilters` - Search and filter state management

**UI Components:**
- `ProductGrid` - Grid layout with pagination and load more
- `ThreeItemGrid` - Featured product display
- `SearchFilters` - Category, tag, and price filtering
- `AddToCart` - Add items to cart with variant selection
- `CartModal` - Cart viewing and management
- `CartContext` - Cart state management with localStorage persistence

**Pages:**
- `/shop` - Main shop page with product listing and filters
- `/product/[handle]` - Individual product detail page
- `/shop/[collection]` - Collection-specific product listing

## Key Features

✅ **Product Management**: Full CRUD operations for products, variants, collections, and tags
✅ **Advanced Filtering**: Category, tag, price range, and vendor filtering
✅ **Search Functionality**: Full-text search across product data
✅ **Shopping Cart**: Local state management with persistence
✅ **Responsive Design**: Mobile-first responsive layouts
✅ **TypeScript**: Full type safety throughout the application
✅ **Database Integration**: Prisma ORM with SQLite database
✅ **Next.js App Router**: Modern Next.js architecture with server components

## Data Flow

1. **Database → Services → API → Hooks → Components**
   - Template adapters convert Prisma models to frontend format
   - API routes provide REST endpoints
   - React hooks manage state and data fetching
   - Components render UI with cart functionality

2. **Cart Flow**
   - Local state management with Context API
   - localStorage persistence
   - Reducer pattern for state updates
   - Modal interface for cart management

## Technical Stack

- **Frontend**: Next.js 14 with App Router, React, TypeScript
- **Styling**: Tailwind CSS with CSS modules
- **Database**: SQLite with Prisma ORM
- **State Management**: React Context API with localStorage
- **API**: Next.js API routes with REST endpoints
- **Type Safety**: Full TypeScript implementation

## System Benefits

✅ **Simplified Architecture**: No external dependencies
✅ **Fast Performance**: Direct database access, no external API calls
✅ **Full Control**: Complete control over data and operations
✅ **Easy Maintenance**: Single source of truth
✅ **High Reliability**: No external service dependencies
✅ **Cost Effective**: No external API usage costs
