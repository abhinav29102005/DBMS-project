

import { ExamRepository } from '../infrastructure/exam-repository';
import { ValidationError, NotFoundError } from '../../../core/errors/app-error';

export class EnterMarksUseCase {
  constructor(private repo: ExamRepository) {}

  async execute(examId: string, studentId: string, marks: number, gradedBy: string): Promise<void> {

    const exam = await this.repo.findExamById(examId);
    if (!exam) throw new NotFoundError('Exam', examId);

    if (marks < 0 || marks > exam.maxMarks) {
      throw new ValidationError(`Marks must be between 0 and ${exam.maxMarks}`);
    }

    await this.repo.enterMarks(examId, studentId, marks, gradedBy);
  }
}

export class PublishResultsUseCase {
  constructor(private repo: ExamRepository) {}

  async execute(offeringId: string, publishedBy: string): Promise<void> {
    await this.repo.publishResults(offeringId, publishedBy);
  }
}
