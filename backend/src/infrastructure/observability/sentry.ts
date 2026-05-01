

import { captureException, captureMessage, addBreadcrumb as sentryBreadcrumb } from '@sentry/cloudflare';

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

export function addBreadcrumb(message: string, category: string, data?: Record<string, unknown>): void {
  sentryBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
}
