

import { AutoRouter } from 'itty-router';
import { createDbClient } from '../../infrastructure/database/connection';
import { requireAuth, requireRole } from '../../core/middleware/auth';
import type { Env } from '../../core/types/env';
import type { AuthenticatedRequest } from '../../core/types/context';

const reportingRouter = AutoRouter<AuthenticatedRequest, [Env]>({ base: '/api/v1/reporting' });

reportingRouter.get('/gpa-distribution', requireAuth, requireRole(['admin']), async (request, env) => {
  const sql = createDbClient(env);
  const rows = await sql`
    SELECT
      WIDTH_BUCKET(cumulative_gpa, 0, 10, 10) AS bucket,
      COUNT(*) AS student_count
    FROM reporting.mv_student_gpa_summary
    GROUP BY bucket ORDER BY bucket
  `;
  return Response.json(rows);
});

reportingRouter.get('/hostel-stats', requireAuth, async (request, env) => {
  const sql = createDbClient(env);
  const rows = await sql`SELECT * FROM reporting.mv_hostel_occupancy_stats`;
  return Response.json(rows);
});

reportingRouter.post('/refresh/:mvName', requireAuth, requireRole(['admin']), async (request, env) => {
  const { mvName } = request.params;
  const sql = createDbClient(env);

  await sql`CALL reporting.refresh_if_stale(${mvName})`;
  return Response.json({ message: `Materialized view ${mvName} refresh triggered` });
});

export { reportingRouter };
