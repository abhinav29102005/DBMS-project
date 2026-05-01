/**
 * UIMS API — Upstash Redis Client
 *
 * Uses @upstash/redis REST-native client which works natively
 * in Cloudflare Workers (no TCP connection needed).
 *
 * Use cases:
 * - Cache auth.permissions per user_id (TTL 5 min)
 * - Cache reference data: departments, course catalog (TTL 1 hr)
 * - Rate limiting: sliding window per IP for /auth/login
 * - Idempotency keys: SET NX EX 86400 for hostel allocation
 */

import { Redis } from '@upstash/redis';
import type { Env } from '../../core/types/env';

/**
 * Create an Upstash Redis client for the current request.
 */
export function createRedisClient(env: Env): Redis {
  return new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });
}

// ─── Cache Helpers ─────────────────────────────────────────

/**
 * Get a cached value, or compute and cache it.
 * Returns null if the factory returns null.
 */
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

/**
 * Invalidate a cache key.
 */
export async function cacheInvalidate(
  redis: Redis,
  key: string
): Promise<void> {
  await redis.del(key);
}

// ─── Rate Limiting ─────────────────────────────────────────

/**
 * Sliding window rate limiter.
 * Returns { allowed: boolean, remaining: number, resetAt: number }
 */
export async function checkRateLimit(
  redis: Redis,
  key: string,
  maxRequests: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const current = await redis.incr(key);

  // Set expiry on first request in window
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

// ─── Idempotency ───────────────────────────────────────────

/**
 * Try to acquire an idempotency lock.
 * Returns true if the key was newly set (first attempt).
 * Returns false if the key already exists (duplicate request).
 */
export async function acquireIdempotencyKey(
  redis: Redis,
  key: string,
  ttlSeconds = 86400
): Promise<boolean> {
  const result = await redis.set(key, '1', { nx: true, ex: ttlSeconds });
  return result === 'OK';
}
