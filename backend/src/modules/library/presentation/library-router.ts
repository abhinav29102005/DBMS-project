

import { AutoRouter } from 'itty-router';
import { createDbClient } from '../../../infrastructure/database/connection';
import { requireAuth } from '../../../core/middleware/auth';
import { ValidationError, NotFoundError } from '../../../core/errors/app-error';
import { z } from 'zod';
import { BrevoEmailService } from '../../../infrastructure/events/email';
import type { Env } from '../../../core/types/env';
import type { AuthenticatedRequest } from '../../../core/types/context';

const libraryRouter = AutoRouter<AuthenticatedRequest, [Env]>({ base: '/api/v1/library' });

libraryRouter.get('/books', requireAuth, async (request, env) => {
  const { q, page = '1' } = request.query;
  const sql = createDbClient(env);
  const offset = (parseInt(page as string) - 1) * 20;

  if (q) {
    const rows = await sql`
      SELECT id, isbn, title, edition, author, publisher, ts_rank(search_vector, query) AS rank
      FROM library.books, plainto_tsquery('english', ${q}) query
      WHERE search_vector @@ query AND deleted_at IS NULL
      ORDER BY rank DESC
      LIMIT 20 OFFSET ${offset}
    `;
    return Response.json(rows);
  }

  const rows = await sql`
    SELECT * FROM library.books WHERE deleted_at IS NULL
    ORDER BY title
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
  return Response.json(rows);
});

const issueSchema = z.object({
  barcode: z.string(),
  memberUserId: z.string().uuid(),
  dueAt: z.string()
});

libraryRouter.post('/issue', requireAuth, async (request, env) => {
  const body = await request.json();
  const result = issueSchema.safeParse(body);
  if (!result.success) throw new ValidationError('Invalid request body');

  const sql = createDbClient(env);

  const rows = await sql`
    INSERT INTO library.issues (copy_id, member_user_id, issued_by, due_at)
    SELECT bc.id, ${result.data.memberUserId}, ${request.ctx!.userId}, ${result.data.dueAt}
    FROM library.book_copies bc
    WHERE bc.barcode = ${result.data.barcode} AND bc.status = 'available'
    RETURNING id, copy_id
  `;

  if (rows.length === 0) throw new ValidationError('Copy not available or not found');

  // Send email
  const details = await sql`
    SELECT u.email, u.first_name, b.title, bc.barcode
    FROM auth.users u
    CROSS JOIN library.books b
    JOIN library.book_copies bc ON b.id = bc.book_id
    WHERE u.id = ${result.data.memberUserId} AND bc.id = ${rows[0].copy_id}
  `;

  if (details.length > 0) {
    const emailService = new BrevoEmailService(env.BREVO_API_KEY);
    await emailService.send({
      to: details[0].email,
      subject: 'Library Book Issued',
      text: `Hello ${details[0].first_name},\n\nYou have been issued "${details[0].title}" (Barcode: ${details[0].barcode}).\nDue Date: ${new Date(result.data.dueAt).toLocaleDateString()}`,
      html: `<h1>Book Issued</h1><p>Hello <strong>${details[0].first_name}</strong>,</p><p>You have been issued <strong>"${details[0].title}"</strong>.</p><p>Barcode: ${details[0].barcode}<br>Due Date: ${new Date(result.data.dueAt).toLocaleDateString()}</p>`
    }).catch(console.error);
  }

  return Response.json({ issueId: rows[0].id });
});

libraryRouter.patch('/return/:issueId', requireAuth, async (request, env) => {
  const { issueId } = request.params;
  const sql = createDbClient(env);

  const rows = await sql`
    UPDATE library.issues
    SET returned_at = now(), return_received_by = ${request.ctx!.userId}
    WHERE id = ${issueId} AND returned_at IS NULL
    RETURNING copy_id
  `;

  if (rows.length === 0) throw new NotFoundError('Active issue', issueId);

  return Response.json({ message: 'Book returned successfully' });
});

export { libraryRouter };
