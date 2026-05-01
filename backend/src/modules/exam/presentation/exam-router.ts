/**
 * UIMS Exam Module — Exam Router
 */

import { AutoRouter } from 'itty-router';
import { createDbClient } from '../../../infrastructure/database/connection';
import { requireAuth, requirePermission } from '../../../core/middleware/auth';
import { ValidationError, NotFoundError } from '../../../core/errors/app-error';
import { z } from 'zod';
import type { Env } from '../../../core/types/env';
import type { AuthenticatedRequest } from '../../../core/types/context';

const examRouter = AutoRouter<AuthenticatedRequest, [Env]>({ base: '/api/v1/exam' });

// ─── List Student Results ───────────────────────────────────
examRouter.get('/my-results', requireAuth, async (request, env) => {
  const sql = createDbClient(env);
  const rows = await sql`
    SELECT * FROM exam.v_student_results
    WHERE student_id = (SELECT id FROM academic.students WHERE user_id = ${request.ctx!.userId})
  `;
  return Response.json(rows);
});

// ─── Publish Results (Admin/Controller) ──────────────────────
const publishSchema = z.object({
  offeringId: z.string().uuid()
});

examRouter.post('/publish', requireAuth, requirePermission('exam.result.publish'), async (request, env) => {
  const body = await request.json();
  const result = publishSchema.safeParse(body);
  if (!result.success) throw new ValidationError('Invalid request body');

  const sql = createDbClient(env);
  
  // CALL procedure
  await sql`CALL exam.publish_results(${result.data.offeringId}, ${request.ctx!.userId})`;

  return Response.json({ message: 'Results published successfully' });
});

// ─── Rank Students ──────────────────────────────────────────
examRouter.get('/rankings/:deptId', requireAuth, async (request, env) => {
  const { deptId } = request.params;
  const sql = createDbClient(env);

  const rows = await sql`
    SELECT
      student_no, gpa,
      RANK() OVER (ORDER BY gpa DESC) as dept_rank
    FROM reporting.mv_student_gpa_summary
    WHERE department_id = ${deptId}
  `;

  return Response.json(rows);
});

export { examRouter };
