

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

reportingRouter.get('/library-stats', requireAuth, async (request, env) => {
  const sql = createDbClient(env);
  const rows = await sql`SELECT * FROM reporting.mv_library_stats`;
  return Response.json(rows[0] || { total_books: 0, active_issues: 0, overdue_books: 0 });
});

reportingRouter.post('/refresh/:mvName', requireAuth, requireRole(['admin']), async (request, env) => {
  const { mvName } = request.params;
  const sql = createDbClient(env);

  await sql`CALL reporting.refresh_if_stale(${mvName})`;
  return Response.json({ message: `Materialized view ${mvName} refresh triggered` });
});

reportingRouter.get('/admin/stats', requireAuth, requireRole(['admin']), async (request, env) => {
  const sql = createDbClient(env);
  
  const [students, faculty, courses, logs, users, hostel, library] = await Promise.all([
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
    `,
    sql`SELECT COUNT(*) as count FROM auth.users`,
    sql`SELECT COUNT(*) as count FROM hostel.beds WHERE status = 'occupied'`,
    sql`SELECT * FROM reporting.mv_library_stats`
  ]);

  return Response.json({
    totalStudents: students?.[0] ? parseInt(students[0].count) : 0,
    totalFaculty: faculty?.[0] ? parseInt(faculty[0].count) : 0,
    activeCourses: courses?.[0] ? parseInt(courses[0].count) : 0,
    totalUsers: users?.[0] ? parseInt(users[0].count) : 0,
    hostelOccupancy: hostel?.[0] ? parseInt(hostel[0].count) : 0,
    library: library?.[0] || { total_books: 0, active_issues: 0, overdue_books: 0 },
    systemHealth: '99.9%',
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
      TO_CHAR(registered_at, 'Mon') as name,
      COUNT(*) as value
    FROM academic.enrollments
    WHERE registered_at > NOW() - INTERVAL '6 months'
    GROUP BY TO_CHAR(registered_at, 'Mon'), DATE_TRUNC('month', registered_at)
    ORDER BY DATE_TRUNC('month', registered_at)
  `;
  return Response.json(rows);
});

reportingRouter.get('/staff/stats', requireAuth, requireRole(['staff']), async (request, env) => {
  const sql = createDbClient(env);
  
  const [tickets, events, facilities] = await Promise.all([
    sql`SELECT COUNT(*) as count FROM core.support_tickets WHERE status = 'open'`,
    sql`SELECT COUNT(*) as count FROM core.campus_events WHERE start_time >= NOW() AND start_time < NOW() + INTERVAL '7 days'`,
    sql`SELECT COUNT(*) as count FROM core.facility_requests WHERE status = 'pending'`
  ]);

  return Response.json({
    pendingTickets: parseInt(tickets[0].count),
    upcomingEvents: parseInt(events[0].count),
    pendingFacilities: parseInt(facilities[0].count)
  });
});

export { reportingRouter };
