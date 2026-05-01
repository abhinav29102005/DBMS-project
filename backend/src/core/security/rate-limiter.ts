/**
 * UIMS — Rate Limiter Middleware (Upstash Redis)
 *
 * Re-exports the cache/redis rate-limit helper as
 * an itty-router-compatible middleware.
 */

import { createRedisClient, checkRateLimit } from '../../infrastructure/cache/redis';
import { RateLimitError } from '../errors/app-error';
import { RATE_LIMITS } from '../config/constants';
import type { Env } from '../types/env';
import type { AuthenticatedRequest } from '../types/context';

/**
 * Rate limit middleware factory.
 * Call with a named preset from RATE_LIMITS.
 */
export function rateLimit(preset: keyof typeof RATE_LIMITS) {
  const { max, windowSec } = RATE_LIMITS[preset];

  return async (request: AuthenticatedRequest, env: Env) => {
    const redis = createRedisClient(env);
    const ip = request.headers.get('CF-Connecting-IP') || '0.0.0.0';
    const key = `rl:${preset}:${ip}`;

    const result = await checkRateLimit(redis, key, max, windowSec);
    if (!result.allowed) {
      throw new RateLimitError(result.resetAt - Math.floor(Date.now() / 1000));
    }
  };
}
