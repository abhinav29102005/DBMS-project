import { AutoRouter, type IRequest } from 'itty-router';
import { createDbClient } from '../../../infrastructure/database/connection';
import { AcademicRepository } from '../infrastructure/academic-repository';
import { requireAuth, requirePermission, requireRole } from '../../../core/middleware/auth';
import { ValidationError, NotFoundError, ForbiddenError } from '../../../core/errors/app-error';
import { z } from 'zod';
import { BrevoEmailService } from '../../../infrastructure/events/email';
import type { Env } from '../../../core/types/env';
import type { AuthenticatedRequest } from '../../../core/types/context';

const academicRouter = AutoRouter<AuthenticatedRequest, [Env]>({ base: '/api/v1/academic' });

academicRouter.get('/departments', requireAuth, async (request, env) => {
  const sql = createDbClient(env);
  const repo = new AcademicRepository(sql);
  return Response.json(await repo.listDepartments());
});

academicRouter.get('/programs', requireAuth, async (request, env) => {
  const { departmentId } = request.query;
  const sql = createDbClient(env);
  const repo = new AcademicRepository(sql);
  return Response.json(await repo.listPrograms(departmentId as string));
});

academicRouter.get('/semesters', requireAuth, async (request, env) => {
  const sql = createDbClient(env);
  const repo = new AcademicRepository(sql);
  return Response.json(await repo.listSemesters());
});

academicRouter.get('/courses', requireAuth, async (request, env) => {
  const { departmentId } = request.query;
  const sql = createDbClient(env);
  const repo = new AcademicRepository(sql);
  return Response.json(await repo.listCourses(departmentId as string));
});

academicRouter.get('/students/me/courses', requireAuth, requireRole(['student']), async (request, env) => {
  const sql = createDbClient(env);
  const repo = new AcademicRepository(sql);
  const student = await repo.getStudentByUserId(request.ctx!.userId);
  if (!student) throw new NotFoundError('Student profile', request.ctx!.userId);
  return Response.json(await repo.getStudentCourses(student.id));
});

academicRouter.get('/offerings/available', requireAuth, requireRole(['student']), async (request, env) => {
  const sql = createDbClient(env);
  const rows = await sql`
    SELECT co.*, c.course_code, c.title, c.credits, f.employee_no as faculty_no, u.first_name || ' ' || u.last_name as faculty_name
    FROM academic.course_offerings co
    JOIN academic.courses c ON co.course_id = c.id
    LEFT JOIN academic.faculty f ON co.primary_faculty_id = f.id
    LEFT JOIN auth.users u ON f.user_id = u.id
    WHERE co.status = 'active'
      AND co.id NOT IN (
        SELECT course_offering_id 
        FROM academic.enrollments 
        WHERE student_id = (SELECT id FROM academic.students WHERE user_id = ${request.ctx!.userId})
          AND enrollment_status = 'enrolled'
      )
  `;
  return Response.json(rows);
});

academicRouter.post('/enroll', requireAuth, requireRole(['student']), async (request, env) => {
  const { offeringId } = await request.json();
  const sql = createDbClient(env);
  const repo = new AcademicRepository(sql);
  const student = await repo.getStudentByUserId(request.ctx!.userId);
  if (!student) throw new NotFoundError('Student profile');

  await sql`
    INSERT INTO academic.enrollments (student_id, course_offering_id, enrollment_status)
    VALUES (${student.id}, ${offeringId}, 'enrolled')
    ON CONFLICT (student_id, course_offering_id) DO UPDATE SET enrollment_status = 'enrolled'
  `;
  return Response.json({ success: true });
});

academicRouter.get('/students/me/results', requireAuth, requireRole(['student']), async (request, env) => {
  const sql = createDbClient(env);
  const repo = new AcademicRepository(sql);
  const student = await repo.getStudentByUserId(request.ctx!.userId);
  if (!student) throw new NotFoundError('Student profile', request.ctx!.userId);
  return Response.json(await repo.getStudentResults(student.id));
});

academicRouter.get('/students/me/stats', requireAuth, requireRole(['student']), async (request, env) => {
  const sql = createDbClient(env);
  const repo = new AcademicRepository(sql);
  const stats = await repo.getStudentStats(request.ctx!.userId);
  if (!stats) throw new NotFoundError('Student profile');
  return Response.json(stats);
});

academicRouter.get('/students/me/schedule', requireAuth, requireRole(['student']), async (request, env) => {
  const sql = createDbClient(env);
  const repo = new AcademicRepository(sql);
  const student = await repo.getStudentByUserId(request.ctx!.userId);
  if (!student) throw new NotFoundError('Student profile');
  return Response.json(await repo.getStudentSchedule(student.id));
});

academicRouter.get('/students/me/attendance', requireAuth, requireRole(['student']), async (request, env) => {
  const sql = createDbClient(env);
  const repo = new AcademicRepository(sql);
  const student = await repo.getStudentByUserId(request.ctx!.userId);
  if (!student) throw new NotFoundError('Student profile');
  return Response.json(await repo.getStudentAttendance(student.id));
});

academicRouter.get('/faculty/me/offerings', requireAuth, requireRole(['faculty']), async (request, env) => {
  const sql = createDbClient(env);
  const repo = new AcademicRepository(sql);
  const faculty = await repo.getFacultyByUserId(request.ctx!.userId);
  if (!faculty) throw new NotFoundError('Faculty profile', request.ctx!.userId);
  return Response.json(await repo.getFacultyOfferings(faculty.id));
});

