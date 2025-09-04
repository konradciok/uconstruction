#!/usr/bin/env node
/*
 Phase 3 — Initial Backfill via Shopify GraphQL Bulk API
 - Starts a Bulk Operation for products with variants, options, and media
 - Streams NDJSON to disk, then imports into SQLite via Prisma
 - Uses upserts for Products/Variants (by shopifyId)
 - Replaces Options/Media per product (delete + recreate)

 Usage:
   node --env-file=.env --env-file=.env.local --env-file=env.local scripts/shopify-backfill.js

 Required env vars:
   MYSHOPIFY_DOMAIN
   SHOPIFY_ACCESS_TOKEN
   SHOPIFY_API_VERSION  (e.g., 2025-07)
   DATABASE_URL (for Prisma / SQLite)
*/

'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');
const readline = require('readline');

// Import Prisma client from generated output directory
let PrismaClient;
try {
  ({ PrismaClient } = require('../src/generated/prisma'));
} catch (e) {
  console.error('Failed to load PrismaClient from ../src/generated/prisma. Did you run "npm run prisma:generate"?');
  process.exit(1);
}

function getEnv(name, { required = true } = {}) {
  const value = process.env[name];
  if (required && (!value || value.trim().length === 0)) {
    console.error(`Missing required env var: ${name}`);
    process.exit(1);
  }
  return value;
}

function postGraphQL({ domain, token, apiVersion, query, variables }) {
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
  return new Promise((r) => setTimeout(r, ms));
}

