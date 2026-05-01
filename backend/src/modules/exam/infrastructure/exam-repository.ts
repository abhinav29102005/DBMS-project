

import type { NeonQueryFunction } from '@neondatabase/serverless';
import type { Exam, Mark, FinalResult } from '../domain/entities';

export class ExamRepository {
  constructor(private sql: NeonQueryFunction<false, false>) {}

  async findExamById(id: string): Promise<Exam | null> {
    const rows = await this.sql`SELECT * FROM exam.exams WHERE id = ${id}`;
    return (rows[0] as Exam) || null;
  }

  async enterMarks(examId: string, studentId: string, marks: number, gradedBy: string): Promise<void> {
    await this.sql`
      INSERT INTO exam.marks (exam_id, student_id, marks_obtained, graded_by)
      VALUES (${examId}, ${studentId}, ${marks}, ${gradedBy})
      ON CONFLICT (exam_id, student_id) DO UPDATE
      SET marks_obtained = EXCLUDED.marks_obtained,
          graded_by = EXCLUDED.graded_by,
          updated_at = now()
    `;
  }

  async publishResults(offeringId: string, publishedBy: string): Promise<void> {
    await this.sql`CALL exam.publish_results(${offeringId}, ${publishedBy})`;
  }

  async getStudentResults(studentId: string): Promise<any[]> {
    return this.sql`
      SELECT * FROM exam.v_student_results
      WHERE student_id = ${studentId}
    `;
  }
}
