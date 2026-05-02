#!/usr/bin/env node
import pg from 'pg';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function getDatabaseUrl() {
  if (process.env.DATABASE_DIRECT_URL) return process.env.DATABASE_DIRECT_URL;
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  try {
    const devVars = await readFile(join(__dirname, '..', '.dev.vars'), 'utf-8');
    for (const line of devVars.split('\n')) {
      const trimmed = line.trim();
      if (trimmed.startsWith('DATABASE_URL=') && !trimmed.startsWith('#')) {
        return trimmed.split('=').slice(1).join('=');
      }
    }
  } catch {}
  throw new Error('No DATABASE_URL found');
}

async function main() {
  const url = await getDatabaseUrl();
  console.log('🔌 Connecting to Neon for DB seeding...');
  const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();

  console.log('🌱 Seeding database...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Roles & Permissions (Fixed data, but essential)
  await client.query(`
    INSERT INTO auth.roles (id, code, name, description, is_system) VALUES
      ('00000000-0000-0000-0000-000000000001', 'admin', 'System Administrator', 'Full access', true),
      ('00000000-0000-0000-0000-000000000002', 'student', 'Student', 'Student access', true),
      ('00000000-0000-0000-0000-000000000003', 'faculty', 'Faculty', 'Faculty access', true)
    ON CONFLICT (code) DO NOTHING;
  `);

  // 2. Base Admin User
  const adminRes = await client.query(`
    INSERT INTO auth.users (email, first_name, last_name, password_hash, status)
    VALUES ('admin@uims.edu', 'Admin', 'User', $1, 'active')
    RETURNING id
  `, [passwordHash]);
  const adminId = adminRes.rows[0].id;
  await client.query(`
    INSERT INTO auth.user_roles (user_id, role_id)
    VALUES ($1, '00000000-0000-0000-0000-000000000001')
  `, [adminId]);

  // 3. Departments, Programs, Semesters
  const deptRes = await client.query(`
    INSERT INTO academic.departments (code, name, established_year)
    VALUES ('CSE', 'Computer Science and Engineering', 1990)
    RETURNING id
  `);
  const cseId = deptRes.rows[0].id;

  const progRes = await client.query(`
    INSERT INTO academic.programs (department_id, code, name, degree_type, duration_semesters)
    VALUES ($1, 'BTECH-CSE', 'B.Tech in Computer Science', 'BTech', 8)
    RETURNING id
  `, [cseId]);
  const btechCseId = progRes.rows[0].id;

  const semRes = await client.query(`
    INSERT INTO academic.semesters (code, name, academic_year, start_date, end_date, is_current)
    VALUES ('2024-ODD', 'Fall 2024', 2024, '2024-08-01', '2024-12-15', TRUE)
    RETURNING id
  `);
  const semId = semRes.rows[0].id;

  // 4. Faculty
  const facUsers = [];
  for(let i = 0; i < 2; i++) {
    const fn = faker.person.firstName();
    const ln = faker.person.lastName();
    const email = faker.internet.email({ firstName: fn, lastName: ln, provider: 'uims.edu' });
    const res = await client.query(`
      INSERT INTO auth.users (email, first_name, last_name, password_hash, status)
      VALUES ($1, $2, $3, $4, 'active') RETURNING id
    `, [email, fn, ln, passwordHash]);
    facUsers.push(res.rows[0].id);

    await client.query(`
      INSERT INTO auth.user_roles (user_id, role_id)
      VALUES ($1, '00000000-0000-0000-0000-000000000003')
    `, [res.rows[0].id]);

    await client.query(`
      INSERT INTO academic.faculty (user_id, employee_no, department_id, designation)
      VALUES ($1, $2, $3, 'Assistant Professor')
    `, [res.rows[0].id, faker.string.alphanumeric(8).toUpperCase(), cseId]);
  }

  // 5. 3 Students (Dynamic generation)
  console.log('🧑‍🎓 Generating 3 Students...');
  for(let i = 0; i < 3; i++) {
    const fn = faker.person.firstName();
    const ln = faker.person.lastName();
    const email = faker.internet.email({ firstName: fn, lastName: ln, provider: 'student.uims.edu' });
    
    const userRes = await client.query(`
      INSERT INTO auth.users (email, first_name, last_name, password_hash, status)
      VALUES ($1, $2, $3, $4, 'active') RETURNING id
    `, [email, fn, ln, passwordHash]);
    const userId = userRes.rows[0].id;

    await client.query(`
      INSERT INTO auth.user_roles (user_id, role_id)
      VALUES ($1, '00000000-0000-0000-0000-000000000002')
    `, [userId]);

    await client.query(`
      INSERT INTO academic.students (user_id, student_no, department_id, program_id, admission_year, current_semester)
      VALUES ($1, $2, $3, $4, 2024, 1)
    `, [userId, 'STU' + faker.string.numeric(6), cseId, btechCseId]);
  }

  // Hostel & Library base data for relationships
  const hostelRes = await client.query(`
    INSERT INTO hostel.hostels (name, code, gender_type, total_capacity)
    VALUES ('Alpha Hostel', 'H1', 'mixed', 100) RETURNING id
  `);
  const hostelId = hostelRes.rows[0].id;

  const blockRes = await client.query(`
    INSERT INTO hostel.blocks (hostel_id, name, floor_count)
    VALUES ($1, 'Block A', 3) RETURNING id
  `, [hostelId]);

  await client.query(`
    INSERT INTO hostel.rooms (block_id, room_no, floor_no, capacity)
    VALUES ($1, '101', 1, 2)
  `, [blockRes.rows[0].id]);

  const pubRes = await client.query(`
    INSERT INTO library.publishers (name) VALUES ('Tech Press') RETURNING id
  `);
  await client.query(`
    INSERT INTO library.books (isbn, title, publisher_id)
    VALUES ('978-3-16-148410-0', 'Introduction to Algorithms', $1)
  `, [pubRes.rows[0].id]);

  console.log('✅ Seeding complete.');
  await client.end();
}

main().catch(console.error);
