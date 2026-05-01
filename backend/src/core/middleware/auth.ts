/**
 * UIMS API — Auth Middleware
 */

import { verifyAccessToken } from '../../modules/auth/domain/jwt';
import { createRedisClient } from '../../infrastructure/cache/redis';
import { createDbClient, setRequestContext } from '../../infrastructure/database/connection';
import { UserRepository } from '../../modules/auth/infrastructure/user-repository';
import { UnauthorizedError, ForbiddenError } from '../errors/app-error';
import type { Env } from '../types/env';
import type { AuthenticatedRequest, RequestContext } from '../types/context';

/**
 * Require authentication for the request.
 * Verifies JWT and attaches RequestContext.
 */
export async function requireAuth(
  request: AuthenticatedRequest,
  env: Env
): Promise<void> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError();
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = await verifyAccessToken(token, env.JWT_ACCESS_SECRET);
    
    // Get permissions from cache (Redis)
    const redis = createRedisClient(env);
    const permKey = `auth:perms:${payload.sub}`;
    let permissions: string[] | null = await redis.get(permKey);

    if (!permissions) {
      // Fallback to DB if cache missed
      const sql = createDbClient(env);
      const userRepo = new UserRepository(sql);
      const details = await userRepo.getUserAuthDetails(payload.sub);
      permissions = details.permissions;
      
      // Re-populate cache
      await redis.set(permKey, JSON.stringify(permissions), { ex: 300 });
    }

    // Build context
    const ctx: RequestContext = {
      userId: payload.sub,
      role: payload.role,
      permissions: permissions || [],
      correlationId: request.headers.get('X-Correlation-ID') || crypto.randomUUID(),
      scopeId: payload.scopeId
    };

    request.ctx = ctx;

    // Set DB session GUCs for RLS
    const sql = createDbClient(env);
    await setRequestContext(sql, ctx.userId, ctx.role, ctx.correlationId);

  } catch (err) {
    throw new UnauthorizedError('Invalid or expired token');
  }
}

/**
 * Require a specific permission for the request.
 * Must be used AFTER requireAuth.
 */
export function requirePermission(permission: string) {
  return (request: AuthenticatedRequest) => {
    if (!request.ctx) {
      throw new UnauthorizedError();
    }

    if (!request.ctx.permissions.includes(permission) && request.ctx.role !== 'admin') {
      throw new ForbiddenError(`Missing required permission: ${permission}`);
    }
  };
}

/**
 * Require any of the specified roles.
 * Must be used AFTER requireAuth.
 */
export function requireRole(roles: string[]) {
  return (request: AuthenticatedRequest) => {
    if (!request.ctx) {
      throw new UnauthorizedError();
    }

    if (!roles.includes(request.ctx.role) && request.ctx.role !== 'admin') {
      throw new ForbiddenError('Insufficient role privileges');
    }
  };
}