academicRouter.get('/faculty/me/stats', requireAuth, requireRole(['faculty']), async (request, env) => {
  const sql = createDbClient(env);
  const repo = new AcademicRepository(sql);
  const faculty = await repo.getFacultyByUserId(request.ctx!.userId);
  if (!faculty) throw new NotFoundError('Faculty profile', request.ctx!.userId);

  const [students, offerings] = await Promise.all([
    sql`SELECT COUNT(DISTINCT student_id) as count FROM academic.enrollments e JOIN academic.course_offerings co ON e.offering_id = co.id WHERE co.faculty_id = ${faculty.id}`,
    sql`SELECT COUNT(*) as count FROM academic.course_offerings WHERE faculty_id = ${faculty.id}`
  ]);

  return Response.json({
    totalStudents: parseInt(students[0].count),
    activeCourses: parseInt(offerings[0].count),
    avgAttendance: '82%',
    pendingMarks: 12
  });
});

const enrollSchema = z.object({
  offeringId: z.string().uuid()
});

academicRouter.post('/enroll', requireAuth, requireRole(['student']), async (request, env) => {
  const body = await request.json();
  const result = enrollSchema.safeParse(body);
  if (!result.success) throw new ValidationError('Invalid request body');

  const sql = createDbClient(env);
  const repo = new AcademicRepository(sql);
  
  const student = await repo.getStudentByUserId(request.ctx!.userId);
  if (!student) throw new ForbiddenError('Student profile not found');

  const offering = await repo.findOfferingById(result.data.offeringId);
  if (!offering) throw new NotFoundError('Course offering', result.data.offeringId);
  
  const course = await repo.findCourseById(offering.courseId);

  try {
    await repo.enrollStudent(student.id, result.data.offeringId);
  } catch (err: any) {
    if (err.message.includes('duplicate key value violates unique constraint')) {
      throw new ValidationError('Student is already enrolled in this course section');
    }
    throw err;
  }

  // Send enrollment confirmation email
  const emailService = new BrevoEmailService(env.BREVO_API_KEY);
  await emailService.send({
    to: request.ctx!.email,
    subject: `Enrollment Confirmation: ${course?.courseCode || 'Course'}`,
    text: `You have successfully enrolled in ${course?.title} (${course?.courseCode}).\n\nSection: ${offering.sectionCode}`,
    html: `<h1>Enrollment Confirmed</h1><p>You have successfully enrolled in <strong>${course?.title} (${course?.courseCode})</strong>.</p><p>Section: ${offering.sectionCode}</p>`
  }).catch(console.error);

  return Response.json({ message: 'Enrolled successfully' });
});

academicRouter.delete('/enrollments/:offeringId', requireAuth, requireRole(['student']), async (request, env) => {
  const { offeringId } = request.params;
  const sql = createDbClient(env);
  const repo = new AcademicRepository(sql);
  
  const student = await repo.getStudentByUserId(request.ctx!.userId);
  if (!student) throw new ForbiddenError('Student profile not found');

  await repo.withdrawStudent(student.id, offeringId);
  return Response.json({ message: 'Withdrawn successfully' });
});

const marksSchema = z.object({
  studentId: z.string().uuid(),
  offeringId: z.string().uuid(),
  marksInternal: z.number().min(0).max(50),
  marksExternal: z.number().min(0).max(50),
  grade: z.string().max(2)
});

academicRouter.post('/faculty/marks', requireAuth, requireRole(['faculty']), async (request, env) => {
  const body = await request.json();
  const result = marksSchema.safeParse(body);
  if (!result.success) throw new ValidationError('Invalid request body');

  const sql = createDbClient(env);
  
  await sql`
    INSERT INTO exam.final_results (
      student_id, course_offering_id, marks_internal, marks_external, grade, status
    ) VALUES (
      ${result.data.studentId}, ${result.data.offeringId}, 
      ${result.data.marksInternal}, ${result.data.marksExternal}, 
      ${result.data.grade}, ${result.data.grade === 'F' ? 'Fail' : 'Pass'}
    )
    ON CONFLICT (student_id, course_offering_id) DO UPDATE SET
      marks_internal = EXCLUDED.marks_internal,
      marks_external = EXCLUDED.marks_external,
      grade = EXCLUDED.grade,
      status = EXCLUDED.status,
      updated_at = now()
  `;

  return Response.json({ message: 'Marks recorded successfully' });
});

academicRouter.get('/students/me/schedule', requireAuth, requireRole(['student']), async (request, env) => {
  return Response.json([
    { time: '09:00 AM', subject: 'Database Management Systems', room: 'Lab 402', color: 'bg-blue-500' },
    { time: '11:30 AM', subject: 'Software Engineering', room: 'Room 101', color: 'bg-purple-500' },
    { time: '02:30 PM', subject: 'Machine Learning', room: 'Seminar Hall', color: 'bg-orange-500' },
  ]);
});

academicRouter.get('/faculty/me/schedule', requireAuth, requireRole(['faculty']), async (request, env) => {
  return Response.json([
    { time: '10:30 AM', subject: 'Database Management Systems', section: 'CS-A', room: 'Lab 402', color: 'bg-blue-500' },
    { time: '01:30 PM', subject: 'Software Engineering', section: 'CS-C', room: 'Room 101', color: 'bg-brand-500' }
  ]);
});

export { academicRouter };
