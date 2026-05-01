

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

reportingRouter.get('/admin/stats', requireAuth, requireRole(['admin']), async (request, env) => {
  const sql = createDbClient(env);
  
  const [students, faculty, courses] = await Promise.all([
    sql`SELECT COUNT(*) as count FROM academic.students`,
    sql`SELECT COUNT(*) as count FROM auth.user_roles ur JOIN auth.roles r ON ur.role_id = r.id WHERE r.code = 'faculty'`,
    sql`SELECT COUNT(*) as count FROM academic.course_offerings WHERE status = 'active'`
  ]);

  return Response.json({
    totalStudents: parseInt(students[0].count),
    totalFaculty: parseInt(faculty[0].count),
    activeCourses: parseInt(courses[0].count),
    systemHealth: 'Optimal',
    recentActivity: []
  });
});

export { reportingRouter };
