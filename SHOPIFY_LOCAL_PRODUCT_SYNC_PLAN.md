### Shopify → Local DB Product Replication Plan

This plan outlines how to replicate Shopify product data into a local database inside this repository. It is split into phases with clear tasks, definitions of done (DOD), and deliverables. The approach favors SQLite + Prisma for local development (easy to swap to Postgres later), GraphQL Bulk API for the initial backfill, and webhooks + scheduled deltas for ongoing sync.

Must-have improvements incorporated from current Shopify Admin API best practices:
- Pin a specific Admin API version and set a regular upgrade cadence.
- Handle GraphQL cost-based throttling and REST 429s with backoff.
- Implement webhook HMAC verification, deduplication, and async processing.
- Use overlap windows and cursor-based pagination for delta sync.
- Model product media, inventory items/levels, and precise money types.
- Add observability (metrics/alerts) and developer-friendly scripts.

---

### Phase 0 — Prerequisites and Access

- **Tasks**
  - [x] Ensure Shopify custom app exists and token is valid. (Verified via shop info + products on 2025-09-02)
  - [ ] Add required Admin API scopes to the app:
    - read_products, read_product_listings, read_inventory (required for inventory levels), read_collections, read_locations (if touching Inventory/Location in GraphQL)
    - read_orders (optional for cross-check), read_customers (optional)
  - [ ] Reinstall the app after scope changes; generate a fresh access token.
  - [x] Store token via environment variables (not committed). Keep MCP config updated. (Done: .env.local)
  - [x] Decide local DB: SQLite (default) with Prisma; optional future Postgres.
  - [x] Pin Admin API version to 2025-07 and document a quarterly review/upgrade procedure (cadence, test window).
  - [ ] Minimize scopes to least privilege; document rotation policy on scope changes.
  - [ ] Note that incoming webhooks include `X-Shopify-API-Version`; log it for diagnostics and version drift detection.

- **DOD**
  - Token with correct scopes is verified by fetching shop info and listing products/collections successfully against the pinned API version (2025-07).
    - Status: Shop info and products verified on 2025-09-02. Collections verification pending.
  - Sensitive values live in `.env.local` or local secret store; are not committed.
  - A short note documents the pinned API version (2025-07) and the next quarterly review date.

- **Deliverables**
  - Updated `.env.local` containing `SHOPIFY_ACCESS_TOKEN` and `MYSHOPIFY_DOMAIN`.
  - Brief note documenting granted scopes and pinned API version.

---

### Phase 1 — Local Database and ORM Setup (SQLite + Prisma)

- **Tasks**
  - [ ] Add Prisma as a dependency and initialize Prisma in the project.
  - [ ] Configure SQLite database file under `./prisma/dev.db` (repo-local).
  - [ ] Add Prisma client generation and basic script scaffolding (e.g., `npm run prisma:generate`, `npm run prisma:migrate`).
  - [ ] Document minimal commands for developers.

- **DOD**
  - Running `prisma generate` succeeds.
  - SQLite file is created in the repo and ignored by VCS as appropriate.

- **Deliverables**
  - `prisma/schema.prisma` with datasource pointing to SQLite.
  - `package.json` scripts for generate/migrate.

---

### Phase 2 — Schema Design and Migrations

- **Recommended logical schema**
  - Product: id, shopifyId, handle, title, bodyHtml, vendor, productType, status, publishedAt, deletedAt (soft delete), tags, shopifyUpdatedAt, createdAt, updatedAt
  - ProductOption: id, productId, name, position
  - Variant: id, shopifyId, productId, title, sku, priceAmount (decimal), priceCurrency (text) [or a single JSON column resembling MoneyV2], compareAtPriceAmount (decimal), compareAtPriceCurrency (text), position, barcode, inventoryPolicy, inventoryItemId, requiresShipping, taxable, weight, weightUnit, shopifyUpdatedAt
  - ProductMedia: id, shopifyId, productId, mediaType, src (or url), previewImage, altText, position, width, height, checksum (optional)
  - Collection: id, shopifyId, handle, title, bodyHtml, sortOrder, deletedAt (soft delete), shopifyUpdatedAt
  - ProductCollection: productId, collectionId (join)
  - InventoryLevel (optional): inventoryItemId, locationId, available
  - SyncState: resourceType, lastCursor (or lastSyncTime)
  - Metafield (optional): id, ownerType, ownerId, namespace, key, type, value
  - Indexes/keys: UNIQUE(shopifyId) on key tables; UNIQUE(inventoryItemId, locationId) on InventoryLevel; composite indexes (productId, position) on options/media; `handle` unique per shop.

