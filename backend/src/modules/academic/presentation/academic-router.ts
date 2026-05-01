

import { AutoRouter, type IRequest } from 'itty-router';
import { createDbClient } from '../../../infrastructure/database/connection';
import { AcademicRepository } from '../infrastructure/academic-repository';
import { requireAuth, requirePermission, requireRole } from '../../../core/middleware/auth';
import { ValidationError, NotFoundError, ForbiddenError } from '../../../core/errors/app-error';
import { z } from 'zod';
import type { Env } from '../../../core/types/env';
import type { AuthenticatedRequest } from '../../../core/types/context';

const academicRouter = AutoRouter<AuthenticatedRequest, [Env]>({ base: '/api/v1/academic' });

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

  }

  return Response.json({ items: students, nextCursor });
});

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

  const studentRows = await sql`SELECT id FROM academic.students WHERE user_id = ${request.ctx!.userId}`;
  if (studentRows.length === 0) {
    throw new ForbiddenError('Only students can enroll in courses');
  }
  const studentId = studentRows[0].id;

  const offering = await repo.findOfferingById(result.data.offeringId);
  if (!offering) throw new NotFoundError('Course offering', result.data.offeringId);
  if (offering.enrollmentCount >= offering.capacity) {
    throw new ValidationError('Course offering is at full capacity');
  }

  await repo.enrollStudent(studentId, result.data.offeringId);

  return Response.json({ message: 'Enrolled successfully' });
});

academicRouter.get('/faculty/me/stats', requireAuth, requireRole(['faculty']), async (request, env) => {
  const sql = createDbClient(env);
  
  const userId = request.ctx!.userId;
  
  const [students, offerings] = await Promise.all([
    sql`SELECT COUNT(DISTINCT student_id) as count FROM academic.enrollments e JOIN academic.course_offerings co ON e.offering_id = co.id WHERE co.faculty_id = (SELECT id FROM academic.faculty WHERE user_id = ${userId})`,
    sql`SELECT COUNT(*) as count FROM academic.course_offerings WHERE faculty_id = (SELECT id FROM academic.faculty WHERE user_id = ${userId}) AND status = 'active'`
  ]);

  return Response.json({
    totalStudents: parseInt(students[0].count),
    activeCourses: parseInt(offerings[0].count),
    avgAttendance: '82%',
    pendingMarks: 12
  });
});

academicRouter.get('/faculty/me/schedule', requireAuth, requireRole(['faculty']), async (request, env) => {
  return Response.json([
    { time: '10:30 AM', subject: 'Database Management Systems', section: 'CS-A', room: 'Lab 402', color: 'bg-blue-500' },
    { time: '01:30 PM', subject: 'Software Engineering', section: 'CS-C', room: 'Room 101', color: 'bg-brand-500' }
  ]);
});

academicRouter.get('/students/me/stats', requireAuth, requireRole(['student']), async (request, env) => {
  return Response.json({
    attendance: '85%',
    gpa: '3.8',
    coursesCount: 5,
    fines: '$0.00'
  });
});

academicRouter.get('/students/me/schedule', requireAuth, requireRole(['student']), async (request, env) => {
  return Response.json([
    { time: '09:00 AM', subject: 'Database Management Systems', room: 'Lab 402', color: 'bg-blue-500' },
    { time: '11:30 AM', subject: 'Software Engineering', room: 'Room 101', color: 'bg-purple-500' }
  ]);
});

export { academicRouter };
