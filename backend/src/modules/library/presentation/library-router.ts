

import { AutoRouter } from 'itty-router';
import { createDbClient } from '../../../infrastructure/database/connection';
import { requireAuth } from '../../../core/middleware/auth';
import { ValidationError, NotFoundError } from '../../../core/errors/app-error';
import { z } from 'zod';
import { BrevoEmailService } from '../../../infrastructure/events/email';
import type { Env } from '../../../core/types/env';
import type { AuthenticatedRequest } from '../../../core/types/context';
import { QRService } from '../../../infrastructure/utils/qr-service';

const libraryRouter = AutoRouter<AuthenticatedRequest, [Env]>({ base: '/api/v1/library' });

libraryRouter.get('/subjects', requireAuth, async (request, env) => {
  const sql = createDbClient(env);
  return Response.json(await sql`SELECT * FROM library.subjects ORDER BY name`);
});

libraryRouter.get('/books', requireAuth, async (request, env) => {
  const { search, subjectId, page = '1' } = request.query;
  const sql = createDbClient(env);
  const offset = (parseInt(page as string) - 1) * 20;

  if (search) {
    const rows = await sql`
      SELECT b.*, s.name as subject_name,
        (SELECT COUNT(*) FROM library.book_copies WHERE book_id = b.id) as total_copies,
        (SELECT COUNT(*) FROM library.book_copies WHERE book_id = b.id AND status = 'available') as available_copies
      FROM library.books b
      LEFT JOIN library.subjects s ON b.subject_id = s.id
      WHERE (b.title ILIKE ${'%' + search + '%'} OR b.author ILIKE ${'%' + search + '%'} OR b.isbn ILIKE ${'%' + search + '%'})
        AND b.deleted_at IS NULL
      ORDER BY b.title
      LIMIT 20 OFFSET ${offset}
    `;
    return Response.json(rows);
  }

  const rows = await sql`
    SELECT b.*, s.name as subject_name,
      (SELECT COUNT(*) FROM library.book_copies WHERE book_id = b.id) as total_copies,
      (SELECT COUNT(*) FROM library.book_copies WHERE book_id = b.id AND status = 'available') as available_copies
    FROM library.books b
    LEFT JOIN library.subjects s ON b.subject_id = s.id
    WHERE b.deleted_at IS NULL
      AND (${subjectId}::uuid IS NULL OR b.subject_id = ${subjectId})
    ORDER BY b.title
    LIMIT 20 OFFSET ${offset}
  `;
  return Response.json(rows);
});

libraryRouter.get('/my-issues', requireAuth, async (request, env) => {
  const sql = createDbClient(env);
  const rows = await sql`
    SELECT i.*, b.title, b.author, bc.barcode, bc.qr_code_id
    FROM library.issues i
    JOIN library.book_copies bc ON i.copy_id = bc.id
    JOIN library.books b ON bc.book_id = b.id
    WHERE i.member_user_id = ${request.ctx!.userId} AND i.returned_at IS NULL
    ORDER BY i.due_at ASC
  `;

  const issuesWithQR = rows.map(row => ({
    ...row,
    qrCodeUrl: row.qr_code_id ? QRService.getBookQR(row.qr_code_id) : null
  }));

  return Response.json(issuesWithQR);
});

const issueSchema = z.object({
  barcode: z.string().optional(),
  bookId: z.string().uuid().optional(),
  memberUserId: z.string().uuid().optional(),
  dueAt: z.string().optional()
});

