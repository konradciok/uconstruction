# Shopify Webhooks Setup Guide

This guide covers the setup and testing of Shopify webhooks for real-time product synchronization.

## Phase 4 Implementation Status ✅

**COMPLETED**: Webhooks + Scheduled Delta Sync
- ✅ Webhook endpoints with HMAC verification
- ✅ Event deduplication using X-Shopify-Event-Id
- ✅ Async processing with proper error handling
- ✅ Scheduled delta sync with cursor pagination
- ✅ Rate limiting and cost-based throttling
- ✅ Comprehensive logging and diagnostics

## Architecture Overview

```
Shopify Store
     ↓ (real-time webhooks)
Next.js Webhook Endpoints
     ↓ (async processing)
Local Database (Prisma + SQLite)
     ↑ (scheduled delta sync)
Delta Sync Script (catches missed events)
```

## 1. Environment Configuration

Add to your `env.local` file:

```bash
# Shopify Webhook Secret (generate from Partner Dashboard)
SHOPIFY_WEBHOOK_SECRET="your_webhook_secret_here"

# Existing API credentials (already configured)
MYSHOPIFY_DOMAIN="your-shop.myshopify.com"
SHOPIFY_ACCESS_TOKEN="shpat_..."
SHOPIFY_API_VERSION="2025-07"
DATABASE_URL="file:./prisma/dev.db"
```

## 2. Webhook Endpoints

### Product Webhooks
- **URL**: `/api/shopify/webhooks/products`
- **Events**: `products/create`, `products/update`, `products/delete`
- **Method**: POST

### Collection Webhooks (Optional)
- **URL**: `/api/shopify/webhooks/collections`  
- **Events**: `collections/create`, `collections/update`, `collections/delete`
- **Method**: POST

### Security Features
- ✅ HMAC SHA256 signature verification
- ✅ Case-insensitive header handling  
- ✅ Timing-safe signature comparison
- ✅ Event deduplication (24h TTL)
- ✅ API version drift detection

## 3. Shopify Partner Dashboard Setup

### Step 1: Generate Webhook Secret
1. Go to your Shopify Partner Dashboard
2. Select your app
3. Go to "App setup" > "Webhooks"
4. Generate a new webhook secret
5. Copy and add to `SHOPIFY_WEBHOOK_SECRET`

### Step 2: Configure Webhook URLs

**For Production:**
```
Products: https://yourdomain.com/api/shopify/webhooks/products
Collections: https://yourdomain.com/api/shopify/webhooks/collections
```

**For Development (using ngrok):**
```
Products: https://abc123.ngrok.io/api/shopify/webhooks/products
Collections: https://abc123.ngrok.io/api/shopify/webhooks/collections
```

### Step 3: Subscribe to Events
Required webhook subscriptions:
- `products/create`
- `products/update` 
- `products/delete`
- `collections/create` (optional)
- `collections/update` (optional)
- `collections/delete` (optional)

## 4. Testing Webhooks Locally

### Method 1: Using ngrok (Recommended)

1. **Install ngrok**: `npm install -g ngrok`

2. **Start your development server**:
   ```bash
   npm run dev
   ```

3. **Start ngrok tunnel** (in another terminal):
   ```bash
   ngrok http 3000
   ```

4. **Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`)

5. **Configure webhooks** in Shopify Partner Dashboard:
   - Products: `https://abc123.ngrok.io/api/shopify/webhooks/products`
   - Collections: `https://abc123.ngrok.io/api/shopify/webhooks/collections`

6. **Test webhook delivery**:
   - Create, update, or delete a product in Shopify Admin
   - Check your terminal for webhook processing logs

### Method 2: Manual Testing (Development)

```bash
# Test endpoint availability (should return error about missing secret)
curl -X POST http://localhost:3000/api/shopify/webhooks/products \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# Expected response:
# {"success":false,"message":"Webhook secret not configured","timestamp":"..."}
```

## 5. Scripts and Commands

### Available npm Scripts
```bash
# Initial data import
npm run sync:backfill

# Incremental sync (run periodically)
npm run sync:delta

# Verify API connectivity
npm run shopify:verify
```

### Delta Sync Schedule
Run `npm run sync:delta` periodically (recommended: every hour):

**Using cron (Linux/macOS):**
```bash
# Add to crontab (run every hour)
0 * * * * cd /path/to/project && npm run sync:delta >> /var/log/shopify-sync.log 2>&1
```

