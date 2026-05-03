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
  console.log('🔌 Connecting to Neon for comprehensive DB seeding...');
  const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();

  console.log('🌱 Starting full system seed...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Core / Auth Initialization
  await client.query(`
    INSERT INTO auth.roles (id, code, name, description, is_system) VALUES
      ('00000000-0000-0000-0000-000000000001', 'admin', 'System Administrator', 'Full access', true),
      ('00000000-0000-0000-0000-000000000002', 'student', 'Student', 'Student access', true),
      ('00000000-0000-0000-0000-000000000003', 'faculty', 'Faculty', 'Faculty access', true)
    ON CONFLICT (code) DO NOTHING;
  `);

  await client.query(`
    INSERT INTO core.system_settings (setting_key, setting_value) VALUES
    ('university_name', 'Global Technical University'),
    ('academic_year', '2024-2025'),
    ('maintenance_mode', 'false')
    ON CONFLICT (setting_key) DO NOTHING;
  `);

  // 2. Admin User
  let adminId;
  const adminCheck = await client.query('SELECT id FROM auth.users WHERE email = $1', ['admin@gtu.edu']);
  if (adminCheck.rows.length > 0) {
    adminId = adminCheck.rows[0].id;
  } else {
    const adminRes = await client.query(`
      INSERT INTO auth.users (email, first_name, last_name, password_hash, status)
      VALUES ('admin@gtu.edu', 'Admin', 'Officer', $1, 'active')
      RETURNING id
    `, [passwordHash]);
    adminId = adminRes.rows[0].id;
  }
  await client.query(`INSERT INTO auth.user_roles (user_id, role_id) VALUES ($1, '00000000-0000-0000-0000-000000000001') ON CONFLICT DO NOTHING`, [adminId]);

  // 2b. Staff User (alias to admin role for now)
  let staffId;
  const staffCheck = await client.query('SELECT id FROM auth.users WHERE email = $1', ['staff@gtu.edu']);
  if (staffCheck.rows.length > 0) {
    staffId = staffCheck.rows[0].id;
  } else {
    const staffRes = await client.query(`
      INSERT INTO auth.users (email, first_name, last_name, password_hash, status)
      VALUES ('staff@gtu.edu', 'Support', 'Staff', $1, 'active')
      RETURNING id
    `, [passwordHash]);
    staffId = staffRes.rows[0].id;
  }
  await client.query(`INSERT INTO auth.user_roles (user_id, role_id) VALUES ($1, '00000000-0000-0000-0000-000000000001') ON CONFLICT DO NOTHING`, [staffId]);


  // 3. Academic Structure
  const deptRes = await client.query(`
    INSERT INTO academic.departments (code, name, established_year)
    VALUES ('CSE', 'Computer Science and Engineering', 1995)
    ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
    RETURNING id
  `);
  const cseId = deptRes.rows[0].id;

  const progRes = await client.query(`
    INSERT INTO academic.programs (department_id, code, name, degree_type, duration_semesters)
    VALUES ($1, 'BTECH-CSE', 'B.Tech in Computer Science', 'BTech', 8)
    ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
    RETURNING id
  `, [cseId]);
  const btechCseId = progRes.rows[0].id;

  const semRes = await client.query(`
    INSERT INTO academic.semesters (code, name, academic_year, start_date, end_date, is_current)
    VALUES ('SEM2024-1', 'Fall Semester 2024', 2024, '2024-08-01', '2024-12-15', TRUE)
    ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
    RETURNING id
  `);
  const currentSemId = semRes.rows[0].id;

  // 4. Courses & Offerings
  const courseRes = await client.query(`
    INSERT INTO academic.courses (course_code, title, credits, department_id, course_type)
    VALUES ('CS101', 'Introduction to Programming', 4, $1, 'core')
    ON CONFLICT (course_code) DO UPDATE SET title = EXCLUDED.title
    RETURNING id
  `, [cseId]);
  const courseId = courseRes.rows[0].id;

  // Offerings don't have a unique single column, but we can try inserting and handle conflicts if section exists.
  // Actually, wait, offering unique constraint might be (course_id, semester_id, section_code).
  let offeringId;
  try {
    const offeringRes = await client.query(`
      INSERT INTO academic.course_offerings (course_id, semester_id, section_code, capacity, status)
      VALUES ($1, $2, 'A', 60, 'ongoing')
      RETURNING id
    `, [courseId, currentSemId]);
    offeringId = offeringRes.rows[0].id;
  } catch (err) {
    const offeringRes = await client.query(`
      SELECT id FROM academic.course_offerings WHERE course_id = $1 AND semester_id = $2 AND section_code = 'A'
    `, [courseId, currentSemId]);
    offeringId = offeringRes.rows[0].id;
  }

  // 5. Faculty
  const facultyIds = [];
  console.log('Generating 50 faculty members...');
  for (let i = 0; i < 50; i++) {
    const fn = faker.person.firstName();
    const ln = faker.person.lastName();
    const email = faker.internet.email({ firstName: fn, lastName: ln, provider: 'gtu.edu' }).toLowerCase();
    
    // Check if email exists (unlikely but possible with faker)
    const existing = await client.query('SELECT id FROM auth.users WHERE email = $1', [email]);
    if (existing.rows.length > 0) continue;

    const uRes = await client.query(`
      INSERT INTO auth.users (email, first_name, last_name, password_hash, status)
      VALUES ($1, $2, $3, $4, 'active') RETURNING id
    `, [email, fn, ln, passwordHash]);
    const uId = uRes.rows[0].id;
    await client.query(`INSERT INTO auth.user_roles (user_id, role_id) VALUES ($1, '00000000-0000-0000-0000-000000000003')`, [uId]);
    
    const designations = ['Professor', 'Associate Professor', 'Assistant Professor'];
    const fRes = await client.query(`
      INSERT INTO academic.faculty (user_id, employee_no, department_id, designation)
      VALUES ($1, $2, $3, $4) RETURNING id
    `, [uId, 'FAC' + faker.string.numeric(5), cseId, faker.helpers.arrayElement(designations)]);
    facultyIds.push(fRes.rows[0].id);
  }
  // Ensure the specific faculty exists for UI quick access
  const defaultFacEmail = 'sushain.sharma@gtu.edu';
  let defaultFacRes = await client.query('SELECT id FROM auth.users WHERE email = $1', [defaultFacEmail]);
  if (defaultFacRes.rows.length === 0) {
    defaultFacRes = await client.query(`
      INSERT INTO auth.users (email, first_name, last_name, password_hash, status)
      VALUES ($1, 'Sushain', 'Sharma', $2, 'active') RETURNING id
    `, [defaultFacEmail, passwordHash]);
    const dId = defaultFacRes.rows[0].id;
    await client.query(`INSERT INTO auth.user_roles (user_id, role_id) VALUES ($1, '00000000-0000-0000-0000-000000000003')`, [dId]);
    await client.query(`
      INSERT INTO academic.faculty (user_id, employee_no, department_id, designation)
      VALUES ($1, $2, $3, 'Professor')
    `, [dId, 'FAC00001', cseId]);
  }

  // 6. Specific Students from Image
  const students = [
    { fn: 'Sushain', ln: 'Sharma', roll: '1024030439', email: 'sushain.sharma@student.gtu.edu' },
    { fn: 'Manan', ln: 'Kapoor', roll: '1024030467', email: 'manan.kapoor@student.gtu.edu' },
    { fn: 'Abhinav Kumar', ln: 'Singh', roll: '1024030440', email: 'asingh3_be24@thapar.edu' }
  ];

  const studentData = [];
  console.log('Generating specific students...');
  for (const s of students) {
    const email = s.email;
    let uId;
    
    const existing = await client.query('SELECT id FROM auth.users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      uId = existing.rows[0].id;
    } else {
      const userRes = await client.query(`
        INSERT INTO auth.users (email, first_name, last_name, password_hash, status)
        VALUES ($1, $2, $3, $4, 'active') RETURNING id
      `, [email, s.fn, s.ln, passwordHash]);
      uId = userRes.rows[0].id;
      await client.query(`INSERT INTO auth.user_roles (user_id, role_id) VALUES ($1, '00000000-0000-0000-0000-000000000002')`, [uId]);
    }

    const stuRes = await client.query(`
      INSERT INTO academic.students (user_id, student_no, department_id, program_id, admission_year, current_semester)
      VALUES ($1, $2, $3, $4, 2024, 1)
      ON CONFLICT (student_no) DO UPDATE SET 
        user_id = EXCLUDED.user_id,
        current_semester = EXCLUDED.current_semester
      RETURNING id
    `, [uId, s.roll, cseId, btechCseId]);
    const stuId = stuRes.rows[0].id;
    studentData.push({ uId, stuId });

    // Enroll them
    await client.query(`
      INSERT INTO academic.enrollments (student_id, course_offering_id, enrollment_status)
      VALUES ($1, $2, 'enrolled')
      ON CONFLICT (student_id, course_offering_id) DO NOTHING
    `, [stuId, offeringId]);
  }

  console.log('Generating 200 random students...');
  for (let i = 0; i < 200; i++) {
    const fn = faker.person.firstName();
    const ln = faker.person.lastName();
    const email = faker.internet.email({ firstName: fn, lastName: ln, provider: 'student.gtu.edu' }).toLowerCase();
    
    const existing = await client.query('SELECT id FROM auth.users WHERE email = $1', [email]);
    if (existing.rows.length > 0) continue;

    const userRes = await client.query(`
      INSERT INTO auth.users (email, first_name, last_name, password_hash, status)
      VALUES ($1, $2, $3, $4, 'active') RETURNING id
    `, [email, fn, ln, passwordHash]);
    const uId = userRes.rows[0].id;

    await client.query(`INSERT INTO auth.user_roles (user_id, role_id) VALUES ($1, '00000000-0000-0000-0000-000000000002')`, [uId]);

    const stuRes = await client.query(`
      INSERT INTO academic.students (user_id, student_no, department_id, program_id, admission_year, current_semester)
      VALUES ($1, $2, $3, $4, 2024, 1)
      ON CONFLICT (student_no) DO UPDATE SET 
        user_id = EXCLUDED.user_id,
        current_semester = EXCLUDED.current_semester
      RETURNING id
    `, [uId, faker.string.numeric(10), cseId, btechCseId]);
    const stuId = stuRes.rows[0].id;
    studentData.push({ uId, stuId });

    // Enroll them in the offering
    await client.query(`
      INSERT INTO academic.enrollments (student_id, course_offering_id, enrollment_status)
      VALUES ($1, $2, 'enrolled')
      ON CONFLICT (student_id, course_offering_id) DO NOTHING
    `, [stuId, offeringId]);
  }

  // 7. Exam Data
  const examTypeRes = await client.query(`
    INSERT INTO exam.exam_types (code, name)
    VALUES ('MIDTERM', 'Mid-Term Examination') RETURNING id
  `);
  const examRes = await client.query(`
    INSERT INTO exam.exams (course_offering_id, exam_type_id, name, max_marks, weightage_percent, scheduled_at)
    VALUES ($1, $2, 'Mid-Term Exam Fall 2024', 100, 30, '2024-10-15') RETURNING id
  `, [offeringId, examTypeRes.rows[0].id]);

  for (const s of studentData) {
    await client.query(`
      INSERT INTO exam.marks (exam_id, student_id, marks_obtained, graded_by)
      VALUES ($1, $2, $3, $4)
    `, [examRes.rows[0].id, s.stuId, faker.number.int({ min: 60, max: 95 }), adminId]);
  }

  // 8. Hostel System
  const hostelRes = await client.query(`
    INSERT INTO hostel.hostels (name, code, gender_type, total_capacity)
    VALUES ('Bose Bhawan', 'BB1', 'male', 200) ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name RETURNING id
  `);
  const hId = hostelRes.rows[0].id;
  const blockRes = await client.query(`INSERT INTO hostel.blocks (hostel_id, name, floor_count) VALUES ($1, 'A-Block', 4) ON CONFLICT (hostel_id, name) DO UPDATE SET floor_count = EXCLUDED.floor_count RETURNING id`, [hId]);
  const roomRes = await client.query(`INSERT INTO hostel.rooms (block_id, room_no, floor_no, capacity) VALUES ($1, '101', 1, 100) ON CONFLICT (block_id, room_no) DO UPDATE SET capacity = EXCLUDED.capacity RETURNING id`, [blockRes.rows[0].id]);
  
  console.log('Allocating 100 students to hostel...');
  for (let i = 0; i < 100 && i < studentData.length; i++) {
    const bedRes = await client.query(`INSERT INTO hostel.beds (room_id, bed_label, status) VALUES ($1, $2, 'occupied') ON CONFLICT (room_id, bed_label) DO UPDATE SET status = EXCLUDED.status RETURNING id`, [roomRes.rows[0].id, 'Bed-' + (i+1)]);
    await client.query(`
      INSERT INTO hostel.allocations (student_id, bed_id, status)
      VALUES ($1, $2, 'active')
    `, [studentData[i].stuId, bedRes.rows[0].id]);
  }

  // 9. Library System
  const subjectRes = await client.query(`INSERT INTO library.subjects (code, name) VALUES ('CS', 'Computer Science') RETURNING id`);
  const publisherRes = await client.query(`INSERT INTO library.publishers (name) VALUES ('MIT Press') RETURNING id`);
  const bookRes = await client.query(`
    INSERT INTO library.books (isbn, title, subject_id, publisher_id)
    VALUES ('9780262033848', 'Introduction to Algorithms', $1, $2) RETURNING id
  `, [subjectRes.rows[0].id, publisherRes.rows[0].id]);

  console.log('Issuing books to 100 students...');
  for (let i = 0; i < 100 && i < studentData.length; i++) {
    const copyRes = await client.query(`INSERT INTO library.book_copies (book_id, barcode, status) VALUES ($1, $2, 'issued') RETURNING id`, [bookRes.rows[0].id, 'BAR' + faker.string.numeric(7)]);
    await client.query(`
      INSERT INTO library.issues (copy_id, member_user_id, issued_at, due_at, issued_by)
      VALUES ($1, $2, now(), now() + interval '14 days', $3)
    `, [copyRes.rows[0].id, studentData[i].uId, adminId]);
  }

  // 10. Audit Log (ensure not empty)
  await client.query(`
    INSERT INTO admin.action_logs (action, user_id)
    VALUES ('System Seed Completed', $1)
  `, [adminId]);

  console.log('✨ Data populated in all core modules (Auth, Academic, Exam, Hostel, Library, Admin).');
  console.log('✅ Three specific students added: Sushain, Manan, and Abhinav.');
  
  await client.end();
}

main().catch(console.error);
