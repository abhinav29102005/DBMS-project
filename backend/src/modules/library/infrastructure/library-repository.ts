/**
 * UIMS Library Module — Library Repository
 */

import type { NeonQueryFunction } from '@neondatabase/serverless';
import type { Book, BookCopy, Issue } from '../domain/entities';

export class LibraryRepository {
  constructor(private sql: NeonQueryFunction<false, false>) {}

  async searchBooks(query: string): Promise<any[]> {
    return this.sql`
      SELECT id, isbn, title, ts_rank(search_vector, q) AS rank
      FROM library.books, plainto_tsquery('english', ${query}) q
      WHERE search_vector @@ q
      ORDER BY rank DESC
      LIMIT 20
    `;
  }

  async findCopyByBarcode(barcode: string): Promise<BookCopy | null> {
    const rows = await this.sql`SELECT * FROM library.book_copies WHERE barcode = ${barcode}`;
    return (rows[0] as BookCopy) || null;
  }

  async createIssue(copyId: string, memberUserId: string, issuedBy: string, dueAt: string): Promise<string> {
    const rows = await this.sql`
      INSERT INTO library.issues (copy_id, member_user_id, issued_by, due_at)
      VALUES (${copyId}, ${memberUserId}, ${issuedBy}, ${dueAt})
      RETURNING id
    `;
    return rows[0].id;
  }

  async returnIssue(issueId: string, receivedBy: string): Promise<void> {
    await this.sql`
      UPDATE library.issues
      SET returned_at = now(), return_received_by = ${receivedBy}
      WHERE id = ${issueId} AND returned_at IS NULL
    `;
  }
}
