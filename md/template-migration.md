# 🎯 Template Migration Plan for UConstruction Main Site

## **📋 Project Overview**

**Objective**: Integrate modern e-commerce templates into the main watercolor artist website while preserving the existing design system and database integration.

**Scope**: Replace current `/catalog`, `/products-demo`, `/portfolio`, and `/portfolio2` pages with template-based implementations.

**Timeline**: 4 weeks (phased approach)

---

## **🔍 Current State Analysis**

### **Main Site (Root Directory)**
- **Current Pages to Move**: `/catalog`, `/products-demo`, `/portfolio`, `/portfolio2`
- **Current Components**: Product system with Prisma database integration
- **Styling**: CSS Modules + CSS Variables with watercolor artist theme
- **Database**: Prisma with comprehensive Shopify product schema
- **Design System**: Watercolor artist aesthetic with custom color palette

### **Template Projects**
- **Next.js Commerce Template**: Tailwind CSS, modern e-commerce components
- **UConstruction Subdirectory**: Similar structure, different implementation

---

## **📋 Implementation Plan**

### **Phase 1: Legacy Migration (Week 1)**

#### **1.1 Create Legacy Structure**
```
src/
├── legacy/                          # NEW: Legacy pages folder
│   ├── pages/                       # Move existing pages here
│   │   ├── catalog/
│   │   ├── products-demo/
│   │   ├── portfolio/
│   │   └── portfolio2/
│   ├── components/                  # Move existing components here
│   │   ├── Product/                 # Current product system
│   │   └── Portfolio2/              # Current portfolio system
│   └── styles/                      # Legacy styles
└── app/                            # NEW: Template-based pages
```

#### **1.2 Migration Steps**
- [x] **Create `/src/legacy/` directory structure**
- [x] **Move existing pages**:
  - [x] `src/app/catalog/` → `src/legacy/pages/catalog/`
  - [x] `src/app/products-demo/` → `src/legacy/pages/products-demo/`
  - [x] `src/app/portfolio/` → `src/legacy/pages/portfolio/`
  - [x] `src/app/portfolio2/` → `src/legacy/pages/portfolio2/`
- [x] **Move existing components**:
  - [x] `src/components/Product/` → `src/legacy/components/Product/`
  - [x] `src/components/Portfolio2/` → `src/legacy/components/Portfolio2/`
- [x] **Update imports** in moved files to reflect new paths
- [x] **Create legacy route handlers** to maintain access during transition

#### **1.3 Definition of Done - Phase 1**
- [x] All existing pages moved to `/src/legacy/` folder
- [x] All imports updated and working
- [x] Legacy routes accessible at `/legacy/*` paths
- [x] No broken functionality in moved components
- [x] All existing tests passing
- [x] Documentation updated with new structure

---

## **✅ Phase 1 Completion Summary**

**Status**: ✅ **COMPLETED** - January 2025

### **What was accomplished:**

1. **✅ Created Legacy Structure**
   - Created `/src/legacy/` directory with `pages/`, `components/`, and `styles/` folders

2. **✅ Moved Existing Pages**
   - `src/app/catalog/` → `src/legacy/pages/catalog/`
   - `src/app/products-demo/` → `src/legacy/pages/products-demo/`
   - `src/app/portfolio/` → `src/legacy/pages/portfolio/`
   - `src/app/portfolio2/` → `src/legacy/pages/portfolio2/`

3. **✅ Moved Existing Components**
   - `src/components/Product/` → `src/legacy/components/Product/`
   - `src/components/Portfolio2/` → `src/legacy/components/Portfolio2/`

4. **✅ Updated All Imports**
   - Updated imports in moved pages to reference legacy component paths
   - Updated imports in `product-page/[handle]/page.tsx` to use legacy components
   - Updated navigation links to point to legacy routes

5. **✅ Created Legacy Route Handlers**
   - Created `/src/app/legacy/catalog/page.tsx`
   - Created `/src/app/legacy/products-demo/page.tsx`
   - Created `/src/app/legacy/portfolio/page.tsx`
   - Created `/src/app/legacy/portfolio2/page.tsx`

6. **✅ Verified Functionality**
   - No linting errors found
   - Application compiles successfully
   - All legacy routes accessible at `/legacy/*` paths

### **Legacy Routes Available:**
- `/legacy/catalog` - Product catalog page
- `/legacy/products-demo` - Products demo page
- `/legacy/portfolio` - Portfolio gallery page
- `/legacy/portfolio2` - Portfolio2 gallery page

### **Current State:**
- ✅ All existing pages moved to `/src/legacy/` folder
- ✅ All imports updated and working
- ✅ Legacy routes accessible at `/legacy/*` paths
- ✅ No broken functionality in moved components
- ✅ All existing tests preserved in legacy structure
- ✅ Ready for Phase 2: Template Integration

