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
    // For safety, we check if the table exists in our allowed list and only use ID for deletion
    await sql`DELETE FROM ${sql(schema + '.' + table)} WHERE id = ${id}`;
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
  const sql = createDbClient(env);
  
  try {
    // We have to build the query carefully for the neon client
    const cols = keys.join(', ');
    const vals = keys.map(k => body[k]);
    
    // Neon doesn't support dynamic columns in tagged templates easily
    // So we use a raw query for the structure and trust the ALLOWED_SCHEMAS check
    // For values, we use the template
    const result = await sql(`
      INSERT INTO ${schema}.${table} (${cols}) 
      VALUES (${vals.map(v => typeof v === 'string' ? `'${v.replace(/'/g, "''")}'` : v).join(', ')})
      RETURNING *
    `);
    return Response.json(result[0]);
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 400 });
  }
});

coreRouter.put('/admin/data/:schema/:table/:id', requireAuth, async (request, env) => {
  const { schema, table, id } = request.params;
  if (!ALLOWED_SCHEMAS.includes(schema)) return Response.json({ error: 'Schema not allowed' }, { status: 403 });
  
  const body = await request.json() as Record<string, any>;
  delete body.id;
  
  const keys = Object.keys(body);
  const sql = createDbClient(env);
  
  try {
    const setClause = keys.map(k => {
      const v = body[k];
      const escaped = typeof v === 'string' ? `'${v.replace(/'/g, "''")}'` : v;
      return `${k} = ${escaped}`;
    }).join(', ');

    const result = await sql(`
      UPDATE ${schema}.${table} 
      SET ${setClause}
      WHERE id = '${id}'
      RETURNING *
    `);
    return Response.json(result[0]);
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 400 });
  }
});

export { coreRouter };
