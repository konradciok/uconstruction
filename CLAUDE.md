# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development

- `npm run dev` - Start development server at <http://localhost:3000>
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint with strict rules (no explicit any, exhaustive deps, a11y)
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

### Database Operations (Prisma + Shopify Integration)

- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:db:push` - Push schema to database
- `npm run prisma:studio` - Open Prisma Studio
- `npm run db:reset` - Reset database
- `npm run shopify:verify` - Verify Shopify integration
- `npm run sync:backfill` - Backfill data from Shopify

## Architecture Overview

This is a Next.js 15.4.6 watercolor artist website with TypeScript, featuring a dual-purpose architecture:
1. **Artist Portfolio Site** - Main public website with contact forms and workshop bookings
2. **Shopify Integration** - Local database replication for product management (Portfolio2, Upload features)

### Tech Stack

- **Framework**: Next.js 15.4.6 with App Router
- **Language**: TypeScript with strict rules
- **Styling**: CSS Modules + CSS Variables (design tokens)
- **Database**: Prisma with SQLite (ready for Postgres)
- **Payments**: Stripe integration
- **Forms**: Formspree integration
- **UI Library**: Custom components with Framer Motion animations
- **Virtualization**: @tanstack/react-virtual for large galleries

### Key Integrations

- **Formspree**: Contact form handling (`NEXT_PUBLIC_FORMSPREE_FORM_ID`)
- **Stripe**: Workshop bookings (`STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`)
- **Shopify**: Product sync system via REST API (`DATABASE_URL`)

## Project Structure

### App Router Pages

- `/` - Home page with Hero and ArtMatters sections
- `/about` - Artist information
- `/commissions` - Commission information
- `/workshops` - Workshop booking with Stripe integration
- `/portfolio` - Main gallery with filtering
- `/portfolio2` - Advanced gallery with Shopify product sync
- `/upload` - Admin upload interface for artworks
- `/success` - Post-form submission success page

### Core Components

- **Gallery System**: Advanced virtualized gallery with lightbox, filtering, and performance monitoring
- **Portfolio2**: Shopify-integrated gallery with admin upload capabilities
- **UI Components**: Custom design system in `src/components/ui/`
- **Forms**: Contact forms with Formspree integration

### Database Schema (Prisma)

The database includes comprehensive Shopify product replication:

- `Product`, `Variant`, `Collection` models
- `ProductMedia` for image management
- `Tag` system for categorization
- `SyncState` for tracking Shopify sync status

## Styling System

### CSS Architecture

- **CSS Variables**: Global design tokens in `globals.css`
- **CSS Modules**: Component-scoped styling with `.module.css` files
- **Mobile-First**: Responsive design with mobile-first approach
- **Design Tokens**: Consistent spacing, typography, and color system

### Color Palette

- Background: `#F2F2F2` (light gray)
- Text: `#111111` (dark gray)  
- Primary: `#80A6F2` (soft blue)
- Accent: `#F2EDA7` (pale yellow)

### Component Patterns

- All components use CSS Modules for scoped styling
- Design tokens accessed via CSS variables
- Responsive utilities built into the global CSS system

## Development Patterns

### Code Quality

- **ESLint**: Strict configuration with `@typescript-eslint/no-explicit-any: error`
- **TypeScript**: Full type safety with strict mode enabled
- **Accessibility**: Enhanced a11y rules in ESLint config
- **Path Aliases**: Use `@/` for src directory imports

### Component Development

- Follow existing patterns in `src/components/ui/` for new UI components
- Use CSS Modules for styling with `.module.css` files
- Implement TypeScript interfaces in `src/types/` directory
- Include proper accessibility attributes and semantic HTML

### Performance Considerations

- Virtualized galleries for large image sets (`@tanstack/react-virtual`)
- Performance monitoring hooks (`usePerformanceMonitor`, `useIntersectionPreloader`)
- Optimized image loading with Next.js Image component
- Framer Motion for smooth animations

### Testing

- Jest setup with React Testing Library
- Component tests in `__tests__` directories
- Mock Next.js Image component for tests
- Type definitions in dedicated files

## Environment Configuration

Required environment variables:

```bash
# Forms
NEXT_PUBLIC_FORMSPREE_FORM_ID=your_formspree_form_id

# Payments  
STRIPE_SECRET_KEY=sk_test_..._or_sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_..._or_pk_live_...

# Database
DATABASE_URL="file:./prisma/dev.db"
```

## Deployment Notes

- **Platform**: Optimized for Vercel deployment
- **Build**: Uses `next build` with ESLint errors allowed during builds
- **Database**: SQLite for development, can migrate to Postgres for production
- **Assets**: Images and static assets handled by Next.js optimization