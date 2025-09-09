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

interface ShopifyCollection {
  id: number;
  title: string;
  handle: string;
  body_html?: string;
  published_at?: string;
  sort_order?: string;
  template_suffix?: string;
  disjunctive?: boolean;
  rules?: Array<{
    column: string;
    relation: string;
    condition: string;
  }>;
  published_scope?: string;
  updated_at?: string;
  created_at?: string;
}

/**
 * Shopify Collection Webhook Handler
 * Handles: collections/create, collections/update, collections/delete
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let webhookEvent = '';
  let headers: ShopifyWebhookHeaders = {};

  try {
    // Extract headers
    headers = extractWebhookHeaders(request.headers);
    const topic =
      request.headers.get('x-shopify-topic') || 'collections/unknown';
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
    processWebhookEvent(topic, event.body as ShopifyCollection).catch((error) => {
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
async function processWebhookEvent(topic: string, event: ShopifyCollection): Promise<void> {
  try {
    switch (topic) {
      case 'collections/create':
        await handleCollectionCreate(event);
        break;
      case 'collections/update':
        await handleCollectionUpdate(event);
        break;
      case 'collections/delete':
        await handleCollectionDelete(event);
        break;
      default:
        console.warn(`[Webhook] Unhandled collection topic: ${topic}`);
    }
  } catch (error) {
    console.error(`[Webhook] Collection processing error for ${topic}:`, error);
    throw error;
  }
}

/**
 * Handle collection creation
 */
async function handleCollectionCreate(collection: ShopifyCollection): Promise<void> {
  try {
    console.log(
      `[Webhook] Creating collection: ${collection.title} (${collection.id})`
    );

    await prisma.collection.upsert({
      where: { shopifyId: collection.id.toString() },
      update: {
        handle: collection.handle,
        title: collection.title,
        bodyHtml: collection.body_html || null,
        sortOrder: collection.sort_order || null,
        shopifyUpdatedAt: collection.updated_at
          ? new Date(collection.updated_at)
          : null,
      },
      create: {
        shopifyId: collection.id.toString(),
        handle: collection.handle,
        title: collection.title,
        bodyHtml: collection.body_html || null,
        sortOrder: collection.sort_order || null,
        shopifyUpdatedAt: collection.updated_at
          ? new Date(collection.updated_at)
          : null,
      },
    });

    console.log(
      `[Webhook] Successfully created collection: ${collection.title}`
    );
  } catch (error) {
    console.error(
      `[Webhook] Error creating collection ${collection.id}:`,
      error
    );
    throw error;
  }
}

/**
 * Handle collection update
 */
async function handleCollectionUpdate(collection: ShopifyCollection): Promise<void> {
  try {
    console.log(
      `[Webhook] Updating collection: ${collection.title} (${collection.id})`
    );

    const existingCollection = await prisma.collection.findUnique({
      where: { shopifyId: collection.id.toString() },
    });

    if (!existingCollection) {
      console.log(
        `[Webhook] Collection ${collection.id} not found, creating it`
      );
      await handleCollectionCreate(collection);
      return;
    }

    await prisma.collection.update({
      where: { shopifyId: collection.id.toString() },
      data: {
        handle: collection.handle,
        title: collection.title,
        bodyHtml: collection.body_html || null,
        sortOrder: collection.sort_order || null,
        shopifyUpdatedAt: collection.updated_at
          ? new Date(collection.updated_at)
          : null,
      },
    });

    console.log(
      `[Webhook] Successfully updated collection: ${collection.title}`
    );
  } catch (error) {
    console.error(
      `[Webhook] Error updating collection ${collection.id}:`,
      error
    );
    throw error;
  }
}

/**
 * Handle collection deletion (soft delete)
 */
async function handleCollectionDelete(collection: ShopifyCollection): Promise<void> {
  try {
    console.log(`[Webhook] Deleting collection: ${collection.id}`);

    await prisma.collection.update({
      where: { shopifyId: collection.id.toString() },
      data: {
        deletedAt: new Date(),
      },
    });

    console.log(
      `[Webhook] Successfully soft-deleted collection: ${collection.id}`
    );
  } catch (error) {
    // If collection doesn't exist, that's okay for delete operations
    if (
      error instanceof Error &&
      error.message.includes('Record to update not found')
    ) {
      console.log(
        `[Webhook] Collection ${collection.id} already deleted or doesn't exist`
      );
      return;
    }

    console.error(
      `[Webhook] Error deleting collection ${collection.id}:`,
      error
    );
    throw error;
  }
}
