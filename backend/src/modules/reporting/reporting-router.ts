

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
  
  const [students, faculty, courses, logs] = await Promise.all([
    sql`SELECT COUNT(*) as count FROM academic.students`,
    sql`SELECT COUNT(*) as count FROM auth.user_roles ur JOIN auth.roles r ON ur.role_id = r.id WHERE r.code = 'faculty'`,
    sql`SELECT COUNT(*) as count FROM academic.course_offerings WHERE status IN ('ongoing', 'scheduled')`,
    sql`
      SELECT 
        l.id, 
        l.operation || ' on ' || l.table_name as action, 
        u.email as user, 
        l.changed_at as time 
      FROM audit.audit_logs l
      LEFT JOIN auth.users u ON l.changed_by = u.id
      ORDER BY l.changed_at DESC
      LIMIT 5
    `
  ]);

  return Response.json({
    totalStudents: students?.[0] ? parseInt(students[0].count) : 0,
    totalFaculty: faculty?.[0] ? parseInt(faculty[0].count) : 0,
    activeCourses: courses?.[0] ? parseInt(courses[0].count) : 0,
    systemHealth: 'Optimal',
    recentActivity: (logs || []).map(l => ({
      id: l.id,
      action: l.action,
      user: l.user || 'System',
      time: l.time
    }))
  });
});

reportingRouter.get('/enrollment-trends', requireAuth, requireRole(['admin']), async (request, env) => {
  const sql = createDbClient(env);
  const rows = await sql`
    SELECT 
      TO_CHAR(enrolled_at, 'Mon') as name,
      COUNT(*) as value
    FROM academic.enrollments
    WHERE enrolled_at > NOW() - INTERVAL '6 months'
    GROUP BY TO_CHAR(enrolled_at, 'Mon'), DATE_TRUNC('month', enrolled_at)
    ORDER BY DATE_TRUNC('month', enrolled_at)
  `;
  return Response.json(rows);
});

export { reportingRouter };
