import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import {
  extractWebhookHeaders,
  verifyWebhookSignature,
  isDuplicateEvent,
  markEventProcessed,
  parseWebhookEvent,
  logWebhookDiagnostics,
  createWebhookResponse,
} from '@/lib/webhook-utils';

const prisma = new PrismaClient();

/**
 * Shopify Product Webhook Handler
 * Handles: products/create, products/update, products/delete
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let webhookEvent = '';
  let headers: any = {};
  
  try {
    // Extract headers
    headers = extractWebhookHeaders(request.headers);
    const topic = request.headers.get('x-shopify-topic') || 'products/unknown';
    webhookEvent = topic;
    
    console.log(`[Webhook] Processing ${topic} event`);
    
    // Verify HMAC signature
    const webhookSecret = process.env.SHOPIFY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('[Webhook] SHOPIFY_WEBHOOK_SECRET not configured');
      logWebhookDiagnostics(webhookEvent, headers, false, 'Missing webhook secret');
      return createWebhookResponse(false, 'Webhook secret not configured', 500);
    }
    
    const rawBody = await request.text();
    const signature = headers['x-shopify-hmac-sha256'];
    
    if (!signature) {
      logWebhookDiagnostics(webhookEvent, headers, false, 'Missing HMAC signature');
      return createWebhookResponse(false, 'Missing HMAC signature', 400);
    }
    
    if (!verifyWebhookSignature(rawBody, signature, webhookSecret)) {
      logWebhookDiagnostics(webhookEvent, headers, false, 'Invalid HMAC signature');
      return createWebhookResponse(false, 'Invalid HMAC signature', 401);
    }
    
    // Check for duplicate events
    const eventId = headers['x-shopify-event-id'];
    const webhookId = headers['x-shopify-webhook-id'];
    
    if (isDuplicateEvent(eventId, webhookId)) {
      logWebhookDiagnostics(webhookEvent, headers, true, 'Duplicate event ignored');
      return createWebhookResponse(true, 'Event already processed');
    }
    
    // Parse the webhook event
    const event = await parseWebhookEvent(
      new Request(request.url, {
        method: 'POST',
        headers: request.headers,
        body: rawBody,
      }),
      headers
    );
    
    if (!event) {
      logWebhookDiagnostics(webhookEvent, headers, false, 'Failed to parse event');
      return createWebhookResponse(false, 'Failed to parse webhook event', 400);
    }
    
    // Process the event asynchronously (don't wait)
    processWebhookEvent(topic, event).catch(error => {
      console.error(`[Webhook] Async processing failed for ${topic}:`, error);
    });
    
    // Mark as processed to prevent duplicates
    markEventProcessed(eventId, webhookId);
    
    // Respond immediately (Shopify expects quick response)
    const processingTime = Date.now() - startTime;
    logWebhookDiagnostics(webhookEvent, headers, true, `Processed in ${processingTime}ms`);
    
    return createWebhookResponse(true, `${topic} event queued for processing`);
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`[Webhook] Error processing ${webhookEvent}:`, error);
    logWebhookDiagnostics(
      webhookEvent,
      headers,
      false,
      `Error after ${processingTime}ms: ${error instanceof Error ? error.message : String(error)}`
    );
    
    return createWebhookResponse(false, 'Internal server error', 500);
  }
}

/**
 * Process webhook event asynchronously
 */
async function processWebhookEvent(topic: string, event: any): Promise<void> {
  try {
    switch (topic) {
      case 'products/create':
        await handleProductCreate(event.body);
        break;
      case 'products/update':
        await handleProductUpdate(event.body);
        break;
      case 'products/delete':
        await handleProductDelete(event.body);
        break;
      default:
        console.warn(`[Webhook] Unhandled topic: ${topic}`);
    }
  } catch (error) {
    console.error(`[Webhook] Processing error for ${topic}:`, error);
    throw error; // Re-throw for potential retry logic
  }
}

/**
 * Handle product creation
 */
async function handleProductCreate(product: any): Promise<void> {
  try {
    console.log(`[Webhook] Creating product: ${product.title} (${product.id})`);
    
    await prisma.product.upsert({
      where: { shopifyId: product.id },
      update: {
        handle: product.handle,
        title: product.title,
        bodyHtml: product.body_html || null,
        vendor: product.vendor || null,
        productType: product.product_type || null,
        status: product.status || null,
        publishedAt: product.published_at ? new Date(product.published_at) : null,
        shopifyUpdatedAt: product.updated_at ? new Date(product.updated_at) : null,
      },
      create: {
        shopifyId: product.id,
        handle: product.handle,
        title: product.title,
        bodyHtml: product.body_html || null,
        vendor: product.vendor || null,
        productType: product.product_type || null,
        status: product.status || null,
        publishedAt: product.published_at ? new Date(product.published_at) : null,
        shopifyUpdatedAt: product.updated_at ? new Date(product.updated_at) : null,
      },
    });
    
    // Process variants, options, and images
    await processProductRelations(product);
    
    console.log(`[Webhook] Successfully created product: ${product.title}`);
  } catch (error) {
    console.error(`[Webhook] Error creating product ${product.id}:`, error);
    throw error;
  }
}