- **Tasks**
  - [ ] Translate the logical schema into Prisma models with indexes on `shopifyId`, `handle`, and foreign keys.
  - [ ] Use precise decimal types for monetary amounts; avoid floating point. Represent currency explicitly per amount or via MoneyV2-like JSON.
  - [ ] Normalize `tags` or store as a searchable array with indexes.
  - [ ] Add JSON fields for rarely-used/metafield blobs if a separate table is not used.
  - [ ] Create the initial migration and apply it.

- **DOD**
  - Migration applies cleanly on a fresh clone.
  - Prisma client compiles and types are generated.

- **Deliverables**
  - `prisma/schema.prisma` models + `prisma/migrations/*` for initial schema.

---

### Phase 3 — Initial Backfill via Shopify GraphQL Bulk API

- **Tasks**
  - [ ] Implement a backfill script that:
    - Authenticates with Shopify using env vars.
    - Starts a GraphQL Bulk operation to fetch products with variants, options, and images.
    - Starts bulk with `groupObjects: false` for maximum throughput (unless grouped structure is required later).
    - Streams the resulting NDJSON to disk, then imports in batches (e.g., 500–1000 rows) into SQLite using Prisma upserts keyed by `shopifyId` within DB transactions (enable SQLite WAL for throughput).
  - [ ] Optionally backfill collections and product-collection mappings (via separate bulk queries or REST where simpler).
  - [ ] Add resilience: retry with backoff, verify job completion, and checksum counts (e.g., product/variant totals).
  - [ ] Persist bulk job id and a resume token so the import can safely restart after interruption.
  - [ ] Respect GraphQL cost-based throttling signals and pause if approaching limits.
  - [ ] Enforce only one active bulk operation per shop (Shopify constraint); queue new requests until completion.
  - [ ] Subscribe to `bulk_operations/finish` for observability and alerting on completion/failure.

- **DOD**
  - A full store backfill completes without errors.
  - Row counts make sense (e.g., products in DB ≈ products from API).
  - Spot-checked products match titles/handles/prices from Shopify Admin.

- **Deliverables**
  - `scripts/shopify-backfill.ts` (or similar) with documented usage.
  - Stored NDJSON artifacts in a temp folder (gitignored) for audit.

---

### Phase 4 — Ongoing Sync: Webhooks + Scheduled Deltas

- **Tasks**
  - [ ] Create webhook endpoints (e.g., Next.js API routes) for:
    - `products/create`, `products/update`, `products/delete`
    - `collections/create`, `collections/update`, `collections/delete` (if mirroring collections)
  - [ ] Verify Shopify can reach the webhook endpoints locally (ngrok or tunnel in dev) and in prod if applicable.
  - [ ] Verify webhook HMAC signatures against the raw request body using the shared secret; compare in constant time.
  - [ ] Deduplicate events using `X-Shopify-Event-Id` (TTL 24–48h). Fallback to `X-Shopify-Webhook-Id` if needed. Treat headers case-insensitively.
  - [ ] Determine processing order using `X-Shopify-Triggered-At` (when available) or `updated_at` from payload.
  - [ ] Immediately respond 200 and enqueue payloads for async processing; implement retry/backoff for transient failures.
  - [ ] Add a dead-letter queue and a periodic reprocessor for failed events.
  - [ ] Implement a scheduled delta sync (e.g., hourly) using GraphQL with cursor pagination and an overlap window of 2–5 minutes; for REST, use `products(query:"updated_at:>=<ISO8601> AND status:any")` with cursors.
  - [ ] Add retry/backoff for rate limits and transient failures.
  - [ ] Respect GraphQL `extensions.cost.throttleStatus` and REST 429 `Retry-After` headers.

- **DOD**
  - Webhook deliveries show 2xx responses and update the local DB.
  - Delta sync finds and applies changes missed by webhooks without duplication; overlap window prevents misses from clock skew.
  - Conflicts resolved by preferring the latest `updatedAt` from Shopify.

