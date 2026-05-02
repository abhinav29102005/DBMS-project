import type { IRequest } from 'itty-router';

export interface RequestContext {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
  correlationId: string;
  scopeId?: string;
}

export interface AuthenticatedRequest extends IRequest {
  ctx?: RequestContext;
}

export interface PaginatedResponse<T> {
  items: T[];
  nextCursor: string | null;
  countHint?: number;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    correlationId: string;
    details?: Record<string, unknown>;
  };
}
