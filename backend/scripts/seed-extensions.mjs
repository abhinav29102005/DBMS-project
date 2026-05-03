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
  for (const student of students) {
    for (const off of offerings) {
      // Create 10 days of attendance per student per offering
      for (let i = 0; i < 10; i++) {
        const status = Math.random() > 0.15 ? 'present' : 'absent';
        await sql`
          INSERT INTO academic.attendance (student_id, course_offering_id, date, status)
          VALUES (${student.id}, ${off.id}, CURRENT_DATE - ${i}, ${status})
          ON CONFLICT DO NOTHING
        `;
      }
    }
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
  for (const student of students) {
    await sql`
      INSERT INTO core.notifications (user_id, title, message, type)
      VALUES 
        (${student.user_id}, 'Welcome to UIMS', 'Your academic profile is now active. Explore your dashboard.', 'success'),
        (${student.user_id}, 'Registration Open', 'Course registration for the next semester starts tomorrow.', 'info'),
        (${student.user_id}, 'Library Overdue', 'Please return "Introduction to Algorithms" by Friday.', 'warning')
      ON CONFLICT DO NOTHING
    `;
  }

  console.log('Extensions seeded successfully!');
}

seedExtensions().catch(console.error);
