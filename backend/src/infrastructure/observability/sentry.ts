/**
 * UIMS Infrastructure — Sentry for Cloudflare Workers
 *
 * Uses @sentry/cloudflare captureException/captureMessage directly.
 * The SDK auto-initialises when these are called with a DSN set
 * via the `sentryDSN` transport helper.
 *
 * For full request-level tracing, wrap the handler with
 * `Sentry.withSentry()` in index.ts. For now, we use the
 * lightweight manual capture approach to stay simple.
 *
 * Free tier: 5,000 errors/month, 1 user, 30-day retention.
 */

import { captureException, captureMessage, addBreadcrumb as sentryBreadcrumb } from '@sentry/cloudflare';

/**
 * Manually capture an error and send to Sentry.
 * Safely wrapped — Sentry failures never crash the worker.
 */
export function captureError(error: unknown, extra?: Record<string, unknown>): void {
  try {
    if (error instanceof Error) {
      captureException(error, { extra });
    } else {
      captureMessage(String(error), { extra, level: 'error' });
    }
  } catch {
    console.error('[sentry] Failed to capture:', error);
  }
}

/**
 * Add a breadcrumb for debugging context.
 */
export function addBreadcrumb(message: string, category: string, data?: Record<string, unknown>): void {
  sentryBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
}
