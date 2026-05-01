/**
 * UIMS API — CORS Middleware
 *
 * Handles preflight OPTIONS requests and sets CORS headers
 * on all responses. Configured via CORS_ORIGIN env var.
 */

import { type Env } from '../types/env';

/**
 * Create CORS headers for the given origin configuration.
 */
export function corsHeaders(env: Env): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': env.CORS_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Correlation-ID, X-Idempotency-Key',
    'Access-Control-Expose-Headers': 'X-Correlation-ID',
    'Access-Control-Max-Age': '86400',
  };
}

/**
 * Handle CORS preflight OPTIONS request.
 */
export function handleOptions(env: Env): Response {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(env),
  });
}

/**
 * Attach CORS headers to an existing Response.
 */
export function withCors(response: Response, env: Env): Response {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(corsHeaders(env))) {
    headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
