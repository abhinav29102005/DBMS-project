

import type { NeonQueryFunction } from '@neondatabase/serverless';
import type { Student, CourseOffering, Enrollment, Course } from '../domain/entities';

export class AcademicRepository {
  constructor(private sql: NeonQueryFunction<false, false>) {}

  async findStudentById(id: string): Promise<Student | null> {
    const rows = await this.sql`
      SELECT * FROM academic.students WHERE id = ${id} AND deleted_at IS NULL
    `;
    return (rows[0] as Student) || null;
  }

  async listStudents(cursor?: { createdAt: string; id: string }, limit = 20): Promise<Student[]> {
    if (cursor) {
      const rows = await this.sql`
        SELECT * FROM academic.students
        WHERE deleted_at IS NULL
          AND (created_at, id) < (${cursor.createdAt}, ${cursor.id})
        ORDER BY created_at DESC, id DESC
        LIMIT ${limit}
      `;
      return rows as unknown as Student[];
    }

    const rows = await this.sql`
      SELECT * FROM academic.students
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC, id DESC
      LIMIT ${limit}
    `;
    return rows as unknown as Student[];
  }

  async findCourseById(id: string): Promise<Course | null> {
    const rows = await this.sql`
      SELECT * FROM academic.courses WHERE id = ${id} AND deleted_at IS NULL
    `;
    return (rows[0] as Course) || null;
  }

  async findOfferingById(id: string): Promise<CourseOffering | null> {
    const rows = await this.sql`
      SELECT * FROM academic.course_offerings WHERE id = ${id}
    `;
    return (rows[0] as CourseOffering) || null;
  }

  async enrollStudent(studentId: string, offeringId: string): Promise<void> {
    await this.sql`
      INSERT INTO academic.enrollments (student_id, course_offering_id)
      VALUES (${studentId}, ${offeringId})
    `;

    await this.sql`
      UPDATE academic.course_offerings
      SET enrollment_count = enrollment_count + 1
      WHERE id = ${offeringId}
    `;
  }

  async listDepartments(): Promise<any[]> {
    return this.sql`SELECT * FROM academic.departments WHERE deleted_at IS NULL ORDER BY name`;
  }

  async listPrograms(departmentId?: string): Promise<any[]> {
    if (departmentId) {
      return this.sql`SELECT * FROM academic.programs WHERE department_id = ${departmentId} AND deleted_at IS NULL ORDER BY name`;
    }
    return this.sql`SELECT * FROM academic.programs WHERE deleted_at IS NULL ORDER BY name`;
  }

  async listSemesters(): Promise<any[]> {
    return this.sql`SELECT * FROM academic.semesters ORDER BY start_date DESC`;
  }

  async listCourses(departmentId?: string): Promise<any[]> {
    if (departmentId) {
      return this.sql`SELECT * FROM academic.courses WHERE department_id = ${departmentId} AND deleted_at IS NULL ORDER BY course_code`;
    }
    return this.sql`SELECT * FROM academic.courses WHERE deleted_at IS NULL ORDER BY course_code`;
  }

  async getStudentByUserId(userId: string): Promise<any | null> {
    const rows = await this.sql`SELECT * FROM academic.students WHERE user_id = ${userId} AND deleted_at IS NULL`;
    return rows[0] || null;
  }

  async getStudentStats(userId: string): Promise<any> {
    const student = await this.getStudentByUserId(userId);
    if (!student) return null;

    const [enrollments, attendance, results, library] = await Promise.all([
      this.sql`SELECT COUNT(*) as count FROM academic.enrollments WHERE student_id = ${student.id} AND enrollment_status = 'enrolled'`,
      this.sql`
        SELECT 
          COUNT(*) FILTER (WHERE status IN ('present', 'late'))::float / NULLIF(COUNT(*), 0) * 100 as percentage
        FROM academic.attendance 
        WHERE student_id = ${student.id}
      `,
      this.sql`SELECT grade_points FROM exam.final_results WHERE student_id = ${student.id} AND result_status = 'pass'`,
      this.sql`SELECT COALESCE(SUM(amount), 0) as total FROM library.fines WHERE member_user_id = ${userId} AND settled_at IS NULL`
    ]);

    const gpa = results.length > 0 
      ? (results.reduce((acc: number, r: any) => acc + parseFloat(r.grade_points || 0), 0) / results.length).toFixed(2) 
      : '0.00';

    return {
      attendance: attendance[0]?.percentage ? `${Math.round(attendance[0].percentage)}%` : '0%',
      gpa,
      coursesCount: parseInt(enrollments[0].count),
      fines: `$${parseFloat(library[0].total).toFixed(2)}`
    };
  }

  async getStudentSchedule(studentId: string): Promise<any[]> {
    return this.sql`
      SELECT s.*, c.title as subject, co.section_code
      FROM academic.schedules s
      JOIN academic.course_offerings co ON s.course_offering_id = co.id
      JOIN academic.courses c ON co.course_id = c.id
      JOIN academic.enrollments e ON e.course_offering_id = co.id
      WHERE e.student_id = ${studentId} AND e.enrollment_status = 'enrolled'
      ORDER BY s.day_of_week, s.start_time
    `;
  }

