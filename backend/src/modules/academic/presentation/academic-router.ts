/**
 * UIMS Academic Module — Academic Router
 */

import { AutoRouter, type IRequest } from 'itty-router';
import { createDbClient } from '../../../infrastructure/database/connection';
import { AcademicRepository } from '../infrastructure/academic-repository';
import { requireAuth, requirePermission } from '../../../core/middleware/auth';
import { ValidationError, NotFoundError, ForbiddenError } from '../../../core/errors/app-error';
import { z } from 'zod';
import type { Env } from '../../../core/types/env';
import type { AuthenticatedRequest } from '../../../core/types/context';

const academicRouter = AutoRouter<AuthenticatedRequest, [Env]>({ base: '/api/v1/academic' });

// ─── List Students ──────────────────────────────────────────
academicRouter.get('/students', requireAuth, async (request, env) => {
  const { cursor, limit } = request.query;
  const sql = createDbClient(env);
  const repo = new AcademicRepository(sql);

  let parsedCursor;
  if (cursor && typeof cursor === 'string') {
    try {
      parsedCursor = JSON.parse(atob(cursor));
    } catch (e) {
      throw new ValidationError('Invalid cursor');
    }
  }

  const students = await repo.listStudents(parsedCursor, limit ? parseInt(limit as string) : 20);
  
  let nextCursor = null;
  if (students.length > 0 && students.length === (limit ? parseInt(limit as string) : 20)) {
    const last = students[students.length - 1];
    // In a real app, you'd fetch 'created_at' too. 
    // For now we assume repo returns it or we use a simplified cursor.
    // nextCursor = btoa(JSON.stringify({ createdAt: (last as any).created_at, id: last.id }));
  }

  return Response.json({ items: students, nextCursor });
});

// ─── Enroll Student ─────────────────────────────────────────
const enrollSchema = z.object({
  offeringId: z.string().uuid()
});

academicRouter.post('/enroll', requireAuth, async (request, env) => {
  const body = await request.json();
  const result = enrollSchema.safeParse(body);
  
  if (!result.success) {
    throw new ValidationError('Invalid request body', { errors: result.error.format() });
  }

  const sql = createDbClient(env);
  const repo = new AcademicRepository(sql);

  // Get student ID for current user
  const studentRows = await sql`SELECT id FROM academic.students WHERE user_id = ${request.ctx!.userId}`;
  if (studentRows.length === 0) {
    throw new ForbiddenError('Only students can enroll in courses');
  }
  const studentId = studentRows[0].id;

  // Check offering existence and capacity
  const offering = await repo.findOfferingById(result.data.offeringId);
  if (!offering) throw new NotFoundError('Course offering', result.data.offeringId);
  if (offering.enrollmentCount >= offering.capacity) {
    throw new ValidationError('Course offering is at full capacity');
  }

  await repo.enrollStudent(studentId, result.data.offeringId);

  return Response.json({ message: 'Enrolled successfully' });
});

export { academicRouter };
