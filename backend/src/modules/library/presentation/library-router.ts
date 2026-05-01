

import { AutoRouter } from 'itty-router';
import { createDbClient } from '../../../infrastructure/database/connection';
import { requireAuth } from '../../../core/middleware/auth';
import { ValidationError, NotFoundError } from '../../../core/errors/app-error';
import { z } from 'zod';
import type { Env } from '../../../core/types/env';
import type { AuthenticatedRequest } from '../../../core/types/context';

const libraryRouter = AutoRouter<AuthenticatedRequest, [Env]>({ base: '/api/v1/library' });

libraryRouter.get('/search', requireAuth, async (request, env) => {
  const { q } = request.query;
  if (!q) throw new ValidationError('Query parameter q is required');

  const sql = createDbClient(env);
  const rows = await sql`
    SELECT isbn, title, edition, ts_rank(search_vector, query) AS rank
    FROM library.books, plainto_tsquery('english', ${q}) query
    WHERE search_vector @@ query
    ORDER BY rank DESC
    LIMIT 20
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
    SELECT id, ${result.data.memberUserId}, ${request.ctx!.userId}, ${result.data.dueAt}
    FROM library.book_copies
    WHERE barcode = ${result.data.barcode} AND status = 'available'
    RETURNING id
  `;

  if (rows.length === 0) throw new ValidationError('Copy not available or not found');

  return Response.json({ issueId: rows[0].id });
});

libraryRouter.patch('/return/:issueId', requireAuth, async (request, env) => {
  const { issueId } = request.params;
  const sql = createDbClient(env);

  const rows = await sql`
    UPDATE library.issues
    SET returned_at = now(), return_received_by = ${request.ctx!.userId}
    WHERE id = ${issueId} AND returned_at IS NULL
    RETURNING id
  `;

  if (rows.length === 0) throw new NotFoundError('Active issue', issueId);

  return Response.json({ message: 'Book returned successfully' });
});

export { libraryRouter };
