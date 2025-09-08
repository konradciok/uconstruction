# UConstruction - Watercolor Artist Platform

A Next.js e-commerce platform for watercolor artist Anna Ciok, featuring artwork sales, workshops, and portfolio management.

## Product Overview

**Artist:** Anna Ciok - Watercolor painter based in Tenerife, Spain  
**Platform:** E-commerce website with integrated Shopify sync, workshop booking, and portfolio gallery

### Core Features

- **Artwork Sales**: Shopify-integrated product catalog with local database sync
- **Workshop Booking**: Stripe-powered booking system for weekly watercolor workshops in Güímar
- **Portfolio Gallery**: Dynamic gallery showcasing watercolor artwork
- **Commission Requests**: Custom artwork commission system
- **Responsive Design**: Mobile-first design with modern UI components

### Technical Stack

- **Framework**: Next.js 15 with App Router
- **Database**: SQLite with Prisma ORM (Shopify sync)
- **Payments**: Stripe integration for workshops
- **E-commerce**: Shopify Admin API integration
- **Styling**: Tailwind CSS with custom modules
- **Deployment**: Vercel-ready configuration

### Key Pages

- `/` - Homepage with featured artwork carousel
- `/shop` - Product catalog with filtering and search
- `/about` - Artist biography and story
- `/workshops` - Workshop booking with date picker
- `/commissions` - Custom artwork requests
- `/gallery` - Portfolio showcase

### Database Schema

Prisma-managed SQLite database with Shopify product sync:
- Products, Variants, Collections
- Product media and tags
- Sync state management
- Inventory tracking

### Environment Setup

Required environment variables:
- `STRIPE_SECRET_KEY` - Workshop payment processing
- `SHOPIFY_ACCESS_TOKEN` - Product catalog sync
- `MYSHOPIFY_DOMAIN` - Shopify store connection
- `DATABASE_URL` - SQLite database path

### Development

```bash
npm run dev          # Start development server
npm run dev:full     # Start with database sync
npm run shopify:verify # Verify Shopify connection
npm run sync:backfill # Sync all products from Shopify
```

### Architecture

- **Frontend**: React components with TypeScript
- **Backend**: Next.js API routes for Shopify webhooks
- **Data Layer**: Prisma with automated Shopify sync
- **Payment**: Stripe Checkout for workshop bookings
- **Assets**: Optimized images with Next.js Image component