function ensureDirSync(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function downloadToFile(url, outPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outPath);
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Download failed with status ${res.statusCode}`));
          return;
        }
        res.pipe(file);
        file
          .on('finish', () => file.close(() => resolve()))
          .on('error', reject);
      })
      .on('error', reject);
  });
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

async function main() {
  const domain = getEnv('MYSHOPIFY_DOMAIN');
  const token = getEnv('SHOPIFY_ACCESS_TOKEN');
  const apiVersion = getEnv('SHOPIFY_API_VERSION');
  getEnv('DATABASE_URL'); // ensure present

  // 1) Kick off Bulk Operation
  const bulkMutation = `#graphql
    mutation RunBulkProducts {
      bulkOperationRunQuery(
        query: """
        {
          products {
            edges {
              node {
                __typename
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
                options { __typename name position }
                variants(first: 250) {
                  edges { node {
                    __typename
                    id
                    title
                    sku
                    price
                    compareAtPrice
                    barcode
                    position
                    inventoryPolicy
                    taxable
                    inventoryItem { id }
                    updatedAt
                  } }
                }
                media(first: 250) {
                  edges { node {
                    __typename
                    mediaContentType
                    ... on MediaImage {
                      id
                      image { url altText width height originalSrc: url }
                    }
                  } }
                }
              }
            }
          }
        }
        """
      ) {
        bulkOperation { id status }
        userErrors { field message }
      }
    }
  `;

  const start = await postGraphQL({ domain, token, apiVersion, query: bulkMutation });
  if (start.status !== 200 || start.json.errors) {
    console.error('Failed to start bulk operation:', start.json.errors || start.json);
    process.exit(1);
  }
  const startErrors = start.json.data?.bulkOperationRunQuery?.userErrors;
  if (startErrors && startErrors.length) {
    console.error('Bulk operation userErrors:', startErrors);
    process.exit(1);
  }
  const opId = start.json.data?.bulkOperationRunQuery?.bulkOperation?.id;
  console.log('Bulk operation started:', opId);

  // 2) Poll until completion
  const pollQuery = `#graphql
    query CurrentBulkOperation { currentBulkOperation { id status errorCode createdAt completedAt objectCount url } }
  `;

  let status = 'RUNNING';
  let url = null;
  let lastCount = 0;
  while (true) {
    const { status: http, json } = await postGraphQL({ domain, token, apiVersion, query: pollQuery });
    if (http !== 200) {
      console.error('Polling failed with HTTP', http, json);
      process.exit(1);
    }
    const cur = json.data?.currentBulkOperation;
    status = cur?.status;
    url = cur?.url;
    const count = Number(cur?.objectCount || 0);
    if (count !== lastCount) {
      console.log(`[Bulk] status=${status} count=${count}`);
      lastCount = count;
    }

    if (status === 'COMPLETED') break;
    if (status === 'FAILED' || status === 'CANCELED') {
      console.error('Bulk operation did not complete:', cur);
      process.exit(1);
    }
    await sleep(4000);
  }

  if (!url) {
    console.error('Bulk completed but no URL provided.');
    process.exit(1);
  }

  // 3) Download NDJSON
  const outDir = path.join(process.cwd(), 'tmp');
  ensureDirSync(outDir);
  const outFile = path.join(outDir, `shopify-products-${Date.now()}.ndjson`);
  console.log('Downloading NDJSON to', outFile);
  await downloadToFile(url, outFile);
  console.log('Download complete.');

  // 4) Import to SQLite via Prisma
  const prisma = new PrismaClient();
  try {
    await prisma.$queryRawUnsafe('PRAGMA journal_mode=WAL;');
    await prisma.$queryRawUnsafe('PRAGMA synchronous=NORMAL;');

    // Pass 1: Products
    await importProducts(prisma, outFile);
    // Pass 2: Variants (requires products exist)
    await importVariants(prisma, outFile);
    // Pass 3: Options & Media (replace per product)
    await importOptionsAndMedia(prisma, outFile);

    console.log('Backfill complete.');
  } finally {
    await prisma.$disconnect();
  }
}

async function importProducts(prisma, ndjsonPath) {
  console.log('Importing Products (pass 1)...');
  const rl = readline.createInterface({ input: fs.createReadStream(ndjsonPath), crlfDelay: Infinity });
  const ops = [];
  const BATCH = 500;
  async function flushOps() {
    if (!ops.length) return;
    const tx = ops.splice(0, ops.length);
    await prisma.$transaction(tx, { timeout: 120000 });
  }
  for await (const line of rl) {
    if (!line) continue;
    let obj; try { obj = JSON.parse(line); } catch { continue; }
    if (obj.__typename !== 'Product') continue;
    const p = obj;
    ops.push(
      prisma.product.upsert({
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
      })
    );
    if (ops.length >= BATCH) await flushOps();
  }
  await flushOps();
  console.log('Products import complete.');
}

async function importVariants(prisma, ndjsonPath) {
  console.log('Importing Variants (pass 2)...');
  const rl = readline.createInterface({ input: fs.createReadStream(ndjsonPath), crlfDelay: Infinity });
  const ops = [];
  const BATCH = 500;
  async function flushOps() {
    if (!ops.length) return;
    const tx = ops.splice(0, ops.length);
    await prisma.$transaction(tx, { timeout: 120000 });
  }
  for await (const line of rl) {
    if (!line) continue;
    let obj; try { obj = JSON.parse(line); } catch { continue; }
    if (obj.__typename !== 'ProductVariant') continue;
    const v = obj;
    const priceAmount = asDecimalString(v.price);
    const compareAmount = asDecimalString(v.compareAtPrice);

    ops.push(
      prisma.variant.upsert({
        where: { shopifyId: v.id },
        update: {
          title: v.title || null,
          sku: v.sku || null,
          priceAmount: priceAmount,
          priceCurrency: null,
          compareAtPriceAmount: compareAmount,
          compareAtPriceCurrency: null,
          position: v.position ?? null,
          barcode: v.barcode || null,
          inventoryPolicy: v.inventoryPolicy || null,
          inventoryItemId: v?.inventoryItem?.id || null,
          requiresShipping: null,
          taxable: v.taxable ?? null,
          weight: null,
          weightUnit: null,
          shopifyUpdatedAt: parseISOOrNull(v.updatedAt),
        },
        create: {
          shopifyId: v.id,
          title: v.title || null,
          sku: v.sku || null,
          priceAmount: priceAmount,
          priceCurrency: null,
          compareAtPriceAmount: compareAmount,
          compareAtPriceCurrency: null,
          position: v.position ?? null,
          barcode: v.barcode || null,
          inventoryPolicy: v.inventoryPolicy || null,
          inventoryItemId: v?.inventoryItem?.id || null,
          requiresShipping: null,
          taxable: v.taxable ?? null,
          weight: null,
          weightUnit: null,
          shopifyUpdatedAt: parseISOOrNull(v.updatedAt),
          product: { connect: { shopifyId: v.__parentId } },
        },
      })
    );

    if (ops.length >= BATCH) await flushOps();
  }
  await flushOps();
  console.log('Variants import complete.');
}

async function importOptionsAndMedia(prisma, ndjsonPath) {
  console.log('Importing Options and Media (pass 3)...');

  // Group options and media by product shopifyId
  const optionMap = new Map(); // shopifyId -> [{ name, position }]
  const mediaMap = new Map();  // shopifyId -> [{ mediaType, url, altText, width, height }]

  const rl = readline.createInterface({ input: fs.createReadStream(ndjsonPath), crlfDelay: Infinity });
  for await (const line of rl) {
    if (!line) continue;
    let obj; try { obj = JSON.parse(line); } catch { continue; }
    const t = obj.__typename;

    if (t === 'ProductOption') {
      const arr = optionMap.get(obj.__parentId) || [];
      arr.push({ name: obj.name, position: obj.position ?? 0 });
      optionMap.set(obj.__parentId, arr);
    } else if (t === 'MediaImage') {
      const img = obj.image || {};
      const url = img.url || img.originalSrc || null;
      if (!url) continue;
      const arr = mediaMap.get(obj.__parentId) || [];
      arr.push({
        mediaType: 'IMAGE',
        url,
        altText: img.altText || null,
        width: img.width ?? null,
        height: img.height ?? null,
      });
      mediaMap.set(obj.__parentId, arr);
    }
  }

  // Cache product numeric ids by shopifyId
  const productIdsCache = new Map(); // shopifyId -> numeric id
  async function getProductId(shopifyId) {
    if (productIdsCache.has(shopifyId)) return productIdsCache.get(shopifyId);
    const p = await prisma.product.findUnique({ where: { shopifyId }, select: { id: true } });
    if (!p) return null;
    productIdsCache.set(shopifyId, p.id);
    return p.id;
  }

  const shopifyIds = new Set([...optionMap.keys(), ...mediaMap.keys()]);
  let processed = 0;
  for (const shopifyId of shopifyIds) {
    const productId = await getProductId(shopifyId);
    if (!productId) continue;

    const optionData = (optionMap.get(shopifyId) || []).map((o) => ({
      productId,
      name: o.name,
      position: o.position ?? 0,
    }));

    const mediaData = (mediaMap.get(shopifyId) || []).map((m) => ({
      productId,
      mediaType: m.mediaType,
      url: m.url,
      previewImage: null,
      altText: m.altText,
      position: null,
      width: m.width,
      height: m.height,
      checksum: null,
    }));

    await prisma.$transaction(
      [
        prisma.productOption.deleteMany({ where: { productId } }),
        optionData.length
          ? prisma.productOption.createMany({ data: optionData })
          : prisma.$queryRawUnsafe('SELECT 1'),
        prisma.productMedia.deleteMany({ where: { productId } }),
        mediaData.length
          ? prisma.productMedia.createMany({ data: mediaData })
          : prisma.$executeRawUnsafe('SELECT 1'),
      ],
      { timeout: 120000 }
    );

    processed++;
    if (processed % 50 === 0) console.log(`Options/Media updated for ${processed} products...`);
  }

  console.log('Options and Media import complete.');
}

main().catch((err) => {
  console.error('Backfill failed:', err);
  process.exit(1);
});