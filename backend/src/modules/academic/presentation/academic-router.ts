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
    WHERE co.status = 'ongoing'
      AND co.id NOT IN (
        SELECT course_offering_id 
        FROM academic.enrollments 
        WHERE student_id = (SELECT id FROM academic.students WHERE user_id = ${request.ctx!.userId})
          AND enrollment_status = 'enrolled'
      )
  `;
  return Response.json(rows);
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
  const emailService = new BrevoEmailService({
    user: (env as any).BREVO_SMTP_USER,
    pass: (env as any).BREVO_SMTP_PASS
  });
  await emailService.send({
    to: request.ctx!.email,
    subject: `Enrollment Confirmation: ${course?.courseCode || 'Course'}`,
    text: `You have successfully enrolled in ${course?.title} (${course?.courseCode}).\n\nSection: ${offering.sectionCode}`,
    html: `<h1>Enrollment Confirmed</h1><p>You have successfully enrolled in <strong>${course?.title} (${course?.courseCode})</strong>.</p><p>Section: ${offering.sectionCode}</p>`
  }).catch(console.error);

  return Response.json({ message: 'Enrolled successfully' });
});

academicRouter.get('/students/:id/profile', requireAuth, requireRole(['admin', 'staff']), async (request, env) => {
  const { id } = request.params;
  const sql = createDbClient(env);
  const rows = await sql`
    SELECT * FROM academic.v_student_profile WHERE student_id = ${id}
  `;
  if (rows.length === 0) throw new NotFoundError('Student profile', id);
  return Response.json(rows[0]);
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

academicRouter.get('/students/me/exams', requireAuth, requireRole(['student']), async (request, env) => {
  const sql = createDbClient(env);
  const repo = new AcademicRepository(sql);
  const student = await repo.getStudentByUserId(request.ctx!.userId);
  if (!student) throw new NotFoundError('Student profile');
  return Response.json(await repo.getExamSchedules(student.id));
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

  const facultyId = faculty.id;

  const [students, offerings, pending] = await Promise.all([
    sql`SELECT COUNT(DISTINCT student_id) as count FROM academic.enrollments e JOIN academic.course_offerings co ON e.course_offering_id = co.id WHERE co.primary_faculty_id = ${facultyId}::uuid AND e.enrollment_status = 'enrolled'`,
    sql`SELECT COUNT(*) as count FROM academic.course_offerings WHERE primary_faculty_id = ${facultyId}::uuid AND status = 'ongoing'`,
    sql`SELECT COUNT(*) as count FROM academic.enrollments e JOIN academic.course_offerings co ON e.course_offering_id = co.id JOIN exam.exams ex ON ex.course_offering_id = co.id LEFT JOIN exam.marks m ON m.exam_id = ex.id AND m.student_id = e.student_id WHERE co.primary_faculty_id = ${facultyId}::uuid AND e.enrollment_status = 'enrolled' AND m.exam_id IS NULL`
  ]);

  return Response.json({
    totalStudents: parseInt(students[0]?.count || '0'),
    activeCourses: parseInt(offerings[0]?.count || '0'),
    avgAttendance: '88%',
    pendingMarks: parseInt(pending[0]?.count || '0')
  });
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
  examId: z.string().uuid(),
  marksObtained: z.number().min(0),
  remarks: z.string().optional()
});

academicRouter.post('/faculty/marks', requireAuth, requireRole(['faculty']), async (request, env) => {
  const body = await request.json();
  const result = marksSchema.safeParse(body);
  if (!result.success) throw new ValidationError('Invalid request body');

  const sql = createDbClient(env);
  
  await sql`
    INSERT INTO exam.marks (
      exam_id, student_id, marks_obtained, graded_by, remarks
    ) VALUES (
      ${result.data.examId}, ${result.data.studentId}, 
      ${result.data.marksObtained}, ${request.ctx!.userId},
      ${result.data.remarks || ''}
    )
    ON CONFLICT (exam_id, student_id) DO UPDATE SET
      marks_obtained = EXCLUDED.marks_obtained,
      graded_by = EXCLUDED.graded_by,
      remarks = EXCLUDED.remarks,
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

academicRouter.get('/faculty/me/advisees', requireAuth, requireRole(['faculty']), async (request, env) => {
  const sql = createDbClient(env);
  const repo = new AcademicRepository(sql);
  const faculty = await repo.getFacultyByUserId(request.ctx!.userId);
  if (!faculty) throw new NotFoundError('Faculty profile');

  const rows = await sql`
    SELECT s.*, u.first_name || ' ' || u.last_name as name, u.email, p.name as program_name, d.name as department_name
    FROM academic.students s
    JOIN auth.users u ON s.user_id = u.id
    JOIN academic.programs p ON s.program_id = p.id
    JOIN academic.departments d ON s.department_id = d.id
    WHERE s.advisor_id = ${faculty.id}
    ORDER BY u.first_name ASC
  `;
  return Response.json(rows);
});

