import { neon } from '@neondatabase/serverless';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function getDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  try {
    const devVars = await readFile(join(__dirname, '..', '.dev.vars'), 'utf-8');
    for (const line of devVars.split('\n')) {
      const trimmed = line.trim();
      if (trimmed.startsWith('DATABASE_URL=') && !trimmed.startsWith('#')) {
        return trimmed.split('=').slice(1).join('=').replace(/^["']|["']$/g, '');
      }
    }
  } catch {}
  return null;
}

const url = await getDatabaseUrl();
if (!url) {
  console.error('❌ No DATABASE_URL found.');
  process.exit(1);
}
const sql = neon(url);

async function seedExtensions() {
  console.log('Seeding extended features...');

  // 1. Get all students
  const students = await sql`SELECT id, user_id FROM academic.students`;
  if (students.length === 0) {
    console.log('No students found. Run main seed first.');
    return;
  }

  // 2. Get course offerings
  const offerings = await sql`SELECT id FROM academic.course_offerings LIMIT 3`;
  
  // 3. Seed Attendance for ALL students (simulating 10 days of classes)
  console.log(`Generating attendance for ${students.length} students...`);
  const attendanceValues = [];
  for (const student of students) {
    for (const off of offerings) {
      for (let i = 0; i < 10; i++) {
        const status = Math.random() > 0.15 ? 'present' : 'absent';
        const date = new Date();
        date.setDate(date.getDate() - i);
        attendanceValues.push({
          sid: student.id,
          oid: off.id,
          date: date.toISOString().split('T')[0],
          status
        });
      }
    }
  }
  
  // Bulk insert in chunks of 500
  for (let i = 0; i < attendanceValues.length; i += 500) {
    const chunk = attendanceValues.slice(i, i + 500);
    const query = `
      INSERT INTO academic.attendance (student_id, course_offering_id, date, status)
      VALUES ${chunk.map((_, idx) => `($${idx * 4 + 1}, $${idx * 4 + 2}, $${idx * 4 + 3}, $${idx * 4 + 4})`).join(', ')}
      ON CONFLICT DO NOTHING
    `;
    const params = chunk.flatMap(v => [v.sid, v.oid, v.date, v.status]);
    await sql(query, params);
  }

  // 4. Seed Schedule
  const days = [1, 2, 3, 4, 5]; // Mon-Fri
  for (let i = 0; i < offerings.length; i++) {
    await sql`
      INSERT INTO academic.schedules (course_offering_id, day_of_week, start_time, end_time, room)
      VALUES (${offerings[i].id}, ${days[i]}, '09:00:00', '11:00:00', ${'Lab ' + (400 + i)})
      ON CONFLICT DO NOTHING
    `;
  }

  // 5. Seed Notifications for ALL students
  console.log(`Generating notifications for ${students.length} students...`);
  const notificationValues = [];
  for (const student of students) {
    notificationValues.push([student.user_id, 'Welcome to UIMS', 'Your academic profile is now active.', 'success']);
    notificationValues.push([student.user_id, 'Registration Open', 'Course registration starts tomorrow.', 'info']);
  }
  
  for (let i = 0; i < notificationValues.length; i += 500) {
    const chunk = notificationValues.slice(i, i + 500);
    const query = `
      INSERT INTO core.notifications (user_id, title, message, type)
      VALUES ${chunk.map((_, idx) => `($${idx * 4 + 1}, $${idx * 4 + 2}, $${idx * 4 + 3}, $${idx * 4 + 4})`).join(', ')}
      ON CONFLICT DO NOTHING
    `;
    await sql(query, chunk.flat());
  }

  console.log('Extensions seeded successfully!');
}

seedExtensions().catch(console.error);
