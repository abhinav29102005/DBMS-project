

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
      VALUES (${studentId}, ${offeringId});

      UPDATE academic.course_offerings
      SET enrollment_count = enrollment_count + 1
      WHERE id = ${offeringId};
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

  async getStudentResults(studentId: string): Promise<any[]> {
    return this.sql`
      SELECT r.*, c.course_code, c.title, c.credits
      FROM exam.results r
      JOIN academic.course_offerings co ON r.course_offering_id = co.id
      JOIN academic.courses c ON co.course_id = c.id
      WHERE r.student_id = ${studentId}
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
      WHERE student_id = ${studentId} AND course_offering_id = ${offeringId};

      UPDATE academic.course_offerings
      SET enrollment_count = enrollment_count - 1
      WHERE id = ${offeringId} AND enrollment_count > 0;
    `;
  }
}