**Using pm2 (Node.js process manager):**
```bash
# Install pm2
npm install -g pm2

# Create ecosystem file
echo 'module.exports = {
  apps: [{
    name: "shopify-delta-sync",
    script: "scripts/shopify-delta-sync.js",
    cron_restart: "0 * * * *",
    autorestart: false
  }]
}' > ecosystem.config.js

# Start scheduled job
pm2 start ecosystem.config.js
```

## 6. Monitoring and Diagnostics

### Webhook Logs
All webhook events are logged with structured data:

```json
{
  "timestamp": "2025-09-03T11:37:28.416Z",
  "event": "products/update",
  "eventId": "webhook_event_id", 
  "webhookId": "webhook_id",
  "apiVersion": "2025-07",
  "shopDomain": "your-shop.myshopify.com",
  "success": true,
  "processingTime": "45ms"
}
```

### Health Checks
Monitor these indicators:
- ✅ Webhook response times (should be < 2s)
- ✅ HMAC verification success rate (should be 100%)
- ✅ Event deduplication rate
- ✅ Delta sync frequency and success rate

### Common Issues

**Issue**: `Webhook secret not configured`
- **Solution**: Add `SHOPIFY_WEBHOOK_SECRET` to environment

**Issue**: `Invalid HMAC signature`
- **Solutions**:
  - Verify webhook secret matches Shopify settings
  - Check that webhook body is not modified before verification
  - Ensure raw body is used for HMAC calculation

**Issue**: `API version drift detected`
- **Solution**: Update `SHOPIFY_API_VERSION` environment variable
- **Note**: This is logged as a warning to detect version mismatches

**Issue**: Delta sync finds no products
- **Expected**: If no products were updated in the last 5 minutes
- **Check**: Logs should show "Products processed: 0"

## 7. Production Deployment

### Required Environment Variables
```bash
MYSHOPIFY_DOMAIN="https://your-shop.myshopify.com"
SHOPIFY_ACCESS_TOKEN="shpat_..."
SHOPIFY_API_VERSION="2025-07"
SHOPIFY_WEBHOOK_SECRET="webhook_secret_from_partner_dashboard"
DATABASE_URL="postgresql://..." # Switch to PostgreSQL for production
```

### Webhook URLs (Production)
Update Shopify Partner Dashboard with production URLs:
```
https://yourdomain.com/api/shopify/webhooks/products
https://yourdomain.com/api/shopify/webhooks/collections
```

### Database Migration
For production, migrate from SQLite to PostgreSQL:

1. **Update Prisma schema**:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. **Run migrations**:
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

3. **Re-run backfill**:
   ```bash
   npm run sync:backfill
   ```

## 8. Security Best Practices

- ✅ **HMAC Verification**: All webhooks verify Shopify signatures
- ✅ **Timing-Safe Comparison**: Prevents timing attacks
- ✅ **Event Deduplication**: Prevents duplicate processing
- ✅ **Environment Secrets**: No secrets committed to code
- ✅ **HTTPS Only**: Webhooks only work over HTTPS in production
- ✅ **Async Processing**: Quick webhook responses to avoid timeouts

## 9. Troubleshooting

### Debug Webhook Delivery
1. Check Shopify Partner Dashboard webhook delivery logs
2. Verify ngrok tunnel is active and accessible
3. Check Next.js dev server logs for processing errors
4. Verify database connectivity with `npm run prisma:studio`

### Debug Delta Sync
1. Check SyncState table for cursor tracking
2. Verify API credentials with `npm run shopify:verify`
3. Check for GraphQL cost limits or rate limiting
4. Review overlap window timing (currently 5 minutes)

### Performance Tuning
- **Batch Size**: Delta sync processes 10 products per transaction
- **Throttling**: Respects GraphQL cost limits automatically
- **Pagination**: Uses cursor-based pagination for efficiency
- **Caching**: Event deduplication uses in-memory cache (24h TTL)

---

## Summary

Phase 4 provides a **production-ready** Shopify synchronization system with:

- **Real-time updates** via webhooks
- **Missed event recovery** via delta sync  
- **Security** through HMAC verification
- **Reliability** through deduplication and retry logic
- **Monitoring** through comprehensive logging
- **Performance** through batching and throttling

The system automatically handles the complexity of keeping your local database in sync with Shopify, providing a solid foundation for the Portfolio2 and Upload features.