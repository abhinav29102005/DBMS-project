/**
 * UIMS API — Neon Database Connection
 *
 * Uses @neondatabase/serverless driver which works natively
 * in Cloudflare Workers via HTTP transport (no TCP/net needed).
 *
 * Connection per request (stateless Workers):
 * - Each request creates one logical connection via HTTP
 * - Neon handles pooling server-side (PgBouncer transaction mode)
 * - Do NOT attempt persistent pools — isolates are ephemeral
 */

import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import type { Env } from '../../core/types/env';

/**
 * Create a Neon SQL client for the current request.
 *
 * Usage:
 *   const sql = createDbClient(env);
 *   const rows = await sql`SELECT * FROM auth.users WHERE id = ${userId}`;
 */
export function createDbClient(env: Env): NeonQueryFunction<false, false> {
  return neon(env.DATABASE_URL);
}

/**
 * Helper: set application-level session context for RLS policies.
 * Uses SET LOCAL which is scoped to the current transaction
 * (safe for PgBouncer transaction mode).
 *
 * Must be called at the start of each request that touches
 * RLS-protected tables.
 */
export async function setRequestContext(
  sql: NeonQueryFunction<false, false>,
  userId: string,
  role: string,
  requestId: string
): Promise<void> {
  await sql`SELECT auth.set_request_context(
    ${userId}::uuid,
    ${role}::text,
    ${requestId}::text
  )`;
}
