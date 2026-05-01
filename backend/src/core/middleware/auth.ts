

import { verifyAccessToken } from '../../modules/auth/domain/jwt';
import { createRedisClient } from '../../infrastructure/cache/redis';
import { createDbClient, setRequestContext } from '../../infrastructure/database/connection';
import { UserRepository } from '../../modules/auth/infrastructure/user-repository';
import { UnauthorizedError, ForbiddenError } from '../errors/app-error';
import type { Env } from '../types/env';
import type { AuthenticatedRequest, RequestContext } from '../types/context';

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

    const redis = createRedisClient(env);
    const permKey = `auth:perms:${payload.sub}`;
    let permissions: string[] | null = await redis.get(permKey);

    if (!permissions) {

      const sql = createDbClient(env);
      const userRepo = new UserRepository(sql);
      const details = await userRepo.getUserAuthDetails(payload.sub);
      permissions = details.permissions;

      await redis.set(permKey, JSON.stringify(permissions), { ex: 300 });
    }

    const ctx: RequestContext = {
      userId: payload.sub,
      role: payload.role,
      permissions: permissions || [],
      correlationId: request.headers.get('X-Correlation-ID') || crypto.randomUUID(),
      scopeId: payload.scopeId
    };

    request.ctx = ctx;

    const sql = createDbClient(env);
    await setRequestContext(sql, ctx.userId, ctx.role, ctx.correlationId);

  } catch (err) {
    throw new UnauthorizedError('Invalid or expired token');
  }
}

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
