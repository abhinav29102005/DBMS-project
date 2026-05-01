

import { AutoRouter } from 'itty-router';
import { createDbClient } from '../../../infrastructure/database/connection';
import { requireAuth, requireRole } from '../../../core/middleware/auth';
import { ValidationError, NotFoundError, ForbiddenError } from '../../../core/errors/app-error';
import { z } from 'zod';
import type { Env } from '../../../core/types/env';
import type { AuthenticatedRequest } from '../../../core/types/context';

const hostelRouter = AutoRouter<AuthenticatedRequest, [Env]>({ base: '/api/v1/hostel' });

hostelRouter.get('/hostels', requireAuth, async (request, env) => {
  const sql = createDbClient(env);
  const rows = await sql`SELECT * FROM hostel.hostels WHERE deleted_at IS NULL`;
  return Response.json(rows);
});

hostelRouter.get('/availability', requireAuth, async (request, env) => {
  const { hostelId } = request.query;
  if (!hostelId) throw new ValidationError('hostelId is required');

  const sql = createDbClient(env);
  const rows = await sql`SELECT * FROM hostel.available_beds(${hostelId})`;
  return Response.json(rows);
});

const allocateSchema = z.object({
  bedId: z.string().uuid(),
  idempotencyKey: z.string().optional()
});

hostelRouter.post('/allocate', requireAuth, async (request, env) => {
  const body = await request.json();
  const result = allocateSchema.safeParse(body);
  if (!result.success) throw new ValidationError('Invalid request body');

  const sql = createDbClient(env);

  const studentRows = await sql`SELECT id FROM academic.students WHERE user_id = ${request.ctx!.userId}`;
  if (studentRows.length === 0) throw new ForbiddenError('Only students can request allocation');
  const studentId = studentRows[0].id;

  const key = result.data.idempotencyKey || crypto.randomUUID();

  try {
    const allocationId = await sql`
      SELECT hostel.allocate_bed(${studentId}, ${result.data.bedId}, ${key}, ${request.ctx!.userId})
    `;
    return Response.json({ allocationId: allocationId[0].allocate_bed });
  } catch (err: any) {
    if (err.message.includes('BED_OCCUPIED')) throw new ValidationError('Bed is already occupied');
    if (err.message.includes('ALREADY_ALLOCATED')) throw new ValidationError('Student already has an active allocation');
    throw err;
  }
});

export { hostelRouter };
