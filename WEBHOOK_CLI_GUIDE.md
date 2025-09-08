# Shopify Webhook CLI Setup Guide

There are **3 ways** to generate Shopify webhooks automatically:

## Method 1: Custom CLI Script (Recommended) ✅

Our custom script uses the Shopify Admin API to create webhooks programmatically:

### Usage

```bash
# Production setup
npm run webhooks:setup -- --url https://yourdomain.com

# Development with ngrok
npm run webhooks:setup -- --url https://abc123.ngrok.io

# Dry run to see what would be created
npm run webhooks:setup -- --url https://myapp.com --dry-run

# Custom webhook secret
npm run webhooks:setup -- --url https://myapp.com --secret my_custom_secret

# Help
npm run webhooks:setup -- --help
```

### What it does:

- ✅ Creates all product and collection webhooks
- ✅ Generates secure webhook secret automatically
- ✅ Updates `env.local` with the secret
- ✅ Lists existing webhooks to prevent conflicts
- ✅ Provides detailed setup instructions

### Example Output:

```
🔧 Shopify Webhook Setup
📍 Base URL: https://abc123.ngrok.io
🏪 Shop: your-shop.myshopify.com
📡 API Version: 2025-07
🔐 Webhook Secret: 12345678...

📋 Checking existing webhooks...
Found 0 existing webhooks

🚀 Creating webhooks...
Creating PRODUCTS_CREATE...
✓ Created: gid://shopify/WebhookSubscription/12345
Creating PRODUCTS_UPDATE...
✓ Created: gid://shopify/WebhookSubscription/12346
Creating PRODUCTS_DELETE...
✓ Created: gid://shopify/WebhookSubscription/12347
...

✅ Updated env.local with webhook secret

🎉 Webhook setup completed!
✅ Created 6 webhooks
✅ Updated env.local with webhook secret
```

## Method 2: Official Shopify CLI

### Install Shopify CLI

```bash
npm install -g @shopify/cli @shopify/theme
```

### Create Shopify app structure (optional)

```bash
# Initialize new Shopify app
shopify app init my-app

# Or use existing app by creating shopify.app.toml
```

### Configure webhooks via CLI

```bash
# Login to Shopify
shopify auth login

# Generate app configuration
shopify app generate webhook

# Deploy webhooks
shopify app deploy
```

### Limitations:

- ❌ Requires full Shopify app setup
- ❌ Complex configuration for existing projects
- ❌ Less control over webhook URLs
- ❌ Designed for new Shopify apps, not integrations

## Method 3: Partner Dashboard (Manual)

### Step 1: Access Partner Dashboard

1. Go to [partners.shopify.com](https://partners.shopify.com)
2. Select your app
3. Go to "App setup" → "Webhooks"

### Step 2: Generate Webhook Secret

1. Click "Generate webhook signature secret"
2. Copy the generated secret
3. Add to `env.local`:
   ```bash
   SHOPIFY_WEBHOOK_SECRET="your_generated_secret"
   ```

### Step 3: Add Webhook Endpoints

Create webhooks for these events:

**Product Webhooks** (`/api/shopify/webhooks/products`):

- `products/create`
- `products/update`
- `products/delete`

**Collection Webhooks** (`/api/shopify/webhooks/collections`):

- `collections/create`
- `collections/update`
- `collections/delete`

### Step 4: Configure URLs

- **Production**: `https://yourdomain.com/api/shopify/webhooks/products`
- **Development**: `https://abc123.ngrok.io/api/shopify/webhooks/products`

---

## Recommended Workflow

### For Development:

```bash
# 1. Start development server
npm run dev

# 2. Start ngrok tunnel (in another terminal)
npx ngrok http 3000

# 3. Copy the HTTPS URL (e.g., https://abc123.ngrok.io)

# 4. Setup webhooks with our CLI script
npm run webhooks:setup -- --url https://abc123.ngrok.io

# 5. Test webhook delivery by updating a product in Shopify Admin
```

### For Production:

```bash
# 1. Deploy your app to production (Vercel, etc.)

# 2. Setup webhooks with production URL
npm run webhooks:setup -- --url https://myapp.vercel.app

# 3. Verify webhook delivery in production logs
```

### Verification:

```bash
# Test API connectivity
npm run shopify:verify

# Check webhook endpoints are working
curl -X POST https://yourdomain.com/api/shopify/webhooks/products

# Run delta sync to verify database
npm run sync:delta
```

---

## Troubleshooting

### Common Issues:

**"Missing webhook secret"**

- Solution: Ensure `SHOPIFY_WEBHOOK_SECRET` is in `env.local`
- Check: `echo $SHOPIFY_WEBHOOK_SECRET` should output the secret

**"Webhook already exists"**

- Solution: The script will skip existing webhooks automatically
- Check: Use `--dry-run` to see what would be created

**"Invalid HMAC signature"**

- Solution: Verify webhook secret matches Shopify configuration
- Check: Regenerate secret and update both env.local and Shopify

**"ngrok tunnel closed"**

- Solution: ngrok tunnels expire, restart with `npx ngrok http 3000`
- Update: Re-run webhook setup with new ngrok URL

### Debug Commands:

```bash
# Show webhook setup help
npm run webhooks:setup -- --help

# Dry run to preview changes
npm run webhooks:setup -- --url https://example.com --dry-run

# Verify API access
npm run shopify:verify

# Check current environment
cat env.local | grep SHOPIFY
```

---

## Security Notes

- ✅ **Webhook secrets** are generated cryptographically secure (32 bytes)
- ✅ **HTTPS required** for all webhook endpoints in production
- ✅ **HMAC verification** prevents unauthorized webhook calls
- ✅ **Environment isolation** keeps secrets out of code
- ✅ **Automatic updates** keeps env.local in sync

The CLI script approach gives you the **best of both worlds**: automation like the official CLI but with full control over your webhook configuration!
