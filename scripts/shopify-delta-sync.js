#!/usr/bin/env node
/*
 Phase 4 — Scheduled Delta Sync Script
 - Uses GraphQL cursor pagination with overlap window to catch missed updates
 - Handles rate limiting and cost-based throttling
 - Updates SyncState to track cursors and sync timestamps
 - Can be run periodically (e.g., hourly) via cron or scheduler

 Usage:
   node --env-file=.env --env-file=.env.local --env-file=env.local scripts/shopify-delta-sync.js

 Required env vars:
   MYSHOPIFY_DOMAIN
   SHOPIFY_ACCESS_TOKEN  
   SHOPIFY_API_VERSION
   DATABASE_URL
*/

'use strict';

const https = require('https');
const { PrismaClient } = require('../src/generated/prisma');

function getEnv(name, { required = true } = {}) {
  const value = process.env[name];
  if (required && (!value || value.trim().length === 0)) {
    console.error(`Missing required env var: ${name}`);
    process.exit(1);
  }
  return value;
}

async function postGraphQL({ domain, token, apiVersion, query, variables }) {
  const options = {
    method: 'POST',
    hostname: domain,
    path: `/admin/api/${apiVersion}/graphql.json`,
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token,
    },
  };
  const body = JSON.stringify(variables ? { query, variables } : { query });

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, json });
        } catch (err) {
          reject(err);
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseISOOrNull(s) {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function asDecimalString(money) {
  if (!money) return null;
  if (typeof money === 'string') return money;
  if (typeof money === 'number') return String(money);
  if (typeof money === 'object' && money.amount != null) return String(money.amount);
  return null;
}

/**
 * Handle GraphQL cost-based throttling
 */
async function handleThrottling(extensions) {
  if (!extensions?.cost?.throttleStatus) return;
  
  const { throttleStatus } = extensions.cost;
  const { maximumAvailable, currentlyAvailable, restoreRate } = throttleStatus;
  
  if (currentlyAvailable < maximumAvailable * 0.1) {
    const waitTime = Math.ceil((maximumAvailable * 0.5 - currentlyAvailable) / restoreRate) * 1000;
    console.log(`[Delta] Throttling detected, waiting ${waitTime}ms for cost restoration`);
    await sleep(waitTime);
  }
}

/**
 * Get sync cursor and timestamp for a resource type
 */
async function getSyncState(prisma, resourceType) {
  const state = await prisma.syncState.findUnique({
    where: { resourceType }
  });
  
  return {
    cursor: state?.lastCursor || null,
    lastSyncTime: state?.lastSyncTime || null,
  };
}

/**
 * Update sync cursor and timestamp
 */
async function updateSyncState(prisma, resourceType, cursor, syncTime = new Date()) {
  await prisma.syncState.upsert({
    where: { resourceType },
    update: {
      lastCursor: cursor,
      lastSyncTime: syncTime,
    },
    create: {
      resourceType,
      lastCursor: cursor,
      lastSyncTime: syncTime,
    },
  });
}

/**
 * Build GraphQL query with cursor and updated_at filter
 */
function buildProductsQuery(cursor, updatedAtSince) {
  const cursorArg = cursor ? `after: "${cursor}"` : '';
  const updatedAtFilter = updatedAtSince 
    ? `query: "updated_at:>='${updatedAtSince.toISOString()}'"` 
    : '';
  
  const args = [cursorArg, updatedAtFilter, 'first: 50'].filter(Boolean).join(', ');
  
  return `#graphql
    query DeltaProducts {
      products(${args}) {
        edges {
          cursor
          node {
            id
            handle
            title
            descriptionHtml
            vendor
            productType
            status
            publishedAt
            tags
            updatedAt
            options {
              name
              position
            }
            variants(first: 250) {
              edges {
                node {
                  id
                  title
                  sku
                  price
                  compareAtPrice
                  position
                  barcode
                  inventoryPolicy
                  inventoryItem { id }
                  taxable
                  updatedAt
                }
              }
            }
            media(first: 250) {
              edges {
                node {
                  mediaContentType
                  ... on MediaImage {
                    id
                    image { 
                      url 
                      altText 
                      width 
                      height
                    }
                  }
                }
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;
}

/**
 * Process a single product update
 */
async function processProductUpdate(prisma, product) {
  const p = product.node;
  
  // Upsert product
  const productRecord = await prisma.product.upsert({
    where: { shopifyId: p.id },
    update: {
      handle: p.handle,
      title: p.title,
      bodyHtml: p.descriptionHtml || null,
      vendor: p.vendor || null,
      productType: p.productType || null,
      status: p.status || null,
      publishedAt: parseISOOrNull(p.publishedAt),
      shopifyUpdatedAt: parseISOOrNull(p.updatedAt),
    },
    create: {
      shopifyId: p.id,
      handle: p.handle,
      title: p.title,
      bodyHtml: p.descriptionHtml || null,
      vendor: p.vendor || null,
      productType: p.productType || null,
      status: p.status || null,
      publishedAt: parseISOOrNull(p.publishedAt),
      shopifyUpdatedAt: parseISOOrNull(p.updatedAt),
    },
  });

  // Process variants
  if (p.variants?.edges?.length > 0) {
    for (const variantEdge of p.variants.edges) {
      const v = variantEdge.node;
      await prisma.variant.upsert({
        where: { shopifyId: v.id },
        update: {
          title: v.title || null,
          sku: v.sku || null,
          priceAmount: asDecimalString(v.price),
          priceCurrency: 'USD',
          compareAtPriceAmount: asDecimalString(v.compareAtPrice),
          compareAtPriceCurrency: v.compareAtPrice ? 'USD' : null,
          position: v.position ?? null,
          barcode: v.barcode || null,
          inventoryPolicy: v.inventoryPolicy || null,
          inventoryItemId: v?.inventoryItem?.id || null,
          taxable: v.taxable ?? null,
          shopifyUpdatedAt: parseISOOrNull(v.updatedAt),
        },
        create: {
          shopifyId: v.id,
          productId: productRecord.id,
          title: v.title || null,
          sku: v.sku || null,
          priceAmount: asDecimalString(v.price),
          priceCurrency: 'USD',
          compareAtPriceAmount: asDecimalString(v.compareAtPrice),
          compareAtPriceCurrency: v.compareAtPrice ? 'USD' : null,
          position: v.position ?? null,
          barcode: v.barcode || null,
          inventoryPolicy: v.inventoryPolicy || null,
          inventoryItemId: v?.inventoryItem?.id || null,
          taxable: v.taxable ?? null,
          shopifyUpdatedAt: parseISOOrNull(v.updatedAt),
        },
      });
    }
  }

  // Process options (replace all for this product)
  await prisma.productOption.deleteMany({
    where: { productId: productRecord.id },
  });
  
  if (p.options?.length > 0) {
    const optionData = p.options.map((option, index) => ({
      productId: productRecord.id,
      name: option.name,
      position: option.position ?? index,
    }));
    
    await prisma.productOption.createMany({
      data: optionData,
    });
  }

  // Process media (replace all for this product)
  await prisma.productMedia.deleteMany({
    where: { productId: productRecord.id },
  });
  
  if (p.media?.edges?.length > 0) {
    const mediaData = p.media.edges
      .filter(edge => edge.node.mediaContentType === 'IMAGE' && edge.node.image)
      .map((edge, index) => ({
        productId: productRecord.id,
        shopifyId: edge.node.id || null,
        mediaType: 'IMAGE',
        url: edge.node.image.url,
        altText: edge.node.image.altText || null,
        position: index,
        width: edge.node.image.width ?? null,
        height: edge.node.image.height ?? null,
        checksum: null,
        previewImage: null,
      }));
    
    if (mediaData.length > 0) {
      await prisma.productMedia.createMany({
        data: mediaData,
      });
    }
  }
}

/**
 * Main delta sync function
 */
async function main() {
  const domain = getEnv('MYSHOPIFY_DOMAIN');
  const token = getEnv('SHOPIFY_ACCESS_TOKEN');
  const apiVersion = getEnv('SHOPIFY_API_VERSION');
  getEnv('DATABASE_URL'); // ensure present

  const prisma = new PrismaClient();
  const startTime = Date.now();
  
  try {
    console.log('[Delta] Starting scheduled delta sync...');
    
    // Get current sync state
    const syncState = await getSyncState(prisma, 'products');
    console.log('[Delta] Current sync state:', {
      cursor: syncState.cursor?.substring(0, 20) + '...',
      lastSync: syncState.lastSyncTime?.toISOString(),
    });
    
    // Calculate overlap window (5 minutes ago to catch missed events)
    const overlapWindow = new Date(Date.now() - 5 * 60 * 1000);
    const updatedAtSince = syncState.lastSyncTime && syncState.lastSyncTime < overlapWindow
      ? syncState.lastSyncTime 
      : overlapWindow;
    
    console.log(`[Delta] Syncing products updated since: ${updatedAtSince.toISOString()}`);
    
    let cursor = null; // Start fresh for time-based queries
    let totalProcessed = 0;
    let hasNextPage = true;
    let newCursor = null;
    
    while (hasNextPage) {
      const query = buildProductsQuery(cursor, updatedAtSince);
      
      const { status, json } = await postGraphQL({
        domain,
        token,
        apiVersion,
        query,
      });
      
      if (status !== 200 || json.errors) {
        console.error('[Delta] GraphQL query failed:', json.errors || status);
        throw new Error(`GraphQL query failed: ${JSON.stringify(json.errors || status)}`);
      }
      
      // Handle cost-based throttling
      await handleThrottling(json.extensions);
      
      const products = json.data?.products?.edges || [];
      const pageInfo = json.data?.products?.pageInfo;
      
      console.log(`[Delta] Processing batch of ${products.length} products`);
      
      // Process products in transaction batches
      const BATCH_SIZE = 10;
      for (let i = 0; i < products.length; i += BATCH_SIZE) {
        const batch = products.slice(i, i + BATCH_SIZE);
        
        await prisma.$transaction(
          async (tx) => {
            for (const product of batch) {
              await processProductUpdate(tx, product);
            }
          },
          { timeout: 60000 }
        );
        
        totalProcessed += batch.length;
        
        if (batch.length > 0) {
          newCursor = batch[batch.length - 1].cursor;
        }
      }
      
      hasNextPage = pageInfo?.hasNextPage || false;
      cursor = pageInfo?.endCursor || null;
      
      if (hasNextPage && cursor) {
        console.log(`[Delta] Continuing to next page (cursor: ${cursor.substring(0, 20)}...)`);
        await sleep(100); // Small delay between pages
      }
    }
    
    // Update sync state
    if (newCursor) {
      await updateSyncState(prisma, 'products', newCursor);
    }
    
    const duration = Date.now() - startTime;
    console.log(`[Delta] Sync completed successfully:`);
    console.log(`  - Products processed: ${totalProcessed}`);
    console.log(`  - Duration: ${duration}ms`);
    console.log(`  - Final cursor: ${newCursor?.substring(0, 20)}...`);
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[Delta] Sync failed after ${duration}ms:`, error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the delta sync
main().catch((err) => {
  console.error('Delta sync failed:', err);
  process.exit(1);
});