import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import {
  extractWebhookHeaders,
  verifyWebhookSignature,
  isDuplicateEvent,
  markEventProcessed,
  parseWebhookEvent,
  logWebhookDiagnostics,
  createWebhookResponse,
  ShopifyWebhookHeaders,
} from '@/lib/webhook-utils';

interface ShopifyProduct {
  id: number;
  title: string;
  handle: string;
  body_html?: string;
  vendor?: string;
  product_type?: string;
  created_at?: string;
  updated_at?: string;
  published_at?: string;
  template_suffix?: string;
  status?: string;
  published_scope?: string;
  tags?: string;
  admin_graphql_api_id?: string;
  variants?: Array<{
    id: number;
    product_id: number;
    title: string;
    price: string;
    sku?: string;
    position: number;
    inventory_policy: string;
    compare_at_price?: string;
    fulfillment_service: string;
    inventory_management?: string;
    option1?: string;
    option2?: string;
    option3?: string;
    created_at: string;
    updated_at: string;
    taxable: boolean;
    barcode?: string;
    grams: number;
    image_id?: number;
    weight: number;
    weight_unit: string;
    inventory_item_id: number;
    inventory_quantity: number;
    old_inventory_quantity: number;
    requires_shipping: boolean;
    admin_graphql_api_id: string;
  }>;
  options?: Array<{
    id: number;
    product_id: number;
    name: string;
    position: number;
    values: string[];
  }>;
  images?: Array<{
    id: number;
    product_id: number;
    position: number;
    created_at: string;
    updated_at: string;
    alt?: string;
    width: number;
    height: number;
    src: string;
    variant_ids: number[];
    admin_graphql_api_id: string;
  }>;
  image?: {
    id: number;
    product_id: number;
    position: number;
    created_at: string;
    updated_at: string;
    alt?: string;
    width: number;
    height: number;
    src: string;
    variant_ids: number[];
    admin_graphql_api_id: string;
  };
}

/**
 * Shopify Product Webhook Handler
 * Handles: products/create, products/update, products/delete
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let webhookEvent = '';
  let headers: ShopifyWebhookHeaders = {};

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
      logWebhookDiagnostics(
        webhookEvent,
        headers,
        false,
        'Missing webhook secret'
      );
      return createWebhookResponse(false, 'Webhook secret not configured', 500);
    }

    const rawBody = await request.text();
    const signature = headers['x-shopify-hmac-sha256'];

    if (!signature) {
      logWebhookDiagnostics(
        webhookEvent,
        headers,
        false,
        'Missing HMAC signature'
      );
      return createWebhookResponse(false, 'Missing HMAC signature', 400);
    }

    if (!verifyWebhookSignature(rawBody, signature, webhookSecret)) {
      logWebhookDiagnostics(
        webhookEvent,
        headers,
        false,
        'Invalid HMAC signature'
      );
      return createWebhookResponse(false, 'Invalid HMAC signature', 401);
    }

    // Check for duplicate events
    const eventId = headers['x-shopify-event-id'];
    const webhookId = headers['x-shopify-webhook-id'];

    if (eventId && webhookId && isDuplicateEvent(eventId, webhookId)) {
      logWebhookDiagnostics(
        webhookEvent,
        headers,
        true,
        'Duplicate event ignored'
      );
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
      logWebhookDiagnostics(
        webhookEvent,
        headers,
        false,
        'Failed to parse event'
      );
      return createWebhookResponse(false, 'Failed to parse webhook event', 400);
    }

    // Process the event asynchronously (don't wait)
    processWebhookEvent(topic, event.body as ShopifyProduct).catch((error) => {
      console.error(`[Webhook] Async processing failed for ${topic}:`, error);
    });

    // Mark as processed to prevent duplicates
    if (eventId && webhookId) {
      markEventProcessed(eventId, webhookId);
    }

    // Respond immediately (Shopify expects quick response)
    const processingTime = Date.now() - startTime;
    logWebhookDiagnostics(
      webhookEvent,
      headers,
      true,
      `Processed in ${processingTime}ms`
    );

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
async function processWebhookEvent(topic: string, event: ShopifyProduct): Promise<void> {
  try {
    switch (topic) {
      case 'products/create':
        await handleProductCreate(event);
        break;
      case 'products/update':
        await handleProductUpdate(event);
        break;
      case 'products/delete':
        await handleProductDelete(event);
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
async function handleProductCreate(product: ShopifyProduct): Promise<void> {
  try {
    console.log(`[Webhook] Creating product: ${product.title} (${product.id})`);

    await prisma.product.upsert({
      where: { shopifyId: product.id.toString() },
      update: {
        handle: product.handle,
        title: product.title,
        bodyHtml: product.body_html || null,
        vendor: product.vendor || null,
        productType: product.product_type || null,
        status: product.status || null,
        publishedAt: product.published_at
          ? new Date(product.published_at)
          : null,
        shopifyUpdatedAt: product.updated_at
          ? new Date(product.updated_at)
          : null,
      },
      create: {
        shopifyId: product.id.toString(),
        handle: product.handle,
        title: product.title,
        bodyHtml: product.body_html || null,
        vendor: product.vendor || null,
        productType: product.product_type || null,
        status: product.status || null,
        publishedAt: product.published_at
          ? new Date(product.published_at)
          : null,
        shopifyUpdatedAt: product.updated_at
          ? new Date(product.updated_at)
          : null,
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
async function handleProductUpdate(product: ShopifyProduct): Promise<void> {
  try {
    console.log(`[Webhook] Updating product: ${product.title} (${product.id})`);

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { shopifyId: product.id.toString() },
    });

    if (!existingProduct) {
      console.log(`[Webhook] Product ${product.id} not found, creating it`);
      await handleProductCreate(product);
      return;
    }

    // Update product
    await prisma.product.update({
      where: { shopifyId: product.id.toString() },
      data: {
        handle: product.handle,
        title: product.title,
        bodyHtml: product.body_html || null,
        vendor: product.vendor || null,
        productType: product.product_type || null,
        status: product.status || null,
        publishedAt: product.published_at
          ? new Date(product.published_at)
          : null,
        shopifyUpdatedAt: product.updated_at
          ? new Date(product.updated_at)
          : null,
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
async function handleProductDelete(product: ShopifyProduct): Promise<void> {
  try {
    console.log(`[Webhook] Deleting product: ${product.id}`);

    await prisma.product.update({
      where: { shopifyId: product.id.toString() },
      data: {
        deletedAt: new Date(),
        status: 'deleted',
      },
    });

    console.log(`[Webhook] Successfully soft-deleted product: ${product.id}`);
  } catch (error) {
    // If product doesn't exist, that's okay for delete operations
    if (
      error instanceof Error &&
      error.message.includes('Record to update not found')
    ) {
      console.log(
        `[Webhook] Product ${product.id} already deleted or doesn't exist`
      );
      return;
    }

    console.error(`[Webhook] Error deleting product ${product.id}:`, error);
    throw error;
  }
}

/**
 * Process product variants, options, and media
 */
