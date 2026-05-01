

import type { NeonQueryFunction } from '@neondatabase/serverless';
import type { Hostel, Room, Bed, Allocation } from '../domain/entities';

export class HostelRepository {
  constructor(private sql: NeonQueryFunction<false, false>) {}

  async findAllHostels(): Promise<Hostel[]> {
    return this.sql`SELECT * FROM hostel.hostels WHERE deleted_at IS NULL` as unknown as Hostel[];
  }

  async findBedById(id: string): Promise<Bed | null> {
    const rows = await this.sql`SELECT * FROM hostel.beds WHERE id = ${id}`;
    return (rows[0] as Bed) || null;
  }

  async getAllocationByStudentId(studentId: string): Promise<Allocation | null> {
    const rows = await this.sql`
      SELECT * FROM hostel.allocations
      WHERE student_id = ${studentId} AND status = 'active'
      LIMIT 1
    `;
    return (rows[0] as Allocation) || null;
  }

  async allocateBed(studentId: string, bedId: string, idempotencyKey: string, allocatedBy: string): Promise<string> {
    const result = await this.sql`
      SELECT hostel.allocate_bed(${studentId}, ${bedId}, ${idempotencyKey}, ${allocatedBy}) as id
    `;
    return result[0].id;
  }
}
