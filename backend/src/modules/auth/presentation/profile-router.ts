
import { AutoRouter } from 'itty-router';
import { createDbClient } from '../../../infrastructure/database/connection';
import { requireAuth } from '../../../core/middleware/auth';
import { ValidationError, ForbiddenError } from '../../../core/errors/app-error';
import { z } from 'zod';
import type { Env } from '../../../core/types/env';
import type { AuthenticatedRequest } from '../../../core/types/context';

const profileRouter = AutoRouter<AuthenticatedRequest, [Env]>({ base: '/api/v1/profile' });

const studentProfileSchema = z.object({
  studentNo: z.string().min(1),
  departmentId: z.string().uuid(),
  programId: z.string().uuid(),
  admissionYear: z.number().int().min(2000).max(2100),
  currentSemester: z.number().int().min(1).max(12)
});

profileRouter.post('/student', requireAuth, async (request, env) => {
  const body = await request.json();
  const result = studentProfileSchema.safeParse(body);
  if (!result.success) throw new ValidationError('Invalid request body', { errors: result.error.format() });

  const sql = createDbClient(env);
  const userId = request.ctx!.userId;

  // Check if student record already exists
  const existing = await sql`SELECT id FROM academic.students WHERE user_id = ${userId}`;
  if (existing.length > 0) throw new ForbiddenError('Student profile already exists');

  const rows = await sql`
    INSERT INTO academic.students (
      user_id, student_no, department_id, program_id, admission_year, current_semester
    ) VALUES (
      ${userId}, ${result.data.studentNo}, ${result.data.departmentId}, 
      ${result.data.programId}, ${result.data.admissionYear}, ${result.data.currentSemester}
    )
    RETURNING id
  `;

  return Response.json({ id: rows[0].id }, { status: 201 });
});

const facultyProfileSchema = z.object({
  employeeNo: z.string().min(1),
  departmentId: z.string().uuid(),
  designation: z.enum(['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Visiting Faculty', 'Adjunct Faculty']),
  specialization: z.string().optional()
});

profileRouter.post('/faculty', requireAuth, async (request, env) => {
  const body = await request.json();
  const result = facultyProfileSchema.safeParse(body);
  if (!result.success) throw new ValidationError('Invalid request body', { errors: result.error.format() });

  const sql = createDbClient(env);
  const userId = request.ctx!.userId;

  // Check if faculty record already exists
  const existing = await sql`SELECT id FROM academic.faculty WHERE user_id = ${userId}`;
  if (existing.length > 0) throw new ForbiddenError('Faculty profile already exists');

  const rows = await sql`
    INSERT INTO academic.faculty (
      user_id, employee_no, department_id, designation, specialization
    ) VALUES (
      ${userId}, ${result.data.employeeNo}, ${result.data.departmentId}, 
      ${result.data.designation}, ${result.data.specialization}
    )
    RETURNING id
  `;

  return Response.json({ id: rows[0].id }, { status: 201 });
});

profileRouter.get('/status', requireAuth, async (request, env) => {
  const sql = createDbClient(env);
  const userId = request.ctx!.userId;
  const role = request.ctx!.role;

  let isComplete = false;
  if (role === 'student') {
    const rows = await sql`SELECT id FROM academic.students WHERE user_id = ${userId} AND deleted_at IS NULL`;
    isComplete = rows.length > 0;
  } else if (role === 'faculty') {
    const rows = await sql`SELECT id FROM academic.faculty WHERE user_id = ${userId} AND deleted_at IS NULL`;
    isComplete = rows.length > 0;
  } else {
    // Admin/Staff are considered complete by default for now
    isComplete = true;
  }

  return Response.json({ isComplete, role });
});

export { profileRouter };
