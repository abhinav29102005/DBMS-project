

import { AcademicRepository } from '../infrastructure/academic-repository';
import { ValidationError, NotFoundError } from '../../../core/errors/app-error';

export class EnrollmentUseCase {
  constructor(private repo: AcademicRepository) {}

  async execute(studentId: string, offeringId: string): Promise<void> {
    const offering = await this.repo.findOfferingById(offeringId);
    if (!offering) throw new NotFoundError('CourseOffering', offeringId);
    if (offering.enrollmentCount >= offering.capacity) {
      throw new ValidationError('Course offering is at full capacity');
    }
    await this.repo.enrollStudent(studentId, offeringId);
  }
}
