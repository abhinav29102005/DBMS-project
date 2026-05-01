

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
}