academicRouter.post('/faculty/me/advisees/email', requireAuth, requireRole(['faculty']), async (request, env) => {
  const { studentId, subject, message } = await request.json() as { studentId: string, subject: string, message: string };
  const sql = createDbClient(env);
  const repo = new AcademicRepository(sql);
  
  const faculty = await repo.getFacultyByUserId(request.ctx!.userId);
  if (!faculty) throw new NotFoundError('Faculty profile');

  const student = await sql`
    SELECT u.email, u.first_name || ' ' || u.last_name as name 
    FROM academic.students s
    JOIN auth.users u ON s.user_id = u.id
    WHERE s.id = ${studentId} AND s.advisor_id = ${faculty.id}
  `;

  if (student.length === 0) throw new NotFoundError('Advisee record');

  const emailService = new BrevoEmailService({
    user: (env as any).BREVO_SMTP_USER,
    pass: (env as any).BREVO_SMTP_PASS });

  await emailService.send({
    to: student[0].email,
    subject,
    text: message,
    html: `
      <p style="font-size: 16px; font-weight: 600; color: #111827; margin-bottom: 16px;">Dear ${student[0].name},</p>
      <div style="font-size: 15px; color: #374151; margin-bottom: 24px; white-space: pre-wrap;">
        ${message}
      </div>
      <div style="border-top: 1px solid #f3f4f6; pt-16;">
        <p style="font-size: 14px; color: #6b7280; margin: 0;">Warm regards,</p>
        <p style="font-size: 16px; font-weight: 700; color: #111827; margin: 4px 0 0;">Prof. ${request.ctx!.email.split('@')[0].replace(/_/g, ' ')}</p>
      </div>
    `
  });

  return Response.json({ success: true });
});

academicRouter.get('/faculty/offerings/:offeringId/students', requireAuth, requireRole(['faculty']), async (request, env) => {
  const { offeringId } = request.params;
  const sql = createDbClient(env);
  const repo = new AcademicRepository(sql);
  return Response.json(await repo.listStudentsInOffering(offeringId));
});

academicRouter.get('/students', requireAuth, requireRole(['admin', 'staff']), async (request, env) => {
  const { programId, search } = request.query;
  const sql = createDbClient(env);
  const rows = await sql`
    SELECT s.*, u.first_name, u.last_name, u.email, p.name as program_name, d.name as department_name
    FROM academic.students s
    JOIN auth.users u ON s.user_id = u.id
    JOIN academic.programs p ON s.program_id = p.id
    JOIN academic.departments d ON s.department_id = d.id
    WHERE (${programId}::uuid IS NULL OR s.program_id = ${programId})
      AND (${search}::text IS NULL OR u.first_name ILIKE '%' || ${search} || '%' OR u.last_name ILIKE '%' || ${search} || '%' OR s.student_no ILIKE '%' || ${search} || '%')
    ORDER BY s.created_at DESC
  `;
  return Response.json(rows);
});

const createStudentSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  studentNo: z.string(),
  programId: z.string().uuid(),
  departmentId: z.string().uuid(),
  admissionYear: z.number().int().min(2000).max(2100),
  currentSemester: z.number().int().min(1).max(12)
});

academicRouter.post('/students', requireAuth, requireRole(['admin', 'staff']), async (request, env) => {
  const body = await request.json();
  const result = createStudentSchema.safeParse(body);
  if (!result.success) throw new ValidationError('Invalid request body');

  const sql = createDbClient(env);
  
  try {
    // 1. Create User
    const userRows = await sql`
      INSERT INTO auth.users (email, first_name, last_name, password_hash, status)
      VALUES (${result.data.email}, ${result.data.firstName}, ${result.data.lastName}, '$2a$10$hardcoded_for_seed', 'active')
      RETURNING id
    `;
    const userId = userRows[0].id;

    // 2. Assign Student Role
    await sql`
      INSERT INTO auth.user_roles (user_id, role_id)
      VALUES (${userId}, (SELECT id FROM auth.roles WHERE code = 'student'))
    `;

    // 3. Create Student
    const studentRows = await sql`
      INSERT INTO academic.students (user_id, student_no, department_id, program_id, admission_year, current_semester)
      VALUES (${userId}, ${result.data.studentNo}, ${result.data.departmentId}, ${result.data.programId}, ${result.data.admissionYear}, ${result.data.currentSemester})
      RETURNING *
    `;
    
    return Response.json(studentRows[0]);
  } catch (err: any) {
    if (err.message.includes('unique constraint')) throw new ValidationError('Email or Student Number already exists');
    throw err;
  }
});

export { academicRouter };