  async getStudentAttendance(studentId: string): Promise<any[]> {
    return this.sql`
      SELECT a.*, c.title as course_title, c.course_code
      FROM academic.attendance a
      JOIN academic.course_offerings co ON a.course_offering_id = co.id
      JOIN academic.courses c ON co.course_id = c.id
      WHERE a.student_id = ${studentId}
      ORDER BY a.date DESC
    `;
  }

  async getFacultyByUserId(userId: string): Promise<any | null> {
    const rows = await this.sql`SELECT * FROM academic.faculty WHERE user_id = ${userId} AND deleted_at IS NULL`;
    return rows[0] || null;
  }

  async getStudentCourses(studentId: string): Promise<any[]> {
    return this.sql`
      SELECT co.*, c.course_code, c.title, c.credits, f.employee_no as faculty_no, u.first_name || ' ' || u.last_name as faculty_name
      FROM academic.enrollments e
      JOIN academic.course_offerings co ON e.course_offering_id = co.id
      JOIN academic.courses c ON co.course_id = c.id
      LEFT JOIN academic.faculty f ON co.primary_faculty_id = f.id
      LEFT JOIN auth.users u ON f.user_id = u.id
      WHERE e.student_id = ${studentId} AND e.enrollment_status = 'enrolled'
    `;
  }

  async getExamSchedules(studentId: string): Promise<any[]> {
    return this.sql`
      SELECT ex.*, c.title as course_title, c.course_code, sed.seat_no, sed.attendance_status
      FROM exam.exams ex
      JOIN academic.course_offerings co ON ex.course_offering_id = co.id
      JOIN academic.courses c ON co.course_id = c.id
      JOIN academic.enrollments e ON e.course_offering_id = co.id
      LEFT JOIN exam.student_exam_details sed ON sed.exam_id = ex.id AND sed.student_id = ${studentId}
      WHERE e.student_id = ${studentId} AND e.enrollment_status = 'enrolled'
      ORDER BY ex.scheduled_at ASC
    `;
  }

  async getStudentResults(studentId: string): Promise<any[]> {
    return this.sql`
      SELECT 
        c.course_code as "courseCode", 
        c.title, 
        c.credits,
        fr.grade_code as grade,
        fr.result_status as status,
        (SELECT m.marks_obtained FROM exam.marks m JOIN exam.exams e ON m.exam_id = e.id WHERE e.course_offering_id = co.id AND m.student_id = ${studentId} AND e.name ILIKE '%Mid%' LIMIT 1) as "marksInternal",
        (SELECT m.marks_obtained FROM exam.marks m JOIN exam.exams e ON m.exam_id = e.id WHERE e.course_offering_id = co.id AND m.student_id = ${studentId} AND e.name ILIKE '%End%' LIMIT 1) as "marksExternal"
      FROM academic.enrollments e
      JOIN academic.course_offerings co ON e.course_offering_id = co.id
      JOIN academic.courses c ON co.course_id = c.id
      LEFT JOIN exam.final_results fr ON fr.student_id = ${studentId} AND fr.course_offering_id = co.id
      WHERE e.student_id = ${studentId}
      ORDER BY co.semester_id
    `;
  }

  async getFacultyOfferings(facultyId: string): Promise<any[]> {
    return this.sql`
      SELECT co.*, c.course_code, c.title, c.credits, s.name as semester_name
      FROM academic.course_offerings co
      JOIN academic.courses c ON co.course_id = c.id
      JOIN academic.semesters s ON co.semester_id = s.id
      WHERE co.primary_faculty_id = ${facultyId}
      ORDER BY s.start_date DESC
    `;
  }

  async withdrawStudent(studentId: string, offeringId: string): Promise<void> {
    await this.sql`
      UPDATE academic.enrollments
      SET enrollment_status = 'withdrawn', withdrawn_at = now()
      WHERE student_id = ${studentId} AND course_offering_id = ${offeringId}
    `;

    await this.sql`
      UPDATE academic.course_offerings
      SET enrollment_count = enrollment_count - 1
      WHERE id = ${offeringId} AND enrollment_count > 0
    `;
  }

  async listStudentsInOffering(offeringId: string): Promise<any[]> {
    return this.sql`
      SELECT s.id, s.student_no, u.first_name || ' ' || u.last_name as name, fr.grade_code as grade, fr.result_status as status
      FROM academic.enrollments e
      JOIN academic.students s ON e.student_id = s.id
      JOIN auth.users u ON s.user_id = u.id
      LEFT JOIN exam.final_results fr ON fr.student_id = s.id AND fr.course_offering_id = ${offeringId}
      WHERE e.course_offering_id = ${offeringId} AND e.enrollment_status = 'enrolled'
    `;
  }
}