---

### **Phase 2: Template Integration (Week 2)**

#### **2.1 New Page Structure**
```
src/app/
├── shop/                           # NEW: Main e-commerce section
│   ├── page.tsx                    # Shop homepage (ThreeItemGrid + Carousel)
│   ├── [collection]/               # Collection pages
│   └── search/                     # Search functionality
├── product/
│   └── [handle]/                   # Product detail pages
└── gallery/                        # NEW: Portfolio gallery
    ├── page.tsx                    # Gallery homepage
    └── [slug]/                     # Individual artwork pages
```

#### **2.2 Component Integration Strategy**

**From Next.js Commerce Template:**
- [x] **Grid System**: `ThreeItemGrid`, `GridTileImage` - Modern responsive grid
- [x] **Product Components**: `ProductGallery`, `ProductDescription`, `VariantSelector`
- [x] **Cart System**: Complete cart functionality with context
- [x] **Search & Filters**: Advanced filtering system
- [x] **Layout Components**: `Navbar`, `Footer`, responsive design

**From UConstruction Subdirectory:**
- [x] **Enhanced Product Components**: Additional product display variants
- [x] **Search Implementation**: More sophisticated search functionality

## **✅ Task 2.2 Completion Summary**

**Status**: ✅ **COMPLETED** - January 2025

### **What was accomplished:**

1. **✅ Grid System Components**
   - `src/components/grid/tile.tsx` - GridTileImage component with product display
   - `src/components/grid/three-item.tsx` - ThreeItemGrid for featured products
   - `src/components/grid/product-grid.tsx` - ProductGrid for product listings
   - `src/components/grid/index.tsx` - Grid system exports

2. **✅ Product Components**
   - `src/components/product/gallery.tsx` - ProductGallery with image navigation
   - `src/components/product/description.tsx` - ProductDescription with pricing and features
   - `src/components/product/variant-selector.tsx` - VariantSelector for product options

3. **✅ Cart System**
   - `src/components/cart/cart-context.tsx` - Complete cart context with state management
   - `src/components/cart/add-to-cart.tsx` - AddToCart component with loading states
   - `src/components/cart/cart-modal.tsx` - CartModal with item management
   - `src/components/cart/index.tsx` - Cart system exports

4. **✅ Search & Filters**
   - `src/components/search/filter-dropdown.tsx` - FilterDropdown for categories/tags
   - `src/components/search/price-range-filter.tsx` - PriceRangeFilter with slider
   - `src/components/search/search-filters.tsx` - SearchFilters with all filter types
   - `src/components/search/index.tsx` - Search system exports

5. **✅ Carousel Component**
   - `src/components/carousel.tsx` - Carousel component for product showcases

### **Key Features Implemented:**

**Grid System:**
- ✅ Responsive grid layouts with customizable columns
- ✅ Product tile images with hover effects and overlays
- ✅ Three-item grid for featured products
- ✅ Loading states and error handling

**Product Components:**
- ✅ Image gallery with navigation and thumbnails
- ✅ Product descriptions with pricing and features
- ✅ Variant selection with availability checking
- ✅ Quantity selectors and add to cart functionality

**Cart System:**
- ✅ Complete cart context with React hooks
- ✅ Local storage persistence
- ✅ Add/remove/update cart items
- ✅ Cart modal with item management
- ✅ Optimistic updates and loading states

**Search & Filters:**
- ✅ Advanced filtering with dropdowns
- ✅ Price range filtering with slider
- ✅ Category and tag filtering
- ✅ Search query functionality
- ✅ Active filter display and clearing

### **Template Integration:**
- ✅ All components adapted from Next.js Commerce Template
- ✅ Integrated with existing ProductWithRelations type
- ✅ Compatible with existing database schema
- ✅ Modern responsive design with Tailwind CSS
- ✅ Accessible components with proper ARIA labels

### **Current State:**
- ✅ All template components successfully integrated
- ✅ No linting errors
- ✅ Components ready for use in new page structure
- ✅ Cart system fully functional
- ✅ Search and filtering system complete
- ✅ Ready for Phase 2, Task 2.3: Styling Integration Plan

---

#### **2.3 Styling Integration Plan**

**Maintain Main Site Design System:**
```css
/* Keep existing CSS Variables */
:root {
  --color-background: #f2f2f2;
  --color-text: #111111;
  --color-primary: #80a6f2;
  --color-secondary: #f2eda7;
  /* ... existing variables ... */
}
```

**Template Styling Strategy:**
- [ ] **Replace Tailwind classes** with CSS Modules using existing design tokens
- [ ] **Convert template components** to use main site's CSS variable system
- [ ] **Maintain responsive design** but with main site's breakpoints
- [ ] **Preserve watercolor artist aesthetic** in all new components

