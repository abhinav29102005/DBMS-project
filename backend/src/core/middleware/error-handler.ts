

import { AppError } from '../errors/app-error';
import type { ApiErrorResponse } from '../types/context';

export function errorHandler(
  error: unknown,
  correlationId: string
): Response {

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