libraryRouter.post('/issues', requireAuth, async (request, env) => {
  try {
    const body = await request.json();
    console.log('[Library] Issue request body:', body);
    
    const result = issueSchema.safeParse(body);
    if (!result.success) {
      console.error('[Library] Validation failed:', result.error);
      throw new ValidationError('Invalid request body');
    }

    const sql = createDbClient(env);
    const memberId = result.data.memberUserId || request.ctx!.userId;
    // Ensure date is in a format Postgres likes
    const dueDate = result.data.dueAt || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

    console.log(`[Library] Processing issue for member: ${memberId}`);

    let copyId: string;
    
    if (result.data.barcode) {
      const copies = await sql`
        SELECT id FROM library.book_copies 
        WHERE barcode = ${result.data.barcode} AND status = 'available'
      `;
      if (copies.length === 0) throw new ValidationError('Book copy not available or not found');
      copyId = copies[0].id;
    } else if (result.data.bookId) {
      const copies = await sql`
        SELECT id FROM library.book_copies 
        WHERE book_id = ${result.data.bookId} AND status = 'available'
        LIMIT 1
      `;
      if (copies.length === 0) throw new ValidationError('No available copies for this book');
      copyId = copies[0].id;
    } else {
      throw new ValidationError('Either barcode or bookId must be provided');
    }

    console.log(`[Library] Found available copy: ${copyId}`);

    // 2. Insert issue
    const issueRows = await sql`
      INSERT INTO library.issues (copy_id, member_user_id, issued_by, due_at)
      VALUES (${copyId}, ${memberId}, ${request.ctx!.userId}, ${dueDate})
      RETURNING id
    `;

    // 3. Update copy status
    await sql`
      UPDATE library.book_copies SET status = 'issued' WHERE id = ${copyId}
    `;

    console.log(`[Library] Successfully issued. Issue ID: ${issueRows[0].id}`);
    return Response.json({ issueId: issueRows[0].id, message: 'Book issued successfully' });

  } catch (err: any) {
    console.error('[Library] Issue Error:', err);
    if (err instanceof ValidationError) {
      return Response.json({ error: 'VALIDATION_ERROR', message: err.message }, { status: 400 });
    }
    return Response.json({ error: 'INTERNAL_ERROR', message: err.message }, { status: 500 });
  }
});

libraryRouter.post('/issues/:issueId/return', requireAuth, async (request, env) => {
  const { issueId } = request.params;
  const sql = createDbClient(env);

  const rows = await sql`
    UPDATE library.issues
    SET returned_at = now(), return_received_by = ${request.ctx!.userId}
    WHERE id = ${issueId} AND returned_at IS NULL
    RETURNING copy_id
  `;

  if (rows.length === 0) throw new NotFoundError('Active issue', issueId);

  await sql`
    UPDATE library.book_copies SET status = 'available' WHERE id = ${rows[0].copy_id}
  `;

  return Response.json({ message: 'Book returned successfully' });
});

const createBookSchema = z.object({
  isbn: z.string(),
  title: z.string(),
  author: z.string(),
  publisher: z.string().optional(),
  pdf_url: z.string().url().optional().or(z.literal('')),
  subject_id: z.string().uuid(),
  copies: z.number().int().min(1).max(100).default(1)
});

libraryRouter.post('/books', requireAuth, async (request, env) => {
  const body = await request.json();
  const result = createBookSchema.safeParse(body);
  if (!result.success) {
    console.error('[Library] Create Validation Failed:', result.error);
    throw new ValidationError('Invalid request body');
  }

  const sql = createDbClient(env);

  try {
    // 1. Create Book
    const bookRows = await sql`
      INSERT INTO library.books (isbn, title, author, publisher, subject_id, pdf_url)
      VALUES (${result.data.isbn}, ${result.data.title}, ${result.data.author}, ${result.data.publisher || null}, ${result.data.subject_id}, ${result.data.pdf_url || null})
      RETURNING id
    `;
    const bookId = bookRows[0].id;

    // 2. Create Copies
    for (let i = 0; i < result.data.copies; i++) {
      const barcode = `${result.data.isbn}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      await sql`
        INSERT INTO library.book_copies (book_id, barcode, status)
        VALUES (${bookId}, ${barcode}, 'available')
      `;
    }

    return Response.json({ id: bookId, message: 'Book and copies created successfully' });
  } catch (err: any) {
    if (err.message.includes('unique constraint')) throw new ValidationError('ISBN already exists');
    throw err;
  }
});

export { libraryRouter };
