

export function getCorrelationId(request: Request): string {
  return request.headers.get('X-Correlation-ID') || crypto.randomUUID();
}

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
