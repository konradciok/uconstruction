import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Shopify Webhook Utilities
 * Handles HMAC verification, deduplication, and event processing
 */

export interface ShopifyWebhookHeaders {
  'x-shopify-webhook-id'?: string;
  'x-shopify-event-id'?: string;
  'x-shopify-triggered-at'?: string;
  'x-shopify-api-version'?: string;
  'x-shopify-shop-domain'?: string;
  'x-shopify-hmac-sha256'?: string;
}

export interface WebhookEvent {
  id: string;
  eventId: string;
  triggeredAt: Date;
  apiVersion: string;
  shopDomain: string;
  body: unknown;
  processed: boolean;
  createdAt: Date;
  retryCount?: number;
  lastError?: string;
}

// In-memory event cache for deduplication (24h TTL)
const eventCache = new Map<string, { timestamp: number; processed: boolean }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Verify Shopify webhook HMAC signature
 */
export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  try {
    const hmac = createHmac('sha256', secret);
    hmac.update(body, 'utf8');
    const calculatedSignature = hmac.digest('base64');

    // Use timing-safe comparison
    const signatureBuffer = Buffer.from(signature, 'base64');
    const calculatedBuffer = Buffer.from(calculatedSignature, 'base64');

    if (signatureBuffer.length !== calculatedBuffer.length) {
      return false;
    }

    return timingSafeEqual(signatureBuffer, calculatedBuffer);
  } catch (error) {
    console.error('HMAC verification error:', error);
    return false;
  }
}

/**
 * Extract and normalize webhook headers (case-insensitive)
 */
export function extractWebhookHeaders(headers: Headers): ShopifyWebhookHeaders {
  const result: ShopifyWebhookHeaders = {};

  // Convert Headers to case-insensitive lookup
  const headerMap = new Map<string, string>();
  headers.forEach((value, key) => {
    headerMap.set(key.toLowerCase(), value);
  });

  result['x-shopify-webhook-id'] = headerMap.get('x-shopify-webhook-id');
  result['x-shopify-event-id'] = headerMap.get('x-shopify-event-id');
  result['x-shopify-triggered-at'] = headerMap.get('x-shopify-triggered-at');
  result['x-shopify-api-version'] = headerMap.get('x-shopify-api-version');
  result['x-shopify-shop-domain'] = headerMap.get('x-shopify-shop-domain');
  result['x-shopify-hmac-sha256'] = headerMap.get('x-shopify-hmac-sha256');

  return result;
}

/**
 * Check if event has already been processed (deduplication)
 */
export function isDuplicateEvent(eventId: string, webhookId?: string): boolean {
  // Clean up expired entries
  cleanExpiredEvents();

  // Primary deduplication using X-Shopify-Event-Id
  if (eventId && eventCache.has(eventId)) {
    console.log(`Duplicate event detected: ${eventId}`);
    return true;
  }

  // Fallback to X-Shopify-Webhook-Id if Event-Id not available
  if (!eventId && webhookId && eventCache.has(webhookId)) {
    console.log(`Duplicate webhook detected: ${webhookId}`);
    return true;
  }

  return false;
}

/**
 * Mark event as processed to prevent reprocessing
 */
export function markEventProcessed(eventId: string, webhookId?: string): void {
  const timestamp = Date.now();
  const cacheEntry = { timestamp, processed: true };

  if (eventId) {
    eventCache.set(eventId, cacheEntry);
  }

  if (webhookId) {
    eventCache.set(webhookId, cacheEntry);
  }
}

/**
 * Clean up expired events from cache
 */
function cleanExpiredEvents(): void {
  const now = Date.now();
  const expired: string[] = [];

  for (const [key, entry] of eventCache.entries()) {
    if (now - entry.timestamp > CACHE_TTL) {
      expired.push(key);
    }
  }

  expired.forEach((key) => eventCache.delete(key));

  if (expired.length > 0) {
    console.log(`Cleaned up ${expired.length} expired webhook events`);
  }
}

/**
 * Parse webhook event from request
 */
export async function parseWebhookEvent(
  request: Request,
  headers: ShopifyWebhookHeaders
): Promise<WebhookEvent | null> {
  try {
    const body = await request.json();
    const eventId =
      headers['x-shopify-event-id'] || headers['x-shopify-webhook-id'];

    if (!eventId) {
      console.error('Missing event ID in webhook headers');
      return null;
    }

    const triggeredAt = headers['x-shopify-triggered-at']
      ? new Date(headers['x-shopify-triggered-at'])
      : new Date();

    return {
      id: headers['x-shopify-webhook-id'] || eventId,
      eventId,
      triggeredAt,
      apiVersion: headers['x-shopify-api-version'] || 'unknown',
      shopDomain: headers['x-shopify-shop-domain'] || 'unknown',
      body,
      processed: false,
      createdAt: new Date(),
    };
  } catch (error) {
    console.error('Error parsing webhook event:', error);
    return null;
  }
}

/**
 * Log webhook diagnostics
 */
export function logWebhookDiagnostics(
  event: string,
  headers: ShopifyWebhookHeaders,
  success: boolean,
  error?: string
): void {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    event,
    eventId: headers['x-shopify-event-id'],
    webhookId: headers['x-shopify-webhook-id'],
    apiVersion: headers['x-shopify-api-version'],
    shopDomain: headers['x-shopify-shop-domain'],
    success,
    error,
  };

  console.log('[Webhook]', JSON.stringify(diagnostics));

  // Log version drift detection
  const expectedVersion = process.env.SHOPIFY_API_VERSION;
  const receivedVersion = headers['x-shopify-api-version'];

  if (
    expectedVersion &&
    receivedVersion &&
    expectedVersion !== receivedVersion
  ) {
    console.warn(
      `[Webhook] API version drift detected: expected ${expectedVersion}, received ${receivedVersion}`
    );
  }
}

/**
 * Create standardized webhook response
 */
export function createWebhookResponse(
  success: boolean,
  message: string,
  status: number = success ? 200 : 500
): Response {
  return new Response(
    JSON.stringify({
      success,
      message,
      timestamp: new Date().toISOString(),
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}
