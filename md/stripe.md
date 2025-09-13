# STRIPE SYNCHRONIZATION TASK LIST

## Overview
Synchronize products and variants from Postgres database to Stripe using MCP tools for postgres and stripe operations.

## Prerequisites
- [ ] Verify DATABASE_URL environment variable is set
- [ ] Confirm Stripe test key (sk_test_...) is configured
- [ ] Ensure MCP postgres and stripe tools are available
- [ ] Validate database connection and schema

---

## PHASE 1: DATABASE CONNECTION & DATA EXTRACTION

### Task 1.1: Connect to Postgres Database
- [ ] Use MCP postgres `connect` with DATABASE_URL
- [ ] Verify connection status
- [ ] Test basic query execution

### Task 1.2: Extract Products and Variants Data
- [ ] Execute SQL query to fetch products with variants:
  ```sql
  SELECT 
    p.handle as product_slug,
    p.title as product_name,
    p.bodyHtml as product_description,
    v.shopifyId as variant_id,
    v.title as variant_title,
    v.sku as variant_sku,
    v.priceAmount as unit_amount,
    v.priceCurrency as currency,
    v.position as variant_position,
    v.barcode,
    v.weight,
    v.weightUnit,
    v.taxable,
    v.requiresShipping,
    v.inventoryPolicy,
    v.inventoryItem,
    v.compareAtPrice,
    v.barcode,
    -- Extract variant attributes (size, color, etc.)
    COALESCE(
      json_object(
        'size', CASE WHEN v.title LIKE '%size:%' THEN 
          TRIM(SUBSTRING(v.title FROM 'size:([^,]+)')) 
        END,
        'color', CASE WHEN v.title LIKE '%color:%' THEN 
          TRIM(SUBSTRING(v.title FROM 'color:([^,]+)')) 
        END,
        'material', CASE WHEN v.title LIKE '%material:%' THEN 
          TRIM(SUBSTRING(v.title FROM 'material:([^,]+)')) 
        END
      ), 
      '{}'
    ) as variant_attributes
  FROM Product p
  LEFT JOIN Variant v ON p.id = v.productId
  WHERE p.deletedAt IS NULL 
    AND v.deletedAt IS NULL
    AND p.status = 'ACTIVE'
  ORDER BY p.handle, v.position;
  ```
- [ ] Validate data structure and completeness
- [ ] Check for NULL or invalid unit_amount values
- [ ] Group data by product_slug for processing

---

## PHASE 2: STRIPE VALIDATION & SETUP

### Task 2.1: Validate Stripe Environment
- [ ] Verify Stripe key starts with `sk_test_`
- [ ] Test Stripe API connectivity
- [ ] Check Stripe account status and limits

### Task 2.2: Check Existing Stripe Data
- [ ] Use `stripe_list_products` to get existing products
- [ ] Filter by metadata.slug to find matching products
- [ ] Use `stripe_list_prices` to get existing prices
- [ ] Filter by lookup_key patterns to find existing variants
- [ ] Create mapping of existing Stripe data for idempotency

---

## PHASE 3: PRODUCT SYNCHRONIZATION

### Task 3.1: Process Product Groups
For each unique product_slug from database:

#### Task 3.1.1: Check if Product Exists
- [ ] Search existing Stripe products by metadata.slug = product_slug
- [ ] If found, store product_id for variant processing
- [ ] If not found, mark for creation

#### Task 3.1.2: Create Missing Products
- [ ] Use `stripe_create_product` with:
  - `name`: product_name from database
  - `description`: product_description (sanitized HTML)
  - `metadata.slug`: product_slug
  - `metadata.source`: 'postgres_sync'
  - `metadata.sync_date`: current timestamp
- [ ] Store created product_id
- [ ] Log product creation success/failure

### Task 3.2: Product Creation Validation
- [ ] Verify all products created successfully
- [ ] Handle any creation failures with retry logic
- [ ] Update product mapping for variant processing

---

## PHASE 4: VARIANT SYNCHRONIZATION

### Task 4.1: Process Variants in Batches
Process variants in batches of maximum 100 items:

#### Task 4.1.1: Prepare Variant Data
- [ ] Group variants by product_id
- [ ] Sort variant attributes consistently for lookup_key generation
- [ ] Generate lookup_key format: `{product_slug}:{sorted_attributes}`
- [ ] Validate unit_amount > 0 (skip invalid records with warning)

#### Task 4.1.2: Check Existing Prices
- [ ] For each variant, check if price exists by lookup_key
- [ ] Skip creation if price already exists
- [ ] Log skipped duplicates

