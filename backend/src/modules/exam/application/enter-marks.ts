/**
 * UIMS Exam — Enter Marks Use Case
 */

import { ExamRepository } from '../infrastructure/exam-repository';
import { ValidationError, NotFoundError } from '../../../core/errors/app-error';

export class EnterMarksUseCase {
  constructor(private repo: ExamRepository) {}

  async execute(examId: string, studentId: string, marks: number, gradedBy: string): Promise<void> {
    // 1. Validate exam exists
    const exam = await this.repo.findExamById(examId);
    if (!exam) throw new NotFoundError('Exam', examId);

    // 2. Validate marks range
    if (marks < 0 || marks > exam.maxMarks) {
      throw new ValidationError(`Marks must be between 0 and ${exam.maxMarks}`);
    }

    // 3. Upsert marks
    await this.repo.enterMarks(examId, studentId, marks, gradedBy);
  }
}

/**
 * UIMS Exam — Publish Results Use Case
 */
export class PublishResultsUseCase {
  constructor(private repo: ExamRepository) {}

  async execute(offeringId: string, publishedBy: string): Promise<void> {
    await this.repo.publishResults(offeringId, publishedBy);
  }
}
