/**
 * UIMS Library — Issue Book Use Case
 */

import { LibraryRepository } from '../infrastructure/library-repository';
import { ValidationError, NotFoundError } from '../../../core/errors/app-error';
import { LIBRARY } from '../../../core/config/constants';

export class IssueBookUseCase {
  constructor(private repo: LibraryRepository) {}

  async execute(barcode: string, memberUserId: string, issuedBy: string): Promise<string> {
    // 1. Find copy
    const copy = await this.repo.findCopyByBarcode(barcode);
    if (!copy) throw new NotFoundError('BookCopy', barcode);
    if (copy.status !== 'available') {
      throw new ValidationError(`Copy is not available (current status: ${copy.status})`);
    }

    // 2. Calculate due date
    const dueAt = new Date();
    dueAt.setDate(dueAt.getDate() + LIBRARY.DEFAULT_LOAN_DAYS);

    // 3. Create issue (trigger handles copy status sync)
    return this.repo.createIssue(copy.id, memberUserId, issuedBy, dueAt.toISOString());
  }
}

/**
 * UIMS Library — Return Book Use Case
 */
export class ReturnBookUseCase {
  constructor(private repo: LibraryRepository) {}

  async execute(issueId: string, receivedBy: string): Promise<void> {
    await this.repo.returnIssue(issueId, receivedBy);
  }
}
