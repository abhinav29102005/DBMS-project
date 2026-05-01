import type { IRequest } from 'itty-router';

/**
 * UIMS API — Request Context
 *
 * Propagated through the request lifecycle after authentication.
 * Used by middleware, use cases, and repositories for authorization
 * and audit trail context.
 */
export interface RequestContext {
  /** Authenticated user's UUID */
  userId: string;

  /** Primary role for this request (e.g. 'student', 'faculty', 'admin') */
  role: string;

  /** All permissions granted to the user via their roles */
  permissions: string[];

  /** Unique correlation ID for request tracing */
  correlationId: string;

  /** Optional scope ID (e.g. department_id for faculty, hostel_id for warden) */
  scopeId?: string;
}

/**
 * Extended Request type with UIMS context attached by auth middleware.
 */
export interface AuthenticatedRequest extends IRequest {
  ctx?: RequestContext;
}

/**
 * Standard paginated response shape.
 */
export interface PaginatedResponse<T> {
  items: T[];
  nextCursor: string | null;
  countHint?: number;
}

/**
 * Standard API error response shape.
 */
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    correlationId: string;
    details?: Record<string, unknown>;
  };
}