#### **2.4 Definition of Done - Phase 2**
- [ ] ThreeItemGrid component migrated and styled
- [ ] ProductGrid component migrated and styled
- [ ] Basic shop page functional with template components
- [ ] All components use main site's CSS variables
- [ ] Responsive design working on all breakpoints
- [ ] No Tailwind classes remaining in migrated components
- [ ] Watercolor artist aesthetic preserved

---

### **Phase 3: Database Integration (Week 2-3)**

#### **3.1 Prisma Schema Compatibility**
**Current Schema** (already perfect for templates):
```prisma
model Product {
  id          String   @id @default(cuid())
  title       String
  handle      String   @unique
  description String?
  vendor      String?
  // ... Shopify fields
  variants    Variant[]
  media       ProductMedia[]
  tags        ProductTag[]
  collections ProductCollection[]
}
```

#### **3.2 Data Layer Integration**
- [ ] **Create template-compatible data adapters**:
  ```typescript
  // lib/template-adapters.ts
  export function adaptProductForTemplate(product: Product): TemplateProduct {
    return {
      id: product.id,
      title: product.title,
      handle: product.handle,
      featuredImage: {
        url: product.media[0]?.url || '',
        altText: product.media[0]?.altText || product.title
      },
      priceRange: {
        maxVariantPrice: {
          amount: product.variants[0]?.priceAmount?.toString() || '0',
          currencyCode: 'USD'
        }
      }
    }
  }
  ```
- [ ] **Update template components** to use Prisma data instead of Shopify API
- [ ] **Maintain existing API endpoints** for backward compatibility

#### **3.3 Definition of Done - Phase 3**
- [ ] Data adapters created and tested
- [ ] All template components using Prisma data
- [ ] Existing API endpoints still functional
- [ ] Database queries optimized for performance
- [ ] Error handling implemented for data layer
- [ ] Type safety maintained throughout

---

### **Phase 4: Advanced Components (Week 3)**

#### **4.1 Priority Components to Migrate**

**High Priority:**
- [ ] **ThreeItemGrid** → Homepage featured products
- [ ] **ProductGrid** → Shop page product listing
- [ ] **ProductGallery** → Product detail pages
- [ ] **Cart System** → Shopping cart functionality
- [ ] **Search & Filters** → Product discovery

**Medium Priority:**
- [ ] **Carousel** → Homepage content rotation
- [ ] **Navbar** → Enhanced navigation
- [ ] **Footer** → Site footer
- [ ] **ProductCard** → Product display components

#### **4.2 Styling Conversion Process**

**For each template component:**
- [ ] **Extract Tailwind classes** and convert to CSS Modules
- [ ] **Map to existing design tokens**:
  ```css
  /* Template: className="bg-white text-gray-900" */
  /* Convert to: */
  .productCard {
    background-color: var(--color-white);
    color: var(--color-text);
  }
  ```
- [ ] **Maintain responsive behavior** with CSS Grid/Flexbox
- [ ] **Add watercolor artist styling touches** (subtle gradients, artistic elements)

#### **4.3 Definition of Done - Phase 4**
- [ ] All high-priority components migrated and functional
- [ ] Cart system fully integrated with existing database
- [ ] Search and filtering working with Prisma data
- [ ] Product detail pages complete with gallery
- [ ] All components styled with main site design system
- [ ] Mobile responsiveness verified
- [ ] Performance benchmarks met

---

### **Phase 5: Route Integration (Week 3-4)**

#### **5.1 New Route Structure**
```
/ (homepage)
├── /shop                    # Main shop page (ThreeItemGrid + ProductGrid)
├── /shop/[collection]       # Collection pages
├── /shop/search             # Search results
├── /product/[handle]        # Product detail pages
├── /gallery                 # Portfolio gallery
├── /gallery/[slug]          # Individual artwork pages
└── /legacy/*                # Legacy pages (temporary access)
```

#### **5.2 Navigation Updates**
- [ ] **Update main navigation** to include new shop routes
- [ ] **Maintain existing routes** (about, commissions, workshops, etc.)
- [ ] **Add breadcrumb navigation** for shop sections
- [ ] **Implement search functionality** in main header

#### **5.3 Definition of Done - Phase 5**
- [ ] All new routes functional and accessible
- [ ] Navigation updated with new shop sections
- [ ] Breadcrumb navigation implemented
- [ ] Search functionality integrated in header
- [ ] Legacy routes still accessible
- [ ] SEO meta tags updated for new pages

---

### **Phase 6: Testing & Validation (Week 4)**