/**
 * Handle product update
 */
async function handleProductUpdate(product: any): Promise<void> {
  try {
    console.log(`[Webhook] Updating product: ${product.title} (${product.id})`);
    
    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { shopifyId: product.id },
    });
    
    if (!existingProduct) {
      console.log(`[Webhook] Product ${product.id} not found, creating it`);
      await handleProductCreate(product);
      return;
    }
    
    // Update product
    await prisma.product.update({
      where: { shopifyId: product.id },
      data: {
        handle: product.handle,
        title: product.title,
        bodyHtml: product.body_html || null,
        vendor: product.vendor || null,
        productType: product.product_type || null,
        status: product.status || null,
        publishedAt: product.published_at ? new Date(product.published_at) : null,
        shopifyUpdatedAt: product.updated_at ? new Date(product.updated_at) : null,
      },
    });
    
    // Process variants, options, and images
    await processProductRelations(product);
    
    console.log(`[Webhook] Successfully updated product: ${product.title}`);
  } catch (error) {
    console.error(`[Webhook] Error updating product ${product.id}:`, error);
    throw error;
  }
}

/**
 * Handle product deletion (soft delete)
 */
async function handleProductDelete(product: any): Promise<void> {
  try {
    console.log(`[Webhook] Deleting product: ${product.id}`);
    
    await prisma.product.update({
      where: { shopifyId: product.id },
      data: {
        deletedAt: new Date(),
        status: 'deleted',
      },
    });
    
    console.log(`[Webhook] Successfully soft-deleted product: ${product.id}`);
  } catch (error) {
    // If product doesn't exist, that's okay for delete operations
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      console.log(`[Webhook] Product ${product.id} already deleted or doesn't exist`);
      return;
    }
    
    console.error(`[Webhook] Error deleting product ${product.id}:`, error);
    throw error;
  }
}

/**
 * Process product variants, options, and media
 */
async function processProductRelations(product: any): Promise<void> {
  const productRecord = await prisma.product.findUnique({
    where: { shopifyId: product.id },
    select: { id: true },
  });
  
  if (!productRecord) return;
  
  // Process variants
  if (product.variants && Array.isArray(product.variants)) {
    for (const variant of product.variants) {
      await prisma.variant.upsert({
        where: { shopifyId: variant.id },
        update: {
          title: variant.title || null,
          sku: variant.sku || null,
          priceAmount: variant.price ? String(variant.price) : null,
          priceCurrency: 'USD', // Default currency
          compareAtPriceAmount: variant.compare_at_price ? String(variant.compare_at_price) : null,
          compareAtPriceCurrency: variant.compare_at_price ? 'USD' : null,
          position: variant.position ?? null,
          barcode: variant.barcode || null,
          inventoryPolicy: variant.inventory_policy || null,
          inventoryItemId: variant.inventory_item_id ? String(variant.inventory_item_id) : null,
          taxable: variant.taxable ?? null,
          shopifyUpdatedAt: variant.updated_at ? new Date(variant.updated_at) : null,
        },
        create: {
          shopifyId: variant.id,
          productId: productRecord.id,
          title: variant.title || null,
          sku: variant.sku || null,
          priceAmount: variant.price ? String(variant.price) : null,
          priceCurrency: 'USD',
          compareAtPriceAmount: variant.compare_at_price ? String(variant.compare_at_price) : null,
          compareAtPriceCurrency: variant.compare_at_price ? 'USD' : null,
          position: variant.position ?? null,
          barcode: variant.barcode || null,
          inventoryPolicy: variant.inventory_policy || null,
          inventoryItemId: variant.inventory_item_id ? String(variant.inventory_item_id) : null,
          taxable: variant.taxable ?? null,
          shopifyUpdatedAt: variant.updated_at ? new Date(variant.updated_at) : null,
        },
      });
    }
  }
  
  // Process options (replace all)
  if (product.options && Array.isArray(product.options)) {
    await prisma.productOption.deleteMany({
      where: { productId: productRecord.id },
    });
    
    const optionData = product.options.map((option: any, index: number) => ({
      productId: productRecord.id,
      name: option.name,
      position: option.position ?? index,
    }));
    
    if (optionData.length > 0) {
      await prisma.productOption.createMany({
        data: optionData,
      });
    }
  }
  
  // Process images/media (replace all)
  if (product.images && Array.isArray(product.images)) {
    await prisma.productMedia.deleteMany({
      where: { productId: productRecord.id },
    });
    
    const mediaData = product.images.map((image: any, index: number) => ({
      productId: productRecord.id,
      shopifyId: image.id ? String(image.id) : null,
      mediaType: 'IMAGE',
      url: image.src || image.url,
      altText: image.alt || null,
      position: image.position ?? index,
      width: image.width ?? null,
      height: image.height ?? null,
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