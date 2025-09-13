# MCP (Model Context Protocol) Setup for Stripe Integration

This document explains how to set up MCP configuration for Stripe integration in your watercolor artist site.

## Overview

The MCP configuration allows AI assistants to interact directly with your Stripe account and PostgreSQL database, enabling automated product synchronization and management.

## Files Created

- `mcp.json` - MCP server configuration
- `scripts/setup-mcp.js` - Setup script for easy installation
- `.env` - Environment variables (created from env.example)

## Quick Setup

1. **Run the setup script:**
   ```bash
   node scripts/setup-mcp.js
   ```

2. **Update your .env file with actual Stripe credentials:**
   ```bash
   # Edit .env file with your real Stripe keys
   STRIPE_SECRET_KEY=sk_test_your_actual_stripe_secret_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key
   STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret
   ```

3. **Verify the configuration:**
   ```bash
   # Check if MCP packages are installed
   npx @chinchillaenterprises/mcp-stripe --help
   npx @modelcontextprotocol/server-postgres --help
   ```

## MCP Configuration Details

### Stripe MCP Server
- **Package:** `@stripe/mcp` (official Stripe package)
- **Environment Variables:**
  - `STRIPE_SECRET_KEY` - Your Stripe secret key

### PostgreSQL MCP Server
- **Package:** `@modelcontextprotocol/server-postgres` (read-only access)
- **Environment Variables:**
  - `DATABASE_URL` - Your database connection string

## Available MCP Tools

Once configured, your AI assistant will have access to:

### Stripe Tools
- `stripe_list_products` - List all products
- `stripe_create_product` - Create new products
- `stripe_list_prices` - List all prices
- `stripe_create_price` - Create new prices
- `stripe_list_customers` - List customers
- `stripe_create_customer` - Create customers
- `stripe_list_payment_intents` - List payment intents
- `stripe_create_payment_intent` - Create payment intents

### PostgreSQL Tools
- `postgres_query` - Execute SQL queries
- `postgres_list_tables` - List database tables
- `postgres_describe_table` - Get table schema

## Usage with AI Assistants

Once MCP is configured, you can ask your AI assistant to:

1. **Synchronize products** from your database to Stripe
2. **Create new products** in Stripe based on your database
3. **Update pricing** and product information
4. **Query your database** for product information
5. **Manage customers** and payment intents

### Example Commands
- "Sync all products from my database to Stripe"
- "Create a new product in Stripe for the watercolor workshop"
- "List all products in my Stripe account"
- "Query my database for all active products"

## Security Considerations

- **Never commit .env file** - It contains sensitive credentials
- **Use test keys** - Always use `sk_test_` keys for development
- **Restrict permissions** - Consider using restricted API keys
- **Monitor usage** - Keep track of API calls and usage

## Troubleshooting

### Common Issues

1. **MCP packages not found:**
   ```bash
   npm install -g @stripe/mcp @modelcontextprotocol/server-postgres
   ```

2. **Environment variables not loaded:**
   - Ensure .env file exists in project root
   - Check variable names match exactly
   - Restart your AI assistant after changes

3. **Database connection failed:**
   - Verify DATABASE_URL is correct
   - Ensure database is running
   - Check connection permissions

4. **Stripe API errors:**
   - Verify API keys are correct
   - Check Stripe account status
   - Ensure keys have required permissions

### Testing MCP Connection

```bash
# Test Stripe MCP
echo '{"method": "tools/list"}' | npx @stripe/mcp

# Test PostgreSQL MCP  
echo '{"method": "tools/list"}' | npx @modelcontextprotocol/server-postgres
```

## Integration with Your Project

This MCP setup integrates with your existing:

- **Stripe integration** in `/src/app/api/`
- **Product management** system
- **Cart functionality** 
- **Database schema** in Prisma

The MCP tools complement your existing API routes and provide direct access for AI-assisted management.

## Next Steps

1. Update your Stripe credentials in .env
2. Test the MCP connection
3. Use AI assistant for product synchronization
4. Monitor and maintain the integration

For detailed synchronization tasks, refer to `md/stripe.md`.