- **Deliverables**
  - `/src/app/api/shopify/webhooks/*` routes (or similar) with verification of HMAC signatures and event deduplication.
  - `scripts/shopify-delta-sync.ts` (or a job runner) to perform periodic updates.

---

### Phase 5 — Validation, Tests, and Observability

- **Tasks**
  - [ ] Unit tests for transformation/mapping from Shopify payloads to Prisma models.
  - [ ] Snapshot tests for representative product/variant payloads.
  - [ ] Snapshot tests for MoneyV2-like pricing (multiple currencies, including zero-decimal currencies) and media types.
  - [ ] Consistency checker: compare sample of products and variant counts vs Shopify.
  - [ ] Add logging/metrics for bulk job durations, rows processed/sec, webhook throughput, delta freshness lag, and error rates.
  - [ ] Alerts on stalled bulk jobs, repeated webhook failures, and consistency drift beyond threshold.

- **DOD**
  - Tests pass locally; mappings are deterministic and idempotent.
  - Consistency checker reports within acceptable deltas.

- **Deliverables**
  - `/tests/shopify-sync/*.test.ts` or colocated tests with scripts.
  - `scripts/check-consistency.ts` producing a short report and emitting metrics.

---

### Phase 6 — Developer UX and Minimal Commands

- **Tasks**
  - [ ] Provide minimal npm scripts:
    - `sync:backfill` → full bulk backfill
    - `sync:delta` → incremental updates
    - `sync:resume` → resume a partial bulk import by job id
    - `sync:check` → run consistency checks and print metrics summary
    - `db:reset` → reset and re-run migrations (dev only)
  - [ ] Document how to run locally without extra tooling; keep commands minimal.
  - [ ] Document tunneling steps (e.g., ngrok) to test webhooks locally.
  - [ ] In README, add a short note about REST 429 `Retry-After` handling and GraphQL `extensions.cost.throttleStatus` as the backoff signals developers should use.

- **DOD**
  - New developers can run a full sync with one or two commands and get a populated DB.

- **Deliverables**
  - `README` section for sync workflow.
  - `package.json` scripts with brief help.

---

### Phase 7 — Optional: Promote to Postgres (Staging/Production)

- **Tasks**
  - [ ] Add Postgres datasource to Prisma; keep models the same.
  - [ ] Configure connection via environment variables; generate and run migrations.
  - [ ] Load test backfill and webhook throughput.

- **DOD**
  - Same codebase runs on Postgres with no model changes.
  - Performance is acceptable under expected load.

- **Deliverables**
  - Updated `schema.prisma` with a Postgres datasource (optional switch).
  - Deployment notes for the DB and secrets management.

---

### Risks and Mitigations

- **Rate limits / Bulk job failures**: Use GraphQL Bulk for initial load; implement retries + backoff.
- **Webhook delivery issues**: Add scheduled delta sync to cover gaps; log failures and retries.
- **Schema drift**: Keep Prisma migrations small and incremental; add indexes for common queries.
- **Secrets exposure**: Use local env files and never commit tokens; rotate on scope changes.
- **API version deprecations**: Pin Admin API version and review quarterly; run contract tests on upgrade.
- **Media/file model changes**: Treat images/media as a general media entity; do not assume only images.

---

### References and Example Resources

- Bulk import performance and patterns: Medium — "100x faster Shopify product import" (GraphQL Bulk API).
- Synchronization strategy overview (webhooks + scheduled): Little Stream Software.
- Conceptual sync example (Django): `django-shopify-sync` on GitHub.
- Alternative local JSON approach: `shop-databaser` on GitHub.
- Shopify Admin API topics to consult:
  - GraphQL Bulk operations (products, variants, images, collections)
  - Cost-based throttling (`extensions.cost.throttleStatus`) and REST rate limits
  - Webhooks HMAC verification and `X-Shopify-Webhook-Id` deduplication
  - Product media (`stagedUploadsCreate`, `productCreateMedia`) and Files API
  - Inventory (`inventoryItem`, `inventoryLevel`) and locations
  - Quarterly Admin API versioning policy

---

### Quick Acceptance Checklist (Global DOD)

- [ ] Initial backfill completes; local counts align with Shopify within expected tolerance.
- [ ] Webhooks apply new/updated/deleted product changes within seconds.
- [ ] Delta sync reconciles any missed updates at least daily.
- [ ] Developers can set up and run sync in under 10 minutes.