#### Task 4.1.3: Create New Prices
- [ ] Use `stripe_create_price` with:
  - `currency`: from database
  - `unit_amount`: from database (convert to cents)
  - `product`: product_id from Phase 3
  - `lookup_key`: generated lookup_key
  - `metadata`: variant attributes (size, color, sku, etc.)
  - `metadata.source`: 'postgres_sync'
  - `metadata.sync_date`: current timestamp
- [ ] Store created price_id
- [ ] Log price creation success/failure

### Task 4.2: Batch Processing
- [ ] Process variants in batches of 100
- [ ] Implement error handling for each batch
- [ ] Continue processing even if individual items fail
- [ ] Log batch completion status

---

## PHASE 5: ERROR HANDLING & VALIDATION

### Task 5.1: Error Handling
- [ ] Implement try-catch for all Stripe API calls
- [ ] Log detailed error messages for failed operations
- [ ] Continue processing despite individual failures
- [ ] Track failed items for retry or manual review

### Task 5.2: Data Validation
- [ ] Validate all created products exist in Stripe
- [ ] Validate all created prices exist in Stripe
- [ ] Cross-reference database data with Stripe data
- [ ] Identify any missing or incorrect synchronizations

### Task 5.3: Conflict Resolution
- [ ] Identify duplicate lookup_keys
- [ ] Resolve metadata conflicts
- [ ] Handle currency mismatches
- [ ] Address unit_amount discrepancies

---

## PHASE 6: REPORTING & VERIFICATION

### Task 6.1: Generate Synchronization Report
- [ ] Count products created vs. skipped
- [ ] Count prices created vs. skipped
- [ ] List all product_id → [price_ids] mappings
- [ ] Document any conflicts or errors

### Task 6.2: Create Summary Report
```
SYNCHRONIZATION SUMMARY
======================

Products:
- Total in database: X
- Created in Stripe: Y
- Skipped (already exist): Z
- Failed: W

Variants/Prices:
- Total in database: X
- Created in Stripe: Y
- Skipped (already exist): Z
- Failed: W

Conflicts:
- Duplicate lookup_keys: [list]
- Invalid unit_amounts: [list]
- Currency mismatches: [list]

Product Mappings:
- product_id_1: [price_id_1, price_id_2, ...]
- product_id_2: [price_id_3, price_id_4, ...]
```

### Task 6.3: Verification Steps
- [ ] Verify all products are accessible via Stripe API
- [ ] Test price lookup by lookup_key
- [ ] Validate metadata accuracy
- [ ] Confirm no data corruption

---

## PHASE 7: CLEANUP & OPTIMIZATION

### Task 7.1: Cleanup
- [ ] Close database connections
- [ ] Clear temporary data structures
- [ ] Archive log files
- [ ] Update sync timestamps

### Task 7.2: Performance Optimization
- [ ] Analyze processing time per batch
- [ ] Identify bottlenecks
- [ ] Optimize for future runs
- [ ] Document performance metrics

---

## IMPLEMENTATION NOTES

### Security Considerations
- [ ] Only use test keys (sk_test_...)
- [ ] Never log sensitive data
- [ ] Validate all input data
- [ ] Implement rate limiting

### Idempotency Strategy
- [ ] Use lookup_key for price deduplication
- [ ] Use metadata.slug for product deduplication
- [ ] Check existing data before creation
- [ ] Skip duplicates gracefully

### Error Recovery
- [ ] Implement retry logic for transient failures
- [ ] Log all errors for debugging
- [ ] Continue processing despite individual failures
- [ ] Provide clear error messages

### Monitoring
- [ ] Track sync duration
- [ ] Monitor API rate limits
- [ ] Log success/failure rates
- [ ] Alert on critical failures

---

## SUCCESS CRITERIA

- [ ] All valid products synchronized to Stripe
- [ ] All valid variants synchronized as Stripe prices
- [ ] No duplicate products or prices created
- [ ] Complete mapping of product_id → price_ids
- [ ] Detailed report of synchronization results
- [ ] Zero data corruption or loss
- [ ] All errors properly logged and handled

---

## ROLLBACK PLAN

If synchronization fails or causes issues:
- [ ] Document all created Stripe objects
- [ ] Implement cleanup script to remove created objects
- [ ] Restore from backup if necessary
- [ ] Investigate and fix root cause
- [ ] Re-run synchronization after fixes

---

## FUTURE ENHANCEMENTS

- [ ] Implement incremental sync (only changed items)
- [ ] Add real-time sync via webhooks
- [ ] Implement bidirectional sync (Stripe → Postgres)
- [ ] Add sync scheduling and automation
- [ ] Implement conflict resolution UI
- [ ] Add sync performance monitoring dashboard
