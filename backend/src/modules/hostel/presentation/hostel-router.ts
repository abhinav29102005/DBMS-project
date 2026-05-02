

import { AutoRouter } from 'itty-router';
import { createDbClient } from '../../../infrastructure/database/connection';
import { requireAuth, requireRole } from '../../../core/middleware/auth';
import { ValidationError, NotFoundError, ForbiddenError } from '../../../core/errors/app-error';
import { z } from 'zod';
import { BrevoEmailService } from '../../../infrastructure/events/email';
import type { Env } from '../../../core/types/env';
import type { AuthenticatedRequest } from '../../../core/types/context';

const hostelRouter = AutoRouter<AuthenticatedRequest, [Env]>({ base: '/api/v1/hostel' });

hostelRouter.get('/hostels', requireAuth, async (request, env) => {
  const sql = createDbClient(env);
  const rows = await sql`SELECT * FROM hostel.hostels WHERE deleted_at IS NULL`;
  return Response.json(rows);
});

hostelRouter.get('/rooms', requireAuth, async (request, env) => {
  const { hostelId } = request.query;
  if (!hostelId) throw new ValidationError('hostelId is required');
  const sql = createDbClient(env);
  const rows = await sql`
    SELECT r.*, b.name as block_name, 
           (SELECT COUNT(*) FROM hostel.beds WHERE room_id = r.id AND status = 'available') as available_beds
    FROM hostel.rooms r
    JOIN hostel.blocks b ON r.block_id = b.id
    WHERE b.hostel_id = ${hostelId} AND r.deleted_at IS NULL
  `;
  return Response.json(rows);
});

hostelRouter.get('/my-allocation', requireAuth, requireRole(['student']), async (request, env) => {
  const sql = createDbClient(env);
  const rows = await sql`
    SELECT a.*, b.bed_label, b.qr_code_id, r.room_no, bl.name as block_name, h.name as hostel_name
    FROM hostel.allocations a
    JOIN hostel.beds b ON a.bed_id = b.id
    JOIN hostel.rooms r ON b.room_id = r.id
    JOIN hostel.blocks bl ON r.block_id = bl.id
    JOIN hostel.hostels h ON bl.hostel_id = h.id
    JOIN academic.students s ON a.student_id = s.id
    WHERE s.user_id = ${request.ctx!.userId} AND a.status = 'active'
  `;
  return Response.json(rows[0] || null);
});

const allocateSchema = z.object({
  studentId: z.string().uuid().optional(), // For staff/admin to allocate for others
  bedId: z.string().uuid(),
  idempotencyKey: z.string().optional()
});

hostelRouter.post('/allocate', requireAuth, async (request, env) => {
  const body = await request.json();
  const result = allocateSchema.safeParse(body);
  if (!result.success) throw new ValidationError('Invalid request body');

  const sql = createDbClient(env);
  let studentId = result.data.studentId;

  if (!studentId) {
    const studentRows = await sql`SELECT id FROM academic.students WHERE user_id = ${request.ctx!.userId}`;
    if (studentRows.length === 0) throw new ForbiddenError('Only students can request self-allocation');
    studentId = studentRows[0].id;
  } else {
    // Only staff/admin can allocate for others
    if (!['admin', 'staff', 'warden'].includes(request.ctx!.role)) {
      throw new ForbiddenError('Insufficient permissions to allocate for others');
    }
  }

  const key = result.data.idempotencyKey || crypto.randomUUID();

  try {
    const allocationId = await sql`
      SELECT hostel.allocate_bed(${studentId}, ${result.data.bedId}, ${key}, ${request.ctx!.userId})
    `;
    
    // Fetch details for email
    const details = await sql`
      SELECT u.email, u.first_name, b.bed_label, r.room_no, h.name as hostel_name
      FROM academic.students s
      JOIN auth.users u ON s.user_id = u.id
      CROSS JOIN hostel.beds b
      JOIN hostel.rooms r ON b.room_id = r.id
      JOIN hostel.blocks bl ON r.block_id = bl.id
      JOIN hostel.hostels h ON bl.hostel_id = h.id
      WHERE s.id = ${studentId} AND b.id = ${result.data.bedId}
    `;

    if (details.length > 0) {
      const emailService = new BrevoEmailService(env.BREVO_API_KEY);
      await emailService.send({
        to: details[0].email,
        subject: 'Hostel Bed Allocated',
        text: `Hello ${details[0].first_name},\n\nYou have been allocated a bed in ${details[0].hostel_name}.\nRoom: ${details[0].room_no}\nBed: ${details[0].bed_label}`,
        html: `<h1>Hostel Allocation Confirmed</h1><p>Hello <strong>${details[0].first_name}</strong>,</p><p>You have been allocated a bed in <strong>${details[0].hostel_name}</strong>.</p><p>Room: ${details[0].room_no}<br>Bed: ${details[0].bed_label}</p>`
      }).catch(console.error);
    }

    return Response.json({ allocationId: allocationId[0].allocate_bed });
  } catch (err: any) {
    if (err.message.includes('BED_OCCUPIED')) throw new ValidationError('Bed is already occupied');
    if (err.message.includes('ALREADY_ALLOCATED')) throw new ValidationError('Student already has an active allocation');
    throw err;
  }
});

hostelRouter.put('/allocations/:id/vacate', requireAuth, async (request, env) => {
  const { id } = request.params;
  const sql = createDbClient(env);
  
  // Verify ownership or staff role
  const rows = await sql`
    SELECT a.*, s.user_id 
    FROM hostel.allocations a
    JOIN academic.students s ON a.student_id = s.id
    WHERE a.id = ${id} AND a.status = 'active'
  `;
  
  if (rows.length === 0) throw new NotFoundError('Active allocation', id);
  if (rows[0].user_id !== request.ctx!.userId && !['admin', 'staff', 'warden'].includes(request.ctx!.role)) {
    throw new ForbiddenError('Insufficient permissions to vacate this allocation');
  }

  try {
    await sql`
      UPDATE hostel.allocations
      SET status = 'vacated', vacated_by = ${request.ctx!.userId}, updated_at = now()
      WHERE id = ${id};
      
      UPDATE hostel.beds
      SET status = 'available', updated_at = now()
      WHERE id = ${rows[0].bed_id};
    `;
  } catch (err: any) {
    console.error('Vacate error:', err);
    throw err;
  }

  return Response.json({ message: 'Vacated successfully' });
});

export { hostelRouter };
