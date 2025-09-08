# Scripts Directory

This directory contains utility scripts for the UConstruction project.

## Development Startup Scripts

### 🚀 `start-dev.js` (Recommended)
**Usage**: `npm run dev:full`

Advanced Node.js startup script that provides:
- ✅ Database status checking
- ✅ Automatic Prisma client generation
- ✅ Database schema setup/verification
- ✅ Graceful shutdown handling
- ✅ Colorized progress output
- ✅ Helpful status messages

**Features**:
- Automatically detects if database needs initialization
- Generates Prisma client before starting
- Sets up database schema if missing
- Provides helpful startup messages with URLs
- Handles SIGINT/SIGTERM for clean shutdown

### 🛠️ `start-dev-simple.sh`
**Usage**: `./scripts/start-dev-simple.sh`

Simple bash alternative for environments that need basic startup:
- ✅ Basic environment checking
- ✅ Prisma client generation
- ✅ Database schema push
- ✅ Development server startup

## Shopify Integration Scripts

### `shopify-verify.js`
**Usage**: `npm run shopify:verify`

Verifies Shopify API connection and credentials.

### `shopify-backfill.js` 
**Usage**: `npm run sync:backfill`

Performs initial data sync from Shopify to local database.

### `shopify-delta-sync.js`
**Usage**: `npm run sync:delta`

Performs incremental sync of changes from Shopify.

### `setup-webhooks.js`
**Usage**: `npm run webhooks:setup`

Sets up Shopify webhooks for real-time sync.

## Quick Start

For new developers or clean environments:

```bash
# Clone repo and install dependencies
npm install

# Start with database initialization (RECOMMENDED)
npm run dev:full

# Alternative: simple startup
./scripts/start-dev-simple.sh

# Or manual step-by-step
npm run prisma:generate
npm run prisma:db:push
npm run dev
```

## Environment Requirements

All scripts require:
- Node.js (v18+)
- npm
- Proper `.env.local` configuration

Database scripts specifically need:
- `DATABASE_URL` environment variable
- SQLite (default) or Postgres connection

Shopify scripts additionally need:
- Shopify API credentials
- Proper webhook endpoints configured

## Troubleshooting

### Database Issues
```bash
# Reset database completely
npm run db:reset

# Regenerate client
npm run prisma:generate

# Push schema
npm run prisma:db:push
```

### Shopify Connection Issues
```bash
# Verify connection
npm run shopify:verify

# Check environment variables in .env.local
```

### Development Server Issues
```bash
# Clear Next.js cache
rm -rf .next

# Restart with full initialization
npm run dev:full
```