async function processProductRelations(product: ShopifyProduct): Promise<void> {
  const productRecord = await prisma.product.findUnique({
    where: { shopifyId: product.id.toString() },
    select: { id: true },
  });

  if (!productRecord) return;

  // Process variants
  if (product.variants && Array.isArray(product.variants)) {
    for (const variant of product.variants) {
      await prisma.variant.upsert({
        where: { shopifyId: String(variant.id) },
        update: {
          title: variant.title || null,
          sku: variant.sku || null,
          priceAmount: variant.price ? String(variant.price) : null,
          priceCurrency: 'USD', // Default currency
          compareAtPriceAmount: variant.compare_at_price
            ? String(variant.compare_at_price)
            : null,
          compareAtPriceCurrency: variant.compare_at_price ? 'USD' : null,
          position: variant.position ?? null,
          barcode: variant.barcode || null,
          inventoryPolicy: variant.inventory_policy || null,
          inventoryItemId: variant.inventory_item_id
            ? String(variant.inventory_item_id)
            : null,
          taxable: variant.taxable ?? null,
          shopifyUpdatedAt: variant.updated_at
            ? new Date(variant.updated_at)
            : null,
        },
        create: {
          shopifyId: String(variant.id),
          productId: productRecord.id,
          title: variant.title || null,
          sku: variant.sku || null,
          priceAmount: variant.price ? String(variant.price) : null,
          priceCurrency: 'USD',
          compareAtPriceAmount: variant.compare_at_price
            ? String(variant.compare_at_price)
            : null,
          compareAtPriceCurrency: variant.compare_at_price ? 'USD' : null,
          position: variant.position ?? null,
          barcode: variant.barcode || null,
          inventoryPolicy: variant.inventory_policy || null,
          inventoryItemId: variant.inventory_item_id
            ? String(variant.inventory_item_id)
            : null,
          taxable: variant.taxable ?? null,
          shopifyUpdatedAt: variant.updated_at
            ? new Date(variant.updated_at)
            : null,
        },
      });
    }
  }

  // Process options (replace all)
  if (product.options && Array.isArray(product.options)) {
    await prisma.productOption.deleteMany({
      where: { productId: productRecord.id },
    });

    const optionData = product.options?.map((option, index: number) => ({
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

    const mediaData = product.images?.map((image, index: number) => ({
      productId: productRecord.id,
      shopifyId: image.id ? String(image.id) : null,
      mediaType: 'IMAGE',
      url: image.src,
      altText: image.alt || null,
      position: image.position ?? index,
      width: image.width ?? null,
      height: image.height ?? null,
      checksum: null,
    }));

    if (mediaData.length > 0) {
      await prisma.productMedia.createMany({
        data: mediaData,
      });
    }
  }
}
