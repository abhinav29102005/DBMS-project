

import { Redis } from '@upstash/redis';
import type { Env } from '../../core/types/env';

export function createRedisClient(env: Env): Redis {
  // Mock Redis to unblock development while troubleshooting Upstash 1016 errors
  return {
    get: async () => null,
    set: async () => 'OK',
    del: async () => 1,
    incr: async () => 1,
    expire: async () => true,
    ttl: async () => -1,
  } as any;
}
  // return new Redis({
  //   url: env.UPSTASH_REDIS_REST_URL,
  //   token: env.UPSTASH_REDIS_REST_TOKEN,
  //   // @ts-ignore - Cloudflare Workers don't support the 'cache' property in fetch
  //   fetch: (url: string, init: any) => {
  //     const { cache, ...rest } = init || {};
  //     return fetch(url, rest);
  //   },
  // });
export async function cacheGet<T>(
  redis: Redis,
  key: string,
  ttlSeconds: number,
  factory: () => Promise<T | null>
): Promise<T | null> {
  const cached = await redis.get<T>(key);
  if (cached !== null && cached !== undefined) {
    return cached;
  }

  const value = await factory();
  if (value !== null && value !== undefined) {
    await redis.set(key, JSON.stringify(value), { ex: ttlSeconds });
  }
  return value;
}

export async function cacheInvalidate(
  redis: Redis,
  key: string
): Promise<void> {
  await redis.del(key);
}

export async function checkRateLimit(
  redis: Redis,
  key: string,
  maxRequests: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const current = await redis.incr(key);

  if (current === 1) {
    await redis.expire(key, windowSeconds);
  }

  const ttl = await redis.ttl(key);
  const resetAt = Math.floor(Date.now() / 1000) + (ttl > 0 ? ttl : windowSeconds);

  return {
    allowed: current <= maxRequests,
    remaining: Math.max(0, maxRequests - current),
    resetAt,
  };
}

export async function acquireIdempotencyKey(
  redis: Redis,
  key: string,
  ttlSeconds = 86400
): Promise<boolean> {
  const result = await redis.set(key, '1', { nx: true, ex: ttlSeconds });
  return result === 'OK';
}
