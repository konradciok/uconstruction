# Watercolor Artist Site

A Next.js portfolio and workshop booking platform for watercolor artist Anna Ciok, featuring local product database with Shopify data sync.

## Product Overview

**Artist:** Anna Ciok - Watercolor painter based in Tenerife, Spain  
**Platform:** Portfolio website with workshop booking and local product database

### Core Features

- **Portfolio Gallery**: Dynamic gallery showcasing watercolor artwork
- **Workshop Booking**: Stripe-powered booking system for weekly watercolor workshops in Güímar
- **Commission Requests**: Custom artwork commission system
- **Product Database**: Local SQLite database with Shopify data synchronization
- **Responsive Design**: Mobile-first design with modern UI components

### Technical Stack

- **Framework**: Next.js 15 with App Router
- **Database**: SQLite with Prisma ORM
- **Payments**: Stripe integration for workshops
- **Data Sync**: Shopify Admin API for product data import
- **Styling**: Custom CSS modules with responsive design system
- **Deployment**: Vercel-ready configuration

### Key Pages

- `/` - Homepage with featured artwork carousel
- `/shop` - Product catalog with filtering and search (local database)
- `/about` - Artist biography and story
- `/workshops` - Workshop booking with date picker
- `/commissions` - Custom artwork requests
- `/gallery` - Portfolio showcase

### Data Architecture

**Local Product Database** (not live Shopify integration):

- SQLite database with Prisma ORM
- Products, variants, collections, media, and tags
- Shopify data imported via bulk sync scripts
- Webhook handlers for real-time updates (optional)
- Sync state management for incremental updates

### Shopify Integration

**Data Import Only** (not live e-commerce):

- Bulk import script: `npm run sync:backfill`
- Delta sync script: `npm run sync:delta`
- Webhook handlers for product updates
- Verification script: `npm run shopify:verify`
- No live checkout or cart functionality

### Environment Setup

Required environment variables:

- `STRIPE_SECRET_KEY` - Workshop payment processing
- `SHOPIFY_ACCESS_TOKEN` - Product data import
- `MYSHOPIFY_DOMAIN` - Shopify store connection
- `SHOPIFY_WEBHOOK_SECRET` - Webhook verification secret
- `DATABASE_URL` - SQLite database path (e.g., `file:./prisma/dev.db`)

### Development

```bash
npm run dev          # Start development server
npm run dev:full     # Start with database sync
npm run shopify:verify # Verify Shopify connection
npm run sync:backfill # Import all products from Shopify
npm run sync:delta   # Incremental product sync
```

### Architecture

- **Frontend**: React components with TypeScript and custom CSS modules
- **Backend**: Next.js API routes for data and webhooks
- **Data Layer**: Prisma with local SQLite database
- **Payment**: Stripe Checkout for workshop bookings only
- **Sync**: Shopify Admin API for data import (not live e-commerce)
- **Styling**: Custom CSS with responsive design system and CSS custom properties
