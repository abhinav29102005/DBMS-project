/**
 * UIMS API — Correlation ID Middleware
 *
 * Extracts X-Correlation-ID from incoming request headers,
 * or generates a new UUID if absent. Used for end-to-end
 * request tracing across Workers → Neon → Upstash.
 */

/**
 * Extract or generate a correlation ID for the request.
 */
export function getCorrelationId(request: Request): string {
  return request.headers.get('X-Correlation-ID') || crypto.randomUUID();
}

/**
 * Attach correlation ID header to an outgoing Response.
 */
export function withCorrelationId(
  response: Response,
  correlationId: string
): Response {
  const headers = new Headers(response.headers);
  headers.set('X-Correlation-ID', correlationId);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
