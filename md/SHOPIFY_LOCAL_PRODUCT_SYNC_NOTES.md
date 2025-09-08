### Shopify Sync — Phase 0 Notes

- Pinned Admin API version: 2025-07
  - Next review: 2025-10-01
- Required scopes to start (least privilege):
  - read_products
  - read_product_listings
  - read_collections
  - read_inventory (if inventory levels are needed)
  - read_locations (only if accessing inventory/locations)
  - Optional for cross-checks: read_orders, read_customers

- Env vars (add to `.env.local`, never commit secrets):
  - MYSHOPIFY_DOMAIN=mystore.myshopify.com
  - SHOPIFY*ACCESS_TOKEN=shpat*...
  - SHOPIFY_API_VERSION=2025-07

- Verification command:
  - `npm run shopify:verify`
    - Fetches shop info and attempts to list first product to validate scopes and API version.
  - Verified on 2025-09-02 with shop "Anna Ciok - Art and Prints".

- Rotation & upgrades:
  - Reinstall the app and regenerate token after scope changes.
  - Document quarterly review for Admin API version; upgrade in a test window.