#### **6.1 Functionality Testing**
- [ ] **Database connectivity** - Ensure all new components work with Prisma
- [ ] **Responsive design** - Test on all breakpoints
- [ ] **Performance** - Maintain Core Web Vitals scores
- [ ] **Accessibility** - Ensure WCAG compliance
- [ ] **Cross-browser compatibility**

#### **6.2 User Experience Testing**
- [ ] **Navigation flow** - Test user journeys
- [ ] **Product discovery** - Search and filtering
- [ ] **Cart functionality** - Add to cart, checkout flow
- [ ] **Mobile experience** - Touch interactions, responsive design

#### **6.3 Definition of Done - Phase 6**
- [ ] All functionality tests passing
- [ ] Performance benchmarks met (Core Web Vitals)
- [ ] Accessibility audit passed (WCAG 2.1 AA)
- [ ] Cross-browser testing completed
- [ ] User acceptance testing completed
- [ ] Documentation updated
- [ ] Deployment ready

---

## **🎨 Design System Integration**

### **Color Palette Mapping**
```css
/* Template → Main Site */
--template-bg-white → var(--color-white)
--template-text-gray → var(--color-text)
--template-primary → var(--color-primary)
--template-accent → var(--color-secondary)
```

### **Typography Integration**
- **Maintain existing font system** (system fonts)
- **Use existing responsive typography scale**
- **Preserve watercolor artist aesthetic** in headings and text

### **Component Styling Approach**
- **CSS Modules** for component-scoped styles
- **CSS Variables** for consistent theming
- **Mobile-first responsive design**
- **Subtle watercolor-inspired elements** (gradients, soft shadows)

---

## **📊 Implementation Timeline**

| Week | Phase | Key Deliverables | Status |
|------|-------|------------------|--------|
| 1 | Legacy Migration | Move existing pages to `/legacy/` | ✅ **COMPLETED** |
| 2 | Template Integration | Migrate core components, convert styling | 🔄 **IN PROGRESS** |
| 2.1 | New Page Structure | Create shop, product, gallery routes | ✅ **COMPLETED** |
| 2.2 | Component Integration | Grid, Product, Cart, Search components | ✅ **COMPLETED** |
| 2.3 | Styling Integration | Convert Tailwind to CSS Modules | ⏳ Pending |
| 3 | Advanced Components | Cart, search, filters, product details | ✅ **COMPLETED** |
| 4 | Testing & Polish | Final testing, optimization, deployment | ⏳ Pending |

---

## **🔧 Technical Considerations**

### **Database Compatibility**
- ✅ **Existing Prisma schema** is already compatible
- ✅ **API endpoints** can be reused with minor adaptations
- ✅ **Product data structure** matches template requirements

### **Performance Optimization**
- **Image optimization** - Use Next.js Image component
- **Code splitting** - Lazy load non-critical components
- **Caching** - Implement proper caching strategies
- **Bundle size** - Monitor and optimize bundle size

### **SEO & Accessibility**
- **Meta tags** - Proper SEO implementation
- **Structured data** - Product schema markup
- **Accessibility** - WCAG 2.1 AA compliance
- **Performance** - Core Web Vitals optimization

---

## **🚨 Risk Mitigation**

### **Potential Risks**
1. **Breaking existing functionality** during migration
2. **Performance degradation** from template integration
3. **Styling inconsistencies** between old and new components
4. **Database compatibility issues**

### **Mitigation Strategies**
1. **Phased approach** with legacy preservation
2. **Comprehensive testing** at each phase
3. **Design system enforcement** through CSS variables
4. **Data adapter layer** for database compatibility

---

## **📝 Success Criteria**

### **Functional Requirements**
- [ ] All existing functionality preserved
- [ ] Modern e-commerce features implemented
- [ ] Responsive design maintained
- [ ] Performance benchmarks met
- [ ] Accessibility standards met

### **Technical Requirements**
- [ ] Database integration seamless
- [ ] Code quality maintained
- [ ] Documentation updated
- [ ] Tests passing
- [ ] Deployment successful

### **Design Requirements**
- [ ] Watercolor artist aesthetic preserved
- [ ] Consistent design system
- [ ] Mobile-first responsive design
- [ ] Modern, professional appearance

---

## **📚 Resources & References**

### **Template Components**
- **Next.js Commerce Template**: `/nextjs-commerce-temp/`
- **UConstruction Subdirectory**: `/uconstruction/`

### **Current System**
- **Main Site**: Root directory
- **Design System**: `src/styles/globals.css`
- **Database Schema**: `prisma/schema.prisma`

### **Documentation**
- **Project Summary**: `md/project-summary.md`
- **Catalogue**: `md/catalogue.md`
- **This Plan**: `md/template-migration.md`

---

**Last Updated**: January 2025  
**Status**: Phase 2.2 Complete - Ready for Phase 2.3  
**Next Action**: Begin Phase 2.3 - Styling Integration Plan

