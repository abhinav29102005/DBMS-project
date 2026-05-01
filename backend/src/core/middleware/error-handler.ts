/**
 * UIMS API — Error Handler Middleware
 *
 * Global error boundary for the Workers request lifecycle.
 * Catches AppError subtypes and unknown errors, returning
 * a normalized JSON error response with correlation ID.
 */

import { AppError } from '../errors/app-error';
import type { ApiErrorResponse } from '../types/context';

/**
 * Wrap a handler with global error catching.
 * Returns a structured JSON error response for any thrown error.
 */
export function errorHandler(
  error: unknown,
  correlationId: string
): Response {
  // Known application errors
  if (error instanceof AppError) {
    const body: ApiErrorResponse = {
      error: {
        code: error.code,
        message: error.message,
        correlationId,
        details: error.details,
      },
    };

    return new Response(JSON.stringify(body), {
      status: error.statusCode,
      headers: {
        'Content-Type': 'application/json',
        'X-Correlation-ID': correlationId,
      },
    });
  }

  // Unknown/unexpected errors
  console.error(`[${correlationId}] Unhandled error:`, error);

  const body: ApiErrorResponse = {
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      correlationId,
    },
  };

  return new Response(JSON.stringify(body), {
    status: 500,
    headers: {
      'Content-Type': 'application/json',
      'X-Correlation-ID': correlationId,
    },
  });
}
