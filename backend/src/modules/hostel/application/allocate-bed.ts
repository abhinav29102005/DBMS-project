/**
 * UIMS Hostel — Allocate Bed Use Case
 */

import { HostelRepository } from '../infrastructure/hostel-repository';
import { ValidationError, ConflictError } from '../../../core/errors/app-error';
import { acquireIdempotencyKey, createRedisClient } from '../../../infrastructure/cache/redis';
import type { Env } from '../../../core/types/env';

export class AllocateBedUseCase {
  constructor(private repo: HostelRepository, private env: Env) {}

  async execute(studentId: string, bedId: string, idempotencyKey: string, allocatedBy: string): Promise<string> {
    // 1. Redis idempotency check (prevent duplicate allocations)
    const redis = createRedisClient(this.env);
    const isNew = await acquireIdempotencyKey(redis, `hostel:alloc:${idempotencyKey}`);
    if (!isNew) {
      // Return existing — idempotent
      const existing = await this.repo.getAllocationByStudentId(studentId);
      if (existing) return existing.id;
      throw new ConflictError('Duplicate allocation request');
    }

    // 2. Delegate to PL/pgSQL atomic function
    return this.repo.allocateBed(studentId, bedId, idempotencyKey, allocatedBy);
  }
}
