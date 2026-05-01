/**
 * infrastructure/redis — re-export of cache/redis
 *
 * This module exists for backwards-compatibility with imports
 * that reference the `redis/` path. All logic lives in cache/redis.ts.
 */

export {
  createRedisClient,
  cacheGet,
  cacheInvalidate,
  checkRateLimit,
  acquireIdempotencyKey,
} from '../cache/redis';
