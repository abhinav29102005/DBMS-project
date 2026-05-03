import { AutoRouter } from 'itty-router';
import { createDbClient } from '../../../infrastructure/database/connection';
import { requireAuth } from '../../../core/middleware/auth';
import { NotificationRepository } from '../infrastructure/notification-repository';
import type { Env } from '../../../core/types/env';
import type { AuthenticatedRequest } from '../../../core/types/context';

const coreRouter = AutoRouter<AuthenticatedRequest, [Env]>({ base: '/api/v1/core' });

coreRouter.get('/notifications', requireAuth, async (request, env) => {
  const sql = createDbClient(env);
  const repo = new NotificationRepository(sql);
  return Response.json(await repo.getForUser(request.ctx!.userId));
});

coreRouter.patch('/notifications/:id/read', requireAuth, async (request, env) => {
  const { id } = request.params;
  const sql = createDbClient(env);
  const repo = new NotificationRepository(sql);
  await repo.markAsRead(id, request.ctx!.userId);
  return Response.json({ success: true });
});

// Generic DBMS Editor Endpoints
const ALLOWED_SCHEMAS = ['academic', 'auth', 'core', 'exam', 'hostel', 'library'];

coreRouter.get('/admin/data/:schema/:table', requireAuth, async (request, env) => {
  const { schema, table } = request.params;
  const limit = Number(request.query.limit) || 100;
  const offset = Number(request.query.offset) || 0;
  
  if (!ALLOWED_SCHEMAS.includes(schema)) return Response.json({ error: 'Schema not allowed' }, { status: 403 });
  
  const sql = createDbClient(env);
  try {
    const rows = await sql(`SELECT * FROM ${schema}.${table} LIMIT ${limit} OFFSET ${offset}`);
    return Response.json(rows);
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 400 });
  }
});

coreRouter.delete('/admin/data/:schema/:table/:id', requireAuth, async (request, env) => {
  const { schema, table, id } = request.params;
  if (!ALLOWED_SCHEMAS.includes(schema)) return Response.json({ error: 'Schema not allowed' }, { status: 403 });
  
  const sql = createDbClient(env);
  try {
    // Determine the primary key column (assuming 'id' for most, fallback to first column or error)
    // For simplicity in this DBMS UI, we assume 'id' column exists
    await sql(`DELETE FROM ${schema}.${table} WHERE id = $1`, [id]);
    return Response.json({ success: true });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 400 });
  }
});

coreRouter.post('/admin/data/:schema/:table', requireAuth, async (request, env) => {
  const { schema, table } = request.params;
  if (!ALLOWED_SCHEMAS.includes(schema)) return Response.json({ error: 'Schema not allowed' }, { status: 403 });
  
  const body = await request.json() as Record<string, any>;
  const keys = Object.keys(body);
  const values = Object.values(body);
  
  const sql = createDbClient(env);
  try {
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    const cols = keys.join(', ');
    const result = await sql(`INSERT INTO ${schema}.${table} (${cols}) VALUES (${placeholders}) RETURNING *`, values);
    return Response.json(result[0]);
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 400 });
  }
});

coreRouter.put('/admin/data/:schema/:table/:id', requireAuth, async (request, env) => {
  const { schema, table, id } = request.params;
  if (!ALLOWED_SCHEMAS.includes(schema)) return Response.json({ error: 'Schema not allowed' }, { status: 403 });
  
  const body = await request.json() as Record<string, any>;
  // Remove id from body to prevent updating PK
  delete body.id;
  const keys = Object.keys(body);
  const values = Object.values(body);
  
  const sql = createDbClient(env);
  try {
    const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
    const result = await sql(`UPDATE ${schema}.${table} SET ${setClause} WHERE id = $1 RETURNING *`, [id, ...values]);
    return Response.json(result[0]);
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 400 });
  }
});

export { coreRouter };
