/**
 * UIMS Library Module — Domain Entities
 */

export interface Book {
  id: string;
  isbn: string;
  title: string;
  subtitle?: string;
  publisherId?: string;
  publicationYear?: number;
  subjectId?: string;
}

export interface BookCopy {
  id: string;
  bookId: string;
  barcode: string;
  status: 'available' | 'issued' | 'reserved' | 'lost' | 'damaged' | 'withdrawn';
  shelfLocation?: string;
}

export interface Issue {
  id: string;
  copyId: string;
  memberUserId: string;
  issuedAt: Date;
  dueAt: Date;
  returnedAt?: Date;
}

export interface Fine {
  id: string;
  issueId: string;
  memberUserId: string;
  amount: number;
  reason: string;
  assessedAt: Date;
  settledAt?: Date;
}
