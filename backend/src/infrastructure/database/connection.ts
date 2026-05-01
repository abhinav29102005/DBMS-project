

import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import type { Env } from '../../core/types/env';

export function createDbClient(env: Env): NeonQueryFunction<false, false> {
  return neon(env.DATABASE_URL);
}

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